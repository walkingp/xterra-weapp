const { getCollectionById } = require("../../../utils/cloud");

const dayjs = require("dayjs");
// miniprogram/pages/points/status/status.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    detail: null,
    good: null
  },

  copy(e) {
    const {
      text
    } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: text,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    this.setData({
      id
    }, () => {
      this.fetch();
    })
  },
  async fetch(){
    const { id } = this.data;
    const detail = await getCollectionById({ dbName: 'point-goods', id });
    detail.date = dayjs(detail.createdAt).format("MM-DD HH:mm");
    detail.statusText = ['未发货', '已发货'][detail.status];
    const { goodId } = detail;
    const good = await getCollectionById({ dbName: 'goods', id: goodId})
    this.setData({
      detail,
      good
    });
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