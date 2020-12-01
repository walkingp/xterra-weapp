const { getNewsDetail } = require("../../../api/news");
const app = getApp();
const dayjs = require("dayjs");
// miniprogram/pages/news/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    loading: true,
    detail: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;

    this.setData({
      id
    });
    this.fetch(id);
  },

  async fetch(id){
    const detail = await getNewsDetail(id);
    console.log(detail);
    detail.formatDate = dayjs(new Date(detail.postTime)).format("MM月DD日");
    detail.content = app.towxml(detail.content,'html');
    this.setData({
      loading: false,
      detail
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