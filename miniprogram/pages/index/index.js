const {
  getBannerList
} = require("../../api/race");
const {
  getNewsIndexList
} = require("../../api/news");
const {
  getRaceIndexList
} = require("../../api/race");
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
    races: [],
    current: 0
  },  
  swiperChange(e) {
    this.setData({
      current: e.detail.current
    })
  },
  mainSwiperChanged(e) {
    const {
      currentItemId
    } = e.detail;
    if (currentItemId === '10') {
      wx.showTabBar({
        animation: true,
      });
    } else {
      wx.hideTabBar({
        animation: true,
      })
    }
  },
  redirect(e){
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({
      url
    })
  },
  tap(e){
    const { src, type, url } = e.currentTarget.dataset;
    const { banners } = this.data;
    const urls = banners.map(item=>item.picUrl);
    switch(type){
      case 'preview':
        wx.previewImage({
          urls,
          current: src
        });
        break;
      case 'navigate':
        if(!url.startsWith('/')){
          url = '/' + url;
        }
        wx.navigateTo({
          url,
        });
        break;
    }
  },
  async fetch() {
    wx.showLoading({
      title: '加载中…',
    });
    const banners = await getBannerList();
    const news = await getNewsIndexList();
    // const races = await getRaceIndexList();
    news.map(item => {
      item.formatDate = dayjs(new Date(item.postTime)).format("MM月DD日");
      return item;
    });
    // races.map(item => {
    //   item.cates = item.catesName ? item.catesName.join('/') : '/';
    //   item.raceDate = dayjs(new Date(item.raceDate)).format("MM月DD日");
    //   return item;
    // });
    //console.log(races);
    this.setData({
      loading: false,
      //races,
      news,
      banners
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    });
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