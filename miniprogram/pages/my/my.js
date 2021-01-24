const { updatePoint } = require("../../api/points");
const { getCollectionById } = require("../../utils/cloud");
const { pointRuleEnum } = require("./../../config/const");
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
    const { userId } = this.data;
    const userInfo = await getCollectionById({ dbName: 'userlist', id: userId });
    this.setData({
      userInfo
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res=>{
      const { userId, userInfo, isLogined } = res;
      if(['男', '女'].indexOf(userInfo.gender) < 0){
        userInfo.gender = userInfo.gender === 0 ? '男' : '女'
      }
      
      const isAdmin = res.userInfo.role === 'admin';
      this.setData({
        userInfo,
        userId,
        isLogined,
        isAdmin
      }, async () => {
        this.fetch();
        // 加分
        let data = await updatePoint(userId, pointRuleEnum.SignUp, {
          id: userId,
          title: '加入'
        })
        this.watchChanges();
      })
    }).catch(err=>{
    });
  },
  
  watchChanges(){
    const { userId } = this.data;
    const db = wx.cloud.database()
    const that = this;
    db.collection('userlist').doc(userId).watch({
      onChange: function(snapshot) {
        const { type } = snapshot;
        if(type !== 'init'){
          that.fetch();
        }
        console.log('snapshot', snapshot)
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    })
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