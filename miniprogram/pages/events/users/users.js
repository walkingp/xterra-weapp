const { getPaginations } = require("../../../utils/cloud")
const app = getApp();
const dayjs = require("dayjs");
const { getRaceDetail, getStartUserDetail } = require("../../../api/race");
// miniprogram/pages/events/users/users.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    detail: null,
    race: null,
    users: [],
    show: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    this.setData({
      id
    })
    this.fetch(id);
  },
  onClose(){
    this.setData({
      show: false
    })
  },
  copy(e){
    const { text } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: text,
    })
  },
  call(e){
    const { phone } = e.currentTarget.dataset;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  async showDetail(e){
    const { id } = e.currentTarget.dataset;
    const detail = await getStartUserDetail(id);
    detail.birthDate = dayjs(new Date(detail.birthDate)).format("YYYY-MM-DD");
    this.setData({
      show: true,
      detail
    })
  },

  async exportCSV(){
    const that = this;
    const { id } = this.data;
    wx.cloud.callFunction({
      name: 'exportCSV',
      data: {
        raceId: id
      },
      success(res){
        const fileUrl = res.result.fileList[0].tempFileURL;
        console.log(fileUrl)
        that.setData({
          fileUrl
        })
      }
    })
  },

  async fetch(raceId){
    wx.showLoading({
      title: '加载中',
    })
    const race = await getRaceDetail(raceId);
    wx.setNavigationBarTitle({
      title: race.title,
    })

    const users = await getPaginations({
      dbName: 'start-list',
      filter: {
        raceId
      },
      orderBy: {
        createdAt: 'desc'
      },
      pageIndex: 1,
      pageSize: 100
    });
    users.map(item => {      
      item.birthDate = dayjs(new Date(item.birthDate)).format("YYYY-MM-DD");
    })

    this.setData({
      users, race
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