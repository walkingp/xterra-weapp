const { getMyRegistrations } = require("../../../api/race")
const app = getApp();
const dayjs = require("dayjs");
// miniprogram/pages/my/registration/registration.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    regs: [],
    active: 0
  },
  onChange(e){

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res => {
      this.fetch();
    })

  },

  async fetch(){
    const { userId } = app.globalData;
    const regs = await getMyRegistrations(userId);
    regs.map(item => {
      item.regDate = dayjs(item.addedDate).format("YYYY-MM-DD");
      return item;
    });
    this.setData({
      regs
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