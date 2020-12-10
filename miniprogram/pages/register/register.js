const { getRaceDetail } = require("../../api/race");
const app = getApp();
// miniprogram/pages/register/register.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "",
    isValid: false,
    step: 1,
    group: 0,
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
  nextStep(e){
    const step = this.data.step + 1;
    this.setData({
      isValid: false,
      step
    });
    app.globalData.step = step;
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