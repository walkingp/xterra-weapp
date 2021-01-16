
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogined: false,
    userInfo: null,
    isAdmin: false
  },
  async fetch(){
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res=>{
      const { userInfo, isLogined } = res;
      if(['男', '女'].indexOf(userInfo.gender) < 0){
        userInfo.gender = userInfo.gender === 0 ? '男' : '女'
      }
      
      const isAdmin = res.userInfo.role === 'admin';
      this.setData({
        userInfo,
        isLogined,
        isAdmin
      }, () => {
        this.fetch();
      })
    }).catch(err=>{
    });
  },

  onCompleted(arg){
    const { isLogined, isAdmin, userInfo } = arg.detail;
    if(!userInfo.phonenumber){ // 修改资料
      wx.redirectTo({
        url: '/pages/my/edit/edit',
      });
      return;
    }
    console.log(arg)
    this.setData({
      isAdmin,
      isLogined,
      userInfo
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showTabBar({
      animation: true,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const {
      isLogined
    } = getApp().globalData;
    this.setData({
      isLogined
    })
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