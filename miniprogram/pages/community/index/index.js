const {
  getFeedIndexList
} = require("./../../../api/feed");
const dayjs = require("dayjs");
const app = getApp();
// miniprogram/pages/community/community.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1,
    pageSize: 10,
    isLogined: false,
    list: [],
    recommendedList: []
  },
  gotoSearch(){
    wx.navigateTo({
      url: '/pages/community/search/search',
    })
  },
  async fetch() {
    wx.showNavigationBarLoading({
      success: (res) => {},
    })
    let {
      pageIndex,
      pageSize,
      list
    } = this.data;
    const newData = await getFeedIndexList(pageIndex, pageSize);
    if (newData.length > 0) {
      newData.map(item => {
        item.addedDate = dayjs(new Date(item.addedDate)).format("MM月DD日 HH:mm");
        return item;
      })
      list = list.concat(newData);
    }
    const recommendedList = list.filter(item => item.status === '3');
    console.log(list)
    this.setData({
      list,
      recommendedList
    }, () => {
      wx.hideNavigationBarLoading({
        success: (res) => {},
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res => {
      const {
        isLogined,
        userId,
        userInfo
      } = res;
      this.setData({
        isLogined,
        userId,
        userInfo
      });
    });
    this.fetch();
    this.watchChanges();
  },
  watchChanges() {
    const db = wx.cloud.database()
    const that = this;
    const {
      id
    } = this.data;
    db.collection('feed').watch({
      onChange: function (snapshot) {
        const {
          type
        } = snapshot;
        if (type !== 'init') {
          that.fetch();
        }
        console.log('snapshot', snapshot)
      },
      onError: function (err) {
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
    let {
      pageIndex
    } = this.data;
    pageIndex += 1;
    this.setData({
      pageIndex
    }, () => {
      this.fetch();
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})