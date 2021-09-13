const { getCommentList } = require("../../../api/feed");
<<<<<<< HEAD
const { getPlaceDetail, getPlaceList, getRaceListByPlace, checkIsTicked, checkIsFaved, favPlace } = require("../../../api/venue");
const config = require("../../../config/config");
const dayjs = require("dayjs");
const app = getApp();
const i18n = require("./../../../utils/i18n");
=======
const { getPlaceDetail, getPlaceList, getRaceListByPlace } = require("../../../api/venue");
const config = require("../../../config/config");
const dayjs = require("dayjs");

>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
// miniprogram/pages/venue/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    detail: null,
<<<<<<< HEAD
    mapKey: config.mapKey,
    places: [],
    markers: [],
=======
    places: [],
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
    pageIndex: 1,
    pageSize: 10,
    list: [],
    races: [],
    isLoadMore: false,
<<<<<<< HEAD
    show: false,
    isTicked: false,
    isFaved: false,
    userId: null,
    order: 'hottest',
    isChinese: i18n.i18n.getLang()
  },
  orderLatest(){
    this.setOrder('latest');
  },
  orderHottest(){
    this.setOrder('hottest');
  },
  async setOrder(type){
    this.setData({
      order: type
    })
    switch(type){
      case 'latest':
        this.fetchComment('latest');
        break;
      case 'hottest':
        this.fetchComment('hottest');
        break;
    }
  },
  preview(e){
    const { url } = e.currentTarget.dataset;
    const { detail } = this.data;
    wx.previewImage({
      current: url,
      urls: detail.pickedPics,
    })
  },
  previewBanner(e){
    const { url } = e.currentTarget.dataset;
    const { detail } = this.data;
    wx.previewImage({
      current: url,
      urls: [url],
    })
  },
  onLoad: function (options) {
    const { userId } = app.globalData;
    const { id, type } = options
    this.setData({
      show: type === 'succ',
      id,
      userId
=======
    show: false
  },
  onLoad: function (options) {
    const { mapKey } = config;
    const { id, type } = options
    this.setData({
      show: type === 'succ',
      id, mapKey
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
    });

    this.fetch(id);
  },
<<<<<<< HEAD
  regionchange(e){

  },
  async addFav(){
    wx.showLoading()
    const { id, userId, isFaved } = this.data;
    const res = await favPlace(id, userId);
    wx.showToast({
      icon: 'none',
      title: isFaved ? '取消收藏成功' : '收藏成功',
    });
    this.setData({
      isFaved: isFaved ? false : true
    });
    wx.hideLoading()
  },
  async fetch(id){
    wx.showLoading({})
=======
  async fetch(id){
    wx.showLoading({
    })
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
    const res = await getPlaceDetail(id);
    if(!res){
      wx.showToast({
        icon: 'none',
        title: '地点不存在',
      })
      return;
    }
    const places = await getPlaceList(res.city);
    const races = await getRaceListByPlace(id);
<<<<<<< HEAD
    const isChinese = i18n.i18n.getLang();
    const format = isChinese ? 'YYYY年MM月DD日' : 'YYYY MMMM DD';
    races.map(item=> item.date = dayjs(item.raceDate).format(format));

    const { userId } = app.globalData;
    const isTicked = await checkIsTicked(id, userId);
    const isFaved = await checkIsFaved(id, userId);

    let markers = null;
    if(res.coordinate){
      res.coordinate = res.coordinate.map(item=>+item);

      markers = [{
        id: 0,
        longitude: res.coordinate[0],
        latitude: res.coordinate[1],
        title: res.title,
        iconPath: '/images/icons/marker.png',
        width: 32,
        height: 32
      }];
    }
    this.setData({
      markers,
      isTicked,
      isFaved,
      userId,
=======
    races.map(item=> item.date = dayjs(item.raceDate).format('YYYY年MM月DD日 HH:mm'));
    this.setData({
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
      races,
      detail: res,
      places
    }, () => {
      wx.hideLoading()
    });
    this.fetchComment();
  },

  loadMorePics(){
    this.setData({
      isLoadMore: true
    })
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
  hideContent(){
    this.setData({
      show: false
    })
  },
<<<<<<< HEAD
  showContent(){
    this.setData({
      show: true
    })
  },
  async fetchComment(order = 'hottest') {
=======
  async fetchComment() {
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
    wx.showNavigationBarLoading({
      success: (res) => {},
    })
    let {
      pageIndex,
      pageSize,
      list,
      id
    } = this.data;
<<<<<<< HEAD
    const newData = await getCommentList(pageIndex, pageSize, id, order);
=======
    const newData = await getCommentList(pageIndex, pageSize, id);
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
    if (newData.length > 0) {
      newData.map(item => {
        item.dateStr = dayjs(new Date(item.addedDate)).format("MM-DD HH:mm:ss");
        return item;
      })
      if(pageIndex>1){
        list = list.concat(newData);
      }else{
        list = newData;
      }
    }
    this.setData({
      list
    }, () => {
      wx.hideNavigationBarLoading({
        success: (res) => {},
      })
    })
  },
  
  redirect(e){
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({
      url
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
<<<<<<< HEAD
=======
    this.fetchComment();
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
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