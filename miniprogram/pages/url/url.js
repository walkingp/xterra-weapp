// pages/url/url.js
const i18n = require("./../../utils/i18n");
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { url } = options;
    url = decodeURIComponent(url).replace('.html','');
    url = url.startsWith('/') ? url : '/' + url;
    let [path, _args] = url.split('?');
    const args = _args.split('&');
    const maps = args.map(str => str.split('='));
    const argObj = Object.fromEntries(maps);
    const tabUrls = ["/pages/index/index", "/pages/events/events", "/pages/my/my"];
    const isTab = tabUrls.includes(path);
    if(isTab){
      getApp().globalData.URLARGS = argObj;
      wx.switchTab({
        url,
      })
    }else{
      wx.redirectTo({
        url,
      })
    }
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
      _t: i18n.i18n.translate(),
    });

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