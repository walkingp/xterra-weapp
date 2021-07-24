const { getFeedsByUserId, getKudosFeedsByUserId } = require("../../../api/feed");
const dayjs = require("dayjs");
const { getUserDetail, getUserMedals } = require("../../../api/user");
const app = getApp();
// miniprogram/pages/community/user/user.js
Page({

  /**
   * 页面的初始数据
   */

  data: {
    isLogined: false,
    feeds: [],
    kudosList: [],
    uid: null,
    uInfo: null,
    userId: null,
    userInfo: null,
    active: 'feed'
  },
  onChange(event) {
    const active = event.detail.name;
    this.setData({
      active
    }, () => {      
      this.fetchTabContent();
    });
  },
  async fetchMedals(userId){
    const medals = await getUserMedals(userId);
    this.setData({
      medals
    });
  },
  async fetchKudos(userId){
    const res = await getKudosFeedsByUserId(userId);
    const kudosList = res.result.list.map(item=>item.feeds[0]).filter(item=>item !== undefined);
    kudosList.map(item => {
      item.dateStr = dayjs(new Date(item.addedDate)).format("MM-DD HH:mm:ss");
      return item;
    })
    this.setData({
      kudosList
    });
  },
  async fetchFeeds(uid){
    const feeds = await getFeedsByUserId(uid);
    feeds.map(item => {
      item.dateStr = dayjs(new Date(item.addedDate)).format("MM-DD HH:mm:ss");
      return item;
    })
    this.setData({
      feeds
    })
  },
  
  async fetch(){
    wx.showLoading({
      title: '加载中…',
    })
    const { uid, active } = this.data;
    const uInfo = await getUserDetail(uid);
    this.setData({
      uInfo
    }, () => {
      this.fetchTabContent();
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  async fetchTabContent(){
    const { active, uid } = this.data;
    switch(active){
      default:
      case 'feed':
        await this.fetchFeeds(uid);
        break;
      case 'tick':
        break;
      case 'place':
        break;
      case 'medal':
        await this.fetchMedals(uid);
        break;
      case 'like':
        await this.fetchKudos(uid);
        break
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id, active = 'feed' } = options;
    this.setData({
      uid: id,
      active
    })
    app.checkLogin().then(res=>{    
      const { isLogined, userId, userInfo } = res;
      this.setData({
        isLogined,
        userId,
        userInfo
      });
    });
    this.fetch();
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