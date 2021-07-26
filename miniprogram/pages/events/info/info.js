const app = getApp();
const { getRaceDetail } = require("../../../api/race");
const i18n = require("./../../../utils/i18n");

const _t = i18n.i18n.translate();
// miniprogram/pages/news/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    type: null,
    raceDetail: null,
    content: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: _t['加载中'],
    })
    const { id, type } = options;

    this.setData({
      id, type
    });
    this.fetchRaceDetail(id, type);
  },
  async fetchRaceDetail(id, type){
    const raceDetail = await getRaceDetail(id);
    raceDetail.picUrls = raceDetail.picUrls.map(item=> {
      return {
        picUrl: item,
        type: 'preview'
      }
    });
    let content = "";
    switch(type){
      case "traffic":
        content = raceDetail.traffic;
        wx.setNavigationBarTitle({
          title: '交通住宿',
        })
        break
      case "cuisine":
        wx.setNavigationBarTitle({
          title: '美食美景',
        })
        content = raceDetail.cuisine;
        break;
    }
    content = app.towxml(content,'html');
    this.setData({
      raceDetail,
      content
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
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