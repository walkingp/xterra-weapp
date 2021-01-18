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
  onRemoved(arg){
    this.fetch();
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
      this.watchChanges();
    })
  },
  watchChanges(){
    const db = wx.cloud.database();
    const that = this;
    db.collection('registration').watch({
      onChange: function(snapshot) {
        const { type } = snapshot;
        if(type !== 'init'){
          that.fetch();
        }
        console.log('snapshot', snapshot)
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
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
    const regsWithdrew = regs.filter(item=>item.status === orderStatus.withdrew.status ||item.status === orderStatus.refunded.status);
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