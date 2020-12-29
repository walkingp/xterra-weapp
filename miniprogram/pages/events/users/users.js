const { getPaginations } = require("../../../utils/cloud")
const app = getApp();
const dayjs = require("dayjs");
const { getRaceDetail } = require("../../../api/race");
// miniprogram/pages/events/users/users.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    detail: null,
    users: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    this.setData({
      id
    })
    this.fetch(id);
  },

  async fetch(raceId){
    wx.showLoading({
      title: '加载中',
    })
    const detail = await getRaceDetail(raceId);
    wx.setNavigationBarTitle({
      title: detail.title,
    })

    const users = await getPaginations({
      dbName: 'start-list',
      filter: {
        raceId
      },
      orderBy: {
        createdAt: 'desc'
      },
      pageIndex: 1,
      pageSize: 100
    });
    users.map(item => {      
      item.birthDate = dayjs(new Date(item.birthDate)).format("YYYY-MM-DD");
    })

    this.setData({
      users, detail
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