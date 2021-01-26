const { getExchangedGods } = require("../../../api/points")
const app = getApp();
const dayjs = require("dayjs");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    sentList: [],
    unsentList: [],
    userId: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中……',
    })
    app.checkLogin().then(res=>{
      const { userId, userInfo, isLogined } = res;
      this.setData({
        isLogined,
        userId,
        userInfo
      });
      this.fetch();
    })
  },
  async fetch(){
    const { userId } = this.data;
    const list = await getExchangedGods(userId);
    console.log(list)
    list.map(item => {
      item.date = dayjs(item.createdAt).format("MM-DD HH:mm");
      item.statusText = ['未发货', '已发货'][item.status];
      return item;
    });
    const unsentList = list.filter(item=> item.status === 0);
    const sentList = list.filter(item=> item.status === 1);
    this.setData({
      list,
      unsentList,
      sentList
    }, () =>{
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