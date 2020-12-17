const {
  getBannerList
} = require("../../api/race");
const {
  getNewsIndexList
} = require("./../../api/news");
const {
  getRaceIndexList
} = require("./../../api/race");
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
  mainSwiperChanged(e) {
    const {
      current
    } = e.detail;
    if (current === 2) {
      wx.showTabBar({
        animation: current === 2,
      })
    } else {
      wx.hideTabBar({
        animation: true,
      })
    }
  },
  gotoAbout(e) {
    const {
      url
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url
    });
  },
  async fetch() {
    wx.showLoading({
      title: '加载中…',
    });
    const banners = await getBannerList();
    const news = await getNewsIndexList();
    const races = await getRaceIndexList();
    news.map(item => {
      item.formatDate = dayjs(new Date(item.postTime)).format("MM月DD日");
      return item;
    });
    races.map(item => {
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
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    });
  },
  swiperChange() {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideTabBar({
      animation: true,
    })
    this.fetch();
  },
})