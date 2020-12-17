const { getMyProfiles } = require("../../../api/race")
const app = getApp();
// miniprogram/pages/my/profile/profile.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    profiles: []
  },
  gotoAdd(){
    wx.navigateTo({
      url: '/pages/register/form/form',
    })
  },
  async fetch(){
    wx.showLoading({
      title: '加载中……',
    })
    const { userId } = app.globalData;
    if(!userId){
      wx.showToast({
        title: '没有登录',
        icon: "none",
        success: ()=>{
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/my/my',
            })
          }, 1000);
        }
      })
    }
    const profiles = await getMyProfiles(userId);
    this.setData({
      profiles
    },() => {
      wx.hideLoading({
        success: (res) => {},
      })
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res => {
      this.fetch();
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