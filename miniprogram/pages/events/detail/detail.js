const { getRaceDetail, getRaceCatesList, getRaceNewsList } = require("./../../../api/race");
const dayjs = require("dayjs");
const config = require("../../../config/config");
const app = getApp();
// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mapKey: null,
    markers: [],
    id: null,
    loading: false,
    detail: null,
    news: [],
    cates: []
  },
  register(){
    const { id } = this.data;
    wx.navigateTo({
      url: `/pages/register/register?id=${id}`,
    })
  },
  async fetch(id){
    wx.showLoading({
      title: '加载中...',
    });
    const detail = await getRaceDetail(id);
    console.log(detail);
    detail.cates = detail.catesName ? detail.catesName.join('/') : '/';
    detail.raceDate = dayjs(new Date(detail.raceDate)).format("YYYY年MM月DD日");
    detail.endRegTime = dayjs(new Date(detail.endRegTime)).format("YYYY年MM月DD日 hh:mm:ss");
    detail.admission = app.towxml(detail.admission,'html'); // 报名须知
    detail.content = app.towxml(detail.content,'html');
    detail.flow = app.towxml(detail.flow,'html');
    detail.picUrls = detail.picUrls.map(item=> {
      return {
        picUrl: item,
        type: 'preview'
      }
    });
    if(detail.routePics){
      detail.routePics = detail.routePics.map(item=> {
        return {
          picUrl: item,
          type: 'preview'
        }
      });
    }

    let markers = null;
    if(detail.coordinate){
      detail.coordinate = detail.coordinate.map(item=>+item);

      markers = [{
        id: 0,
        longitude: detail.coordinate[0],
        latitude: detail.coordinate[1],
        title: '卢湾体育中心',
        iconPath: '/images/icons/marker.png',
        width: 32,
        height: 32
      }];
    }

    const cates = await getRaceCatesList(id);
    const news = await getRaceNewsList(id);
    news.map(item=>{
      item.formatDate = dayjs(new Date(item.postTime)).format("MM月DD日");
      return item;
    });
    this.setData({
      loading: false,
      cates,
      news,
      markers,
      detail
    }, ()=>{
      wx.hideLoading({
        success: (res) => {},
      })
    });
  },
  onLoad: function (options) {
    const { id } = options;
    const { mapKey } = config;
    this.setData({
      mapKey,
      id
    });
    this.fetch(id);

  },
  showLocation(e) {
    const {
      detail
    } = this.data;
    wx.openLocation({
      longitude: +detail.coordinate[0],
      latitude: +detail.coordinate[1],
      scale: 16,
      name: detail.title,
      address: detail.location
    });
  },
  regionchange(e){

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