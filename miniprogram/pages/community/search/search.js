const { searchFeed } = require("../../../api/feed");
const dayjs = require("dayjs");
const config = require("../../../config/config");
// miniprogram/pages/community/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: '',
    list: [],
    histories: [],
    searched: false
  },
  select(e){
    const { value } = e.currentTarget.dataset;
    this.setData({
      value
    }, ()=>{
      this.fetch();
    })
  },
  onChange(e) {
    this.setData({
      value: e.detail,
    });
  },
  onSearch() {
    console.log('搜索' + this.data.value);
    const { value } = this.data;
    this.setData({
      content: value
    }, () => {
      this.fetch();
    })
  },
  onClick() {
    console.log('搜索' + this.data.value);
    const { value } = this.data;
    this.setData({
      content: value
    }, () => {
      this.fetch();
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { q } = options;
    if(q){
      this.setData({
        value: q
      })
    }
    const histories = wx.getStorageSync(config.storageKey.searchHistory);
    if(histories && histories.length){
      this.setData({
        histories
      });
    }
  },
  async fetch() {
    const {
      value, histories
    } = this.data;
    if(!value){
      return;
    }
    if(histories.indexOf(value) < 0){
      if(histories.length > 5){
        histories.pop();
      }
      histories.unshift(value);
    }
    wx.setStorageSync(config.storageKey.searchHistory, histories);
    wx.showNavigationBarLoading({
      success: (res) => {},
    })
    const res = await searchFeed(value);
    const list = res.data;
    if (list.length > 0) {
      list.map(item => {
        item.addedDate = dayjs(new Date(item.addedDate)).format("MM月DD日 HH:mm");
        return item;
      })
    }
    console.log(list)
    this.setData({
      searched: true,
      histories,
      list
    }, () => {
      wx.hideNavigationBarLoading({
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