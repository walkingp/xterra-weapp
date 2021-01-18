const {
  getNewsDetail
} = require("../../../api/news");
const app = getApp();
const dayjs = require("dayjs");
// miniprogram/pages/news/detail/detail.js
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
    const {
      id
    } = options;

    this.setData({
      id
    });
    this.fetch(id);
    this.watchChanges();
  },

  async fetch(id) {
    wx.showLoading({
      title: '加载中……',
    })
    const detail = await getNewsDetail(id);
    console.log(detail);
    detail.formatDate = dayjs(new Date(detail.postTime)).format("YYYY年MM月DD日");
    detail.content = app.towxml(detail.content, 'html', {
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
    this.setData({
      detail
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },

  watchChanges(){
    const db = wx.cloud.database()
    const that = this;
    const { id } = this.data;
    db.collection('news').doc(id).watch({
      onChange: function(snapshot) {
        const { type } = snapshot;
        if(type !== 'init'){
          that.fetch(id);
        }
        console.log('snapshot', snapshot)
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
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