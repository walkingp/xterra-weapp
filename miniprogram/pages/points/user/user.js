const dayjs = require("./dayjs");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: "",
    points: [],
    loading: true,
    detail: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    let {userId} = options;
    this.setData({
      userId
    })
    this.fetchUser(userId);
    this.fetch(userId);
  },
  async fetchUser(userId){
    const db = wx.cloud.database();
    const result = await db.collection("userlist").doc(userId).get();
    if (result) {
      const detail = result.data;
      console.log(detail)
      this.setData({
        detail
      })
    }
  },
  fetch(userId) {
    wx.cloud.callFunction({
      name: 'pagination',
      data: {
        dbName: 'points',
        filter: {
          userId
        },
        orderBy: {
          createdAt: 'desc'
        },
        pageIndex: 1,
        pageSize: 200
      }
    }).then(res => {
      console.log(res);
      const points = res.result.data.map(item=>{
        item.formattedDate = dayjs(item.createdAt).format('M月D日 HH:mm');
        return item;
      })

      this.setData({
        points,
        loading: false
      })
    }).catch(console.error)
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