import drawQrcode from '../../../utils/weapp.qrcode.esm.js'
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: null,
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res=>{
      const { userId, userInfo, isLogined } = res;
      console.log(userInfo);
      this.setData({
        userId, userInfo
      }, () => {
        this.draw();
      })
    });

  },
  draw(){
    const { userId, userInfo } = this.data;
    const { avatarUrl } = userInfo;
    drawQrcode({
      width: 375,
      height: 375,
      x: 20,
      y: 0,
      canvasId: 'myQrcode',
      // ctx: wx.createCanvasContext('myQrcode'),
      text: userId,
      // v1.0.0+版本支持在二维码上绘制图片
      image: {
        imageResource: avatarUrl,
        dx: 70,
        dy: 70,
        dWidth: 60,
        dHeight: 60
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