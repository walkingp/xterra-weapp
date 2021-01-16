const { getPageDetail } = require("../../api/page");

// miniprogram/pages/page/page.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    detail: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options
    this.setData({
      id
    });

    this.fetch(id);
  },
  async fetch(id){
    const res = await getPageDetail(id);
    if(!res){
      wx.showToast({
        icon: 'none',
        title: '内容不存在',
      })
      return;
    }
    const detail = res[0];
    detail.content = app.towxml(detail.content,'html',{
      events: {
        tap: e => {
          const target = e.currentTarget.dataset.data;
          if (target.tag === 'img') {
            const url = target.attr.src;
            wx.previewImage({
              current: url,
              urls: [url],
            })
          }
        }
      }
    });
    wx.setNavigationBarTitle({
      title: detail.title,
    })
    this.setData({
      detail
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
    const { detail } = this.data;
    return {
      title: detail.title,
      imageUrl: "",
      path: `/pages/page/page?id=${detail._id}`
    }
  }
})