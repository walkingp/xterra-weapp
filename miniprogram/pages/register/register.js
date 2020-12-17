const { getRaceDetail, updateOrderStatus } = require("../../api/race");
const { orderStatus } = require("../../config/const");
const app = getApp();
// miniprogram/pages/register/register.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    cateId: null,
    isValid: false,
    step: 0,
    group: 0,
    order: null,
    prevEnabled: true,
    nextEnabled: false,
    steps: [
      {
        text: '选择组别',
      },
      {
        text: '选择报名人',
      },
      {
        text: '确认付款',
      },
      {
        text: '完成报名',
      },
    ],
  },
  onComplete(e){
    const { prevEnabled, nextEnabled } = e.detail;
    this.setData({
      prevEnabled,
      nextEnabled
    });
  },
  prevStep(e){
    const step = this.data.step - 1;
    this.setData({
      nextEnabled: true,
      prevEnabled: false,
      isValid: false,
      step
    });
    app.globalData.step = step;
  },
  nextStep(e){
    let { step } = this.data;
    step = step + 1;
    this.setData({
      nextEnabled: false,
      prevEnabled: true,
      isValid: false,
      step
    });
    app.globalData.step = step;
    switch(step){
      case 0:
        break;
      case 1:
        break;
      case 2:
        this.order();
        break;
      case 3:
        this.confirmOrder();
        break;
    }
  },
  order(){
    wx.showLoading({
      title: '加载中',
    })
    let { order } = app.globalData;
    order.userId = app.globalData.userId;
    order.userName = app.globalData.userName;
    order.userInfo = app.globalData.userInfo;
    order.status = orderStatus.pending.status; // 待支付
    order.statusText = orderStatus.pending.statusText;
    order.orderType = '微信支付';
    wx.cloud.callFunction({
      name: 'saveOrder',
      data: {
        data: order
      }
    }).then(async res => {
      console.log(res);
      const { id, orderNum } = res.result;
      
      app.globalData.order.id = id._id;
      app.globalData.order.orderNum = orderNum;
      console.log(app.globalData.order);
      const { order } = app.globalData;
      this.setData({
        order
      }, () => {
        wx.hideLoading({
          success: (res) => {
          },
        })
      });
    }).catch(console.error)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(app.globalData.step){
      const { step } = app.globalData;
      this.setData({
        step
      });
    }
    const { id, cateId } = options;
    this.setData({
      id, cateId
    });
    this.fetch(id);
  },

  async fetch(id){
    wx.showLoading({
      title: '加载中',
    })
    const detail = await getRaceDetail(id);
    detail.disclaimer = app.towxml(detail.disclaimer,'html');
    this.setData({
      detail
    },() => {
      wx.hideLoading({
        success: (res) => {},
      })
    });
    const {title} = detail;
    wx.setNavigationBarTitle({
      title,
    })
  },
  
  confirmOrder: function(e) {
    wx.showLoading({
      title: '支付进行中',
    })
    const { order } = this.data;
    const that = this;
    const nonceStr = Math.random().toString(36).substr(2, 15)
    const timeStamp = parseInt(Date.now() / 1000) + ''
    const out_trade_no = "otn" + nonceStr + timeStamp
    const total_fee = (order.totalFee*100).toString();

    app.globalData.order.out_trade_no = out_trade_no;

    wx.cloud.callFunction({
      name: "payment",
      data: {
        command: "pay",
        out_trade_no,
        body: order.raceTitle,
        total_fee
      },
      success(res) {
        console.log("云函数payment提交成功：", res.result)
        that.pay(res.result)
      },
      fail(res) {
        console.log("云函数payment提交失败：", res)
      }
    })
  },
  pay(payData) {
    const that = this;
    const { order } = this.data;
    const { out_trade_no } = app.globalData.order;
    //官方标准的支付方法
    wx.requestPayment({ //已经得到了5个参数
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package, //统一下单接口返回的 prepay_id 格式如：prepay_id=***
      signType: 'MD5',
      paySign: payData.paySign, //签名

      success(res) {
        console.log("支付成功：", res)
        wx.cloud.callFunction({  //巧妙利用小程序支付成功后的回调，再次调用云函数，通知其支付成功，以便进行订单状态变更
          name: "payment",
          data: {
            command: "payOK",
            out_trade_no: "test0004"
          },
          success: function(){
            // 重要：此处更新保存out_trade_no，用于退款
            updateOrderStatus({id:order.id, ...orderStatus.paid, out_trade_no }).then(res=>{
              order.status = orderStatus.paid.status; // 已支付
              order.statusText = orderStatus.paid.statusText;
              that.saveStartlist();
              console.log(res);
              wx.showToast({
                icon: 'success',
                title: '支付成功',
                success: function(){
                  that.setData({
                    step: 4
                  })
                }
              })
            })
          }
        })
      },
      fail(res) {
        console.log("支付失败：", res);
        updateOrderStatus({id:order.id, ...orderStatus.failed, out_trade_no }).then(res=>{
          console.log(res);
          wx.showToast({
            icon: 'none',
            title: '支付失败',
            success: function(){
              wx.redirectTo({
                url: `/pages/register/status/status?id=${order.id}`,
              })
            }
          })
        });
      },
     complete(res) {
        console.log("支付完成：", res)
      }
    })
  },
  updateOrderNo(){

  },
  saveStartlist(){
    const { profiles, id, orderNum, userId, userName, userInfo, status, statusText, orderType, raceId, raceTitle, racePic, cateId, cateTitle, groupType, groupText, out_trade_no } = app.globalData.order;

    const db = wx.cloud.database();
    profiles.forEach(async item=>{
      delete item._openid;
      delete item._id;
      console.log(item);
      const result = await db.collection("start-list").add({
        data: {
          ...item,
          createdAt: new Date(),
          id, orderNum, userId, userName, userInfo, status, statusText, orderType, raceId, raceTitle, racePic, cateId, cateTitle, groupType, groupText, out_trade_no
        }
      });
      console.log(result)
    })
  }
})