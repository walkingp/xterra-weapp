const { getFeedsByUserId, getKudosFeedsByUserId } = require("../../../api/feed");
const dayjs = require("dayjs");
const { getUserDetail, getUserMedals, getUserPlaces, getUserFavs } = require("../../../api/user");
const app = getApp();
const i18n = require("./../../../utils/i18n");

const _t = i18n.i18n.translate();
// miniprogram/pages/community/user/user.js
Page({

  /**
   * 页面的初始数据
   */

  data: {
    isLogined: false,
    feeds: [],
    kudosList: [],
    favs: [],
    places: [],
    medals: [],
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
    let { medals } = this.data;
    if(medals.length){
      return;
    }
    medals = await getUserMedals(userId);
    console.log(medals);
    this.setData({
      medals: medals.map(item=>{
        item.medalUrl = item.place[0].medalUrl;
        item.title = item.place[0].title;
        return item;
      })
    });
  },
  async fetchPlaces(userId){
    let { places } = this.data;
    if(places.length){
      return;
    }
    
    places = await getUserPlaces(userId);
    this.setData({
      places
    });
  },
  async fetchFavs(userId){
    let { favs } = this.data;
    if(favs.length){
      return
    }
    
    favs = await getUserFavs(userId);
    this.setData({
      favs: favs.map(item=>{
        item.banner = item.place[0].banner;
        item.desc = item.place[0].desc;
        item.title = item.place[0].title;
        return item;
      })
    });
  },
  async fetchKudos(userId){
    let { kudosList } = this.data;
    if(kudosList.length){
      return
    }
    const res = await getKudosFeedsByUserId(userId);
    kudosList = res.result.list.map(item=>item.feeds[0]).filter(item=>item !== undefined);
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
      title: _t['加载中…'],
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
        await this.fetchPlaces(uid);
        break;
      case 'place':
        await this.fetchFavs(uid);
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