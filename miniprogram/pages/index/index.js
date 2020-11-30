const { getBannerList } = require("../../api/race");
const { getNewsIndexList } = require("./../../api/news");
const { getRaceIndexList } = require("./../../api/race");
const dayjs = require("dayjs");
// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    banners: [],
    news: [],
    races: []
  },
  async fetch(){
    const banners = await getBannerList();
    const news = await getNewsIndexList();
    const races = await getRaceIndexList();
    news.map(item=>{
      item.formatDate = dayjs(new Date(item.postTime)).format("MM月DD日");
      return item;
    });
    races.map(item=>{
      item.cates = item.catesName.join('/');
      item.raceDate = dayjs(new Date(item.raceDate)).format("MM月DD日");
      return item;
    });
    console.log(races);
    this.setData({
      loading: false,
      races,
      news,
      banners
    });
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