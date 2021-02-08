const { getRaceDetail, getMyRegistrations } = require("../../../../api/race");
const { checkInUser } = require("../../../../api/user");
const { getCollectionById, getCollectionByWhere } = require("../../../../utils/cloud");
const app = getApp();
// miniprogram/pages/admin/volunteer/checkin/checkin.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: null,
    detail: null,
    currentRaceId: null,
    race: null
  },

  async getCurrentRaceId(){
    const { userId } = this.data;
    const races = await getCollectionByWhere({ dbName: 'start-list', filter: { userId }});
    const race = races[0];// TODO
    this.setData({
      race
    });
  },
  confirm(){

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { userId } = options;
    this.setData({ userId });
    app.checkLogin().then(res=>{
      const { userId, userInfo, isLogined } = res;
      if(!isLogined){
        wx.redirectTo({
          url: '/pages/my/my',
        })
      }
      this.getCurrentRaceId();
      this.fetch();
      this.scaned();
    });
  },
  async scaned(){
    const { userId } = this.data;
    const res = await checkInUser(userId)
    debugger
  },
  async fetch(){
    wx.showLoading({
      title: '加载中',
    })
    const { userId } = this.data;
    const detail = await getCollectionById({ dbName: 'userlist', id: userId });
    console.log(detail);
    this.setData({
      detail
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    });
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