const { getCommentList } = require("../../../api/feed");
const { getPlaceDetail, getPlaceList, getRaceListByPlace } = require("../../../api/venue");
const config = require("../../../config/config");
const dayjs = require("dayjs");

// miniprogram/pages/venue/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    detail: null,
    places: [],
    pageIndex: 1,
    pageSize: 10,
    list: [],
    races: [],
    isLoadMore: false,
    show: false
  },
  onLoad: function (options) {
    const { mapKey } = config;
    const { id, type } = options
    this.setData({
      show: type === 'succ',
      id, mapKey
    });

    this.fetch(id);
  },
  async fetch(id){
    wx.showLoading({
    })
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
    races.map(item=> item.date = dayjs(item.raceDate).format('YYYY年MM月DD日 HH:mm'));
    this.setData({
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
  async fetchComment() {
    wx.showNavigationBarLoading({
      success: (res) => {},
    })
    let {
      pageIndex,
      pageSize,
      list,
      id
    } = this.data;
    const newData = await getCommentList(pageIndex, pageSize, id);
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
    this.fetchComment();
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