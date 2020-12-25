const { getRaceDetail, getRegistrationDetail } = require("../../../../api/race");
const dayjs = require("dayjs");
// miniprogram/pages/register/form/view/view.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: null,
    id: null,
    regDetail: null,
    profile: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id, orderId } = options;
    this.setData({
      id, orderId
    })
    this.fetch();
  },
  backTo(){
    wx.navigateBack({
      delta: 1,
    })
  },
  async fetch(){
    const { id, orderId } = this.data;
    const regDetail = await getRegistrationDetail(orderId);
    const profile = regDetail.profiles.find(item=>item._id === id);
    console.log(profile)
    
    profile.birthDateStr = dayjs(profile.birthDate).format("YYYY年MM月DD日"),

    this.setData({
      regDetail,
      profile
    })
  },
})