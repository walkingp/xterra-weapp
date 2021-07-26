const { getFeedIndexList } = require("../../api/feed");
const { feedStatus } = require("../../config/const");
const dayjs = require("dayjs");
const i18n = require("./../../utils/i18n");

const _t = i18n.i18n.translate();
// miniprogram/pages/community/community.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statuses: [
      feedStatus.normal,
      feedStatus.top
    ]
  },
  async fetch(){
    wx.showLoading({
      title: _t['加载中…'],
    })
    const { statuses } = this.data;
    const list = await getFeedIndexList(statuses[0]);
    list.map(item=>{      
      item.addedDate = dayjs(new Date(item.addedDate)).format("MM月DD日 HH:mm");
      return item;
    })
    this.setData({
      list
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