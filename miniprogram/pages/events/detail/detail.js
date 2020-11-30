const { getRaceDetail, getRaceCatesList, getRaceNewsList } = require("./../../../api/race");
const dayjs = require("dayjs");
const app = getApp();
// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    loading: false,
    detail: null,
    news: [],
    cates: []
  },
  async fetch(id){
    const detail = await getRaceDetail(id);
    console.log(detail);
    detail.cates = detail.catesName.join('/');
    detail.endRegTime = dayjs(new Date(detail.endRegTime)).format("YYYY年MM月DD日 hh:mm:ss");
    detail.admission = app.towxml(detail.admission,'html'); // 报名须知
    detail.content = app.towxml(detail.content,'html');
    detail.flow = app.towxml(detail.flow,'html');
    const cates = await getRaceCatesList(id);
    console.log(cates);
    const news = await getRaceNewsList(id);
    news.map(item=>{
      item.formatDate = dayjs(new Date(item.postTime)).format("MM月DD日");
      return item;
    });
    this.setData({
      loading: false,
      cates,
      news,
      detail
    });
  },
  onLoad: function (options) {
    const { id } = options;
    this.setData({
      id
    });
    this.fetch(id);

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