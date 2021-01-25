const { getPageDetail } = require("../../../api/page");
const { getCollectionById } = require("../../../utils/cloud");

const app = getApp();
// miniprogram/pages/points/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: null,
    remark: null,
    isLogined: false,
    userId: null,
    userInfo: null
  },
  buyNow(){
    const that = this;
    const { userId, detail } = this.data;
    wx.showModal({
      title: '兑换确认',
      content: `您是否确认使用${detail.point}积分兑换当前商品？`,
      success (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '兑换中',
          })
          wx.cloud.callFunction({
            name: 'exchangeGoods',
            data: {
              goodId: detail._id,
              userId,
              count: 1
            },
            success: function(res){
              debugger
              if(res.result.code === 1){
                wx.showToast({
                  title: '兑换成功',
                  icon: 'success'
                });
                this.fetch();
              }else{
                wx.showToast({
                  icon: 'none',
                  title: res.result.msg,
                })
              }
            },
            fail: function(err){
              wx.showToast({
                icon: 'none',
                title: '兑换失败'
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res=>{
      const { userId, userInfo, isLogined } = res;
      this.setData({
        isLogined,
        userId,
        userInfo
      });
      this.fetch();
    });
    const { id } = options;
    this.setData({
      id
    }, () => {
      this.fetch();
    })
  },
  async fetch(){
    wx.showLoading({
      title: '加载中……',
    })
    const { id } = this.data;
    const detail = await getCollectionById({ dbName: 'goods', id});
    detail.desc = app.towxml(detail.desc,'html',{
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
    const remark = await getPageDetail('exchange'); //兑换说明
    this.setData({
      remark: app.towxml(remark[0].content,'html',{}),
      detail
    }, ()=>{
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  preview(e){
    const { src } = e.currentTarget.dataset;
    const urls = this.data.detail.coverUrls;
    wx.previewImage({
      urls,
      current: src
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