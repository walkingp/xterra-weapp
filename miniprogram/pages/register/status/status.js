const { getRegistrationDetail, updateOrderStatus, getRaceDetail } = require("../../../api/race");
const dayjs = require("dayjs");
const { orderStatus } = require("../../../config/const");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    refundEnabled: true,
    id: null,
    detail: null,
    showRefundBtn: false,
    showPayBtn: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    this.setData({
      id
    });
    this.fetch(id);
  },
  copyText(e){
    const { text } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: text,
      success: function(){
        wx.showToast({
          icon: 'success',
          title: '已复制',
        })
      }
    })
  },
  async fetch( id ) {
    const detail = await getRegistrationDetail(id);
    detail.orderTime = dayjs(detail.addedDate).format("YYYY-MM-DD HH:mm:ss");
    this.setData({
      detail,
      showRefundBtn: detail.status === orderStatus.paid.status,
      showPayBtn: detail.status === orderStatus.pending.status || detail.status === orderStatus.failed.status,
    });
    const { raceId } = detail;
    const raceDetail = await getRaceDetail(raceId);
    if(raceDetail){
      const enabled = raceDetail.enabledRefund && dayjs(new Date()).isBefore(dayjs(raceDetail.refundLastDate));
      if(!enabled){
        this.setData({
          refundEnabled: false
        });
      }
    }
    console.log(detail);
  },
  redirect(e){
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({
      url
    })
  },
  confirmOrder: function(e) {
    wx.showLoading({
      title: '支付进行中',
    })
    const { detail } = this.data;
    const that = this;
    const nonceStr = Math.random().toString(36).substr(2, 15)
    const timeStamp = parseInt(Date.now() / 1000) + ''
    const out_trade_no = "otn" + nonceStr + timeStamp
    const total_fee = (detail.totalFee*100).toString();

    wx.cloud.callFunction({
      name: "payment",
      data: {
        command: "pay",
        out_trade_no,
        body: detail.raceTitle,
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
    const { detail } = this.data;
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
            const { out_trade_no, _id } = detail;
            debugger
            updateOrderStatus({ id: _id, ...orderStatus.paid, out_trade_no }).then(res=>{
              that.saveStartlist();
              console.log(res);
              wx.showToast({
                icon: 'success',
                title: '支付成功',
                success: function(){
                  that.fetch(_id);
                }
              })
            })
          }
        })
      },
      fail(res) {
        console.log("支付失败：", res);
        updateOrderStatus({ id: detail._id, ...orderStatus.failed }).then(res=>{
          console.log(res);
          wx.showToast({
            icon: 'none',
            title: '支付失败',
            success: function(){
              wx.redirectTo({
                url: `/pages/register/status/status?id=${order._id}`,
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
  saveStartlist(){
    const { detail } = this.data;
    const { profiles, id, orderNum, userId, userName, userInfo, status, statusText, orderType, raceId, raceTitle, racePic, cateId, cateTitle, groupType, groupText, out_trade_no } = detail;

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