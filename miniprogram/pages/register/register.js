const { getRaceDetail, getRegistrationDetail } = require("../../api/race");
const { orderStatus } = require("../../config/const");
const app = getApp();
// miniprogram/pages/register/register.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    isValid: false,
    step: 0,
    group: 0,
    order: null,
    prevEnabled: false,
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
      prevD: prevEnabled,
      nextEnabled: nextEnabled
    });
  },
  nextStep(e){
    const step = this.data.step + 1;
    this.setData({
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
    }
  },
  order(){
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
      });
    }).catch(console.error)
  },
  prevStep(e){
    const step = this.data.step - 1;
    this.setData({
      isValid: false,
      step
    });
    app.globalData.step = step;
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
    const { id } = options;
    this.setData({
      id
    });
    this.fetch(id);
  },

  async fetch(id){
    wx.showLoading({
      title: '加载中',
    })
    const detail = await getRaceDetail(id);
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})