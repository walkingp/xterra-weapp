const { getIndexCourseList } = require("../../api/course");

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    isLogined: false,
    courses: []
  },
  async fetch(){
    const courses = await getIndexCourseList();
    courses.map(item=>{
      item.startDate = dayjs(new Date(item.startDate)).format("YYYY年MM月DD日");
      item.endDate = dayjs(new Date(item.endDate)).format("MM月DD日");
      item.status = '已完成';
      return item;
    })
    this.setData({
      loading: false,
      courses
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res=>{
      const { isLogined } = getApp().globalData;
      this.setData({
        isLogined
      }, () => {
        this.fetch();
      })
    }).catch(err=>{
      this.setData({
        loading: false
      })
    });
  },

  onCompleted(arg){
    const { isLogined } = arg.detail;
    console.log(arg)
    this.setData({
      isLogined
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