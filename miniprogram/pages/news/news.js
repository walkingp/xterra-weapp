const { getNewsIndexList } = require("./../../api/news");
const dayjs = require("dayjs");
const config = require("../../config/config");
const i18n = require("./../../utils/i18n");

const _t = i18n.i18n.translate();
// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    news: [],
    allNews: [],
    orders: [],
    types: [],
    order: 'desc',
    type: ''
  },
  initialData(){
    const { _t } = this.data;
    this.setData({
      orders: [
        { text: _t['排序'], value: '' },
        { text: _t['按时间倒序'], value: 'desc' },
        { text: _t['按时间正序'], value: 'asc' }
      ],
      types: [
        { text: _t['分类'], value: '' },
        { text: _t['活动'], value: '赛事' },
        { text: _t['人物'], value: '人物' },
        { text: _t['新闻'], value: '新闻' }
      ]
    });
  },
  onFilterChanged(e){
    const { type } = e.currentTarget.dataset;
    const value = e.detail;
    let order = '',  _type = '';
    switch(type){
      case 'order':
        order = value;
        break;
      case 'type':
        _type = value;
        break;
    }
    const { allNews } = this.data;
    const news = _type !== "" ? allNews.filter(item => item.cate === _type) : allNews;
    news.sort((a,b) => {
      return order === 'asc' ? a.postTime - b.postTime : b.postTime - a.postTime;
    })
    this.setData({
      news
    });
  },
  async fetch(){
    wx.showLoading({
      title: _t['加载中……'],
    })
    const news = await getNewsIndexList();
    news.map(item=>{
      item.formatDate = dayjs(new Date(item.postTime)).format("YYYY年MM月DD日");
      return item;
    });
    this.setData({
      allNews: news,
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
    this.initialData();
    this.fetch();
    this.watchChanges();
  },

  watchChanges(){
    const db = wx.cloud.database()
    const watcher = db.collection('news').watch({
      onChange: function(snapshot) {
        const { type } = snapshot;
        if(type !== 'init'){
          this.fetch();
        }
        console.log('snapshot', snapshot)
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
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
    this.setData({
      _t: i18n.i18n.translate()
    }, () => {
      this.initialData();
    })
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
    return {
      title: '媒体中心 - XTERRA',
      imageUrl: "",
      path: `/pages/news/news`
    }
  }
})