// UI ref: https://huaban.com/pins/3001777018/
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    users: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetch();
  },
  fetch() {
    const {
      userId
    } = this.data;
    wx.cloud.callFunction({
      name: 'pagination',
      data: {
        dbName: 'users',
        filter: {
          userId
        },
        orderBy: {
          point: 'desc'
        },
        pageIndex: 1,
        pageSize: 200
      }
    }).then(res => {
      console.log(res);
      const users = res.result.data

      this.setData({
        loading: false,
        users
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