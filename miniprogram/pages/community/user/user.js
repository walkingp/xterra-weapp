const { getFeedsByUserId, getKudosFeedsByUserId } = require("../../../api/feed");
const dayjs = require("dayjs");
const { getUserDetail } = require("../../../api/user");
const app = getApp();
// miniprogram/pages/community/user/user.js
Page({

  /**
   * 页面的初始数据
   */

  data: {
    isLogined: false,
    list: [],
    kudosList: [],
    uid: null,
    uInfo: null,
    userId: null,
    userInfo: null
  },
  async fetch(){
    wx.showLoading({
      title: '加载中…',
    })
    const { uid } = this.data;
    const uInfo = await getUserDetail(uid);
    const list = await getFeedsByUserId(uid);
    list.map(item => {
      item.dateStr = dayjs(new Date(item.addedDate)).format("MM-DD HH:mm:ss");
      return item;
    })
    const res = await getKudosFeedsByUserId(uid);
    const kudosList = res.result.list.map(item=>item.feeds[0]);
    kudosList.map(item => {
      item.dateStr = dayjs(new Date(item.addedDate)).format("MM-DD HH:mm:ss");
      return item;
    })
    this.setData({
      uInfo,
      list,
      kudosList
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    this.setData({
      uid: id
    })
    app.checkLogin().then(res=>{    
      const { isLogined, userId, userInfo } = res;
      this.setData({
        isLogined,
        userId,
        userInfo
      });
    });
    this.fetch();
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