const { getMyRegistrations } = require("../../../api/race")
const app = getApp();
const dayjs = require("dayjs");
const { orderStatus } = require("../../../config/const");
// miniprogram/pages/my/registration/registration.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    regs: [],
    regsFinished: [],
    regsUnpaid: [],
    regsWithdrew: [],
    active: 0
  },
  onChange(e){

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中……',
    })
    app.checkLogin().then(res => {
      this.fetch();
    })

  },

  async fetch(){
    const { userId } = app.globalData;
    const regs = await getMyRegistrations(userId);
    regs.map(item => {
      item.regDate = dayjs(item.addedDate).format("YYYY-MM-DD");
      item.showPayButton = item.status === orderStatus.pending.status || item.status === orderStatus.failed.status;
      const key = Object.keys(orderStatus).find(key => orderStatus[key].status === item.status);;
      item.textColor = orderStatus[key].textColor;
      return item;
    });
    const regsFinished = regs.filter(item=>item.status === orderStatus.paid.status );
    const regsFailed = regs.filter(item=>item.status === orderStatus.failed.status );
    const regsWithdrew = regs.filter(item=>item.status === orderStatus.withdrew.status );
    this.setData({
      regs,
      regsFinished,
      regsFailed,
      regsWithdrew
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
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