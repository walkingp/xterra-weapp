const { payNow } = require("../../api/pay");
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
    step: 2,
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
    const { order } = this.data;
    const that = this;
    payNow(order, () => {
      that.setData({
        step: 4
      })
    });
  }
})