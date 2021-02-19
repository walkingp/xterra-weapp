// miniprogram/pages/community/new/new.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogined: false,
    userId: null,
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res=>{    
      const { isLogined, userId, userInfo } = res;
      if(!isLogined){
        wx.showToast({
          icon: 'none',
          title: '请先登录',
          success: function(){
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/my/my',
              })
            }, 1000);
          }
        });
        return;
      }

      this.setData({
        isLogined,
        userId,
        userInfo
      });
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