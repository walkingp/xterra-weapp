const { getNewsIndexList } = require("./../../api/news");
const dayjs = require("dayjs");
// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    races: [],
    orders: [
      { text: '排序', value: '' },
      { text: '按时间倒序', value: '按时间倒序' },
      { text: '按时间正序', value: '按时间正序' }
    ],
    types: [
      { text: '分类', value: '' },
      { text: '赛事', value: '赛事' },
      { text: '人物', value: '人物' },
      { text: '新闻', value: '新闻' }
    ],
    order: '',
    type: ''
  },
  async fetch(){
    wx.showLoading({
      title: '加载中……',
    })
    const news = await getNewsIndexList();
    news.map(item=>{
      item.formatDate = dayjs(new Date(item.postTime)).format("YYYY年MM月DD日");
      return item;
    });
    this.setData({
      news
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