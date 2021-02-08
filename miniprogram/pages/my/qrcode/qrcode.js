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
        this.watchChanges();
      })
    });
  },
  draw(){
    const { userId, userInfo } = this.data;
    const { avatarUrl } = userInfo;
    drawQrcode({
      width: 200,
      height: 200,
      x: 0,
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

  watchChanges(){
    const db = wx.cloud.database()
    const that = this;
    const { userId } = this.data;
    db.collection('userlist').doc(userId).watch({
      onChange: function(snapshot) {
        const { type } = snapshot;
        if(type !== 'init'){
          wx.showToast({
            icon:'success',
            title: '扫描成功',
            success(){
              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/admin/volunteer/agreement/agreement?raceId=',
                })
              }, 1000);
            }
          })
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