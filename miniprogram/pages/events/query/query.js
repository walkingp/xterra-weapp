const { getMyProfiles, getRegistrationByPhoneNum, getRaceDetail } = require("../../../api/race");
const dayjs = require("dayjs");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    raceId: null,
    raceDetail: null,
    active: 0,
    show: false,
    defaultName: '请选择',
    phoneNum: '',
    profiles: [],
    actions: [],
    searchedReg: null,
    searchResult: null
  },
  onClose() {
    this.setData({ show: false });
  },
  showAction(e){
    this.setData({
      show: true
    })
  },
  onSelect(event) {
    const { name, phoneNum } = event.detail;

    this.setData({
      phoneNum: name === '自定义...' ? '' : phoneNum
    })
  },
  async query(e){
    wx.showLoading({
      title: '查询中……',
    })
    const { phoneNum } = e.detail.value;
    const searchedReg = await getRegistrationByPhoneNum(phoneNum);
    console.log(searchedReg)
    searchedReg.regDate = dayjs(searchedReg.createdAt).format("YYYY-MM-DD HH:mm:ss");
    this.setData({
      searchedReg
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  async fetch(){
    const { userId } = app.globalData;
    if(!userId){
      return;
    }
    let profiles = await getMyProfiles(userId);
    profiles = profiles.map(item => {
      return {
        relation: item.relation,
        name: item.trueName,
        phoneNum: item.phoneNum
      }
    });
    profiles.push({ name: '自定义...' });
    const found = profiles.find(item => item.relation === '本人');
    if(found){
      const { phoneNum, name } = found;
      this.setData({
        phoneNum, defaultName: name
      })
    }
    this.setData({
      actions: profiles
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
    wx.showLoading({
      title: '加载中',
    })
    const { id } = options;
    if(id){
      this.setData({
        raceId: id
      })
      this.fetchRaceDetail(id);
    }
    app.checkLogin().then(res => {
      this.fetch();
    })
  },
  async fetchRaceDetail(id){
    const raceDetail = await getRaceDetail(id);
    raceDetail.picUrls = raceDetail.picUrls.map(item=> {
      return {
        picUrl: item,
        type: 'preview'
      }
    });
    this.setData({
      raceDetail
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