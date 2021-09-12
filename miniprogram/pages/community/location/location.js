import { getCollectionById, getCollectionByWhere } from "../../../utils/cloud";

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    detail: null,
    feeds: []
  },

  showLocation(e) {
    const {
      detail
    } = this.data;
    wx.openLocation({
      longitude: detail.lng,
      latitude: detail.lat,
      scale: 16,
      name: detail.title,
      address: detail.address
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    
    app.checkLogin().then(res=>{    
      const { isLogined, userId, userInfo } = res;
      this.setData({
        isLogined,
        userId,
        userInfo
      });
    });
    this.setData({
      id
    },()=>{
      this.fetch();
    })
  },
  async fetch(){
    wx.showNavigationBarLoading({
      success: (res) => {},
    })
    const { id } = this.data;
    const res = await getCollectionById({dbName: 'feed', id});
    const feeds = await getCollectionByWhere({ dbName: 'feed', filter: {
      'location.title': res.location.title
    }});
    this.setData({
      detail: res.location,
      feeds
    });

    wx.hideNavigationBarLoading({
      success: (res) => {},
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