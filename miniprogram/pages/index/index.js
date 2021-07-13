const {
  getBannerList
} = require("../../api/race");
const app = getApp();
const {
  getNewsIndexList
} = require("../../api/news");
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
    headerBarHeight: 60,
    current: 0
  },  
  swiperChange(e) {
    this.setData({
      current: e.detail.current
    })
  },
  mainSwiperChanged(e) {
  },
  redirect(e){
    const { url, wechaturl } = e.currentTarget.dataset;
    if(wechaturl){
      wx.navigateTo({
        url: `/pages/more/webview/webview?url=${wechaturl}`,
      })
      return;
    }
    wx.navigateTo({
      url,
    })
  },
  tap(e){
    let { src, type, url } = e.currentTarget.dataset;
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
        url = url.replace('.html', '');
        const isTabbar = url.indexOf("/pages/news/news") >= 0 || url.indexOf("pages/events/events") >= 0;
        if(isTabbar){
          app.globalData.tabBarLink = url;
               
          return;
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
    news.map(item => {
      item.formatDate = dayjs(new Date(item.postTime)).format("MM月DD日");
      return item;
    });
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
  watchChanges(dbName){
    const db = wx.cloud.database()
    const that = this;
    db.collection(dbName).watch({
      onChange: function(snapshot) {
        const { type } = snapshot;
        if(type !== 'init'){
          that.fetch();
        }
        console.log('snapshot', snapshot)
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetch();
    this.watchChanges('banner');
    this.watchChanges('news');
    wx.getSystemInfo({
      success: e => { 
         let info = wx.getMenuButtonBoundingClientRect()
         let headerBarHeight = info.bottom + info.top - e.statusBarHeight    
         this.setData({      
           headerBarHeight
         })
      }
    })
  },
  onShow(){
  }
})