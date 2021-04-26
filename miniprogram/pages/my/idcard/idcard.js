// miniprogram/pages/my/idcard/idcard.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: null, 
    src: null,//显示
    imgUrl: null,//真实地址
  },
  checkIn(){

  },
  takePhoto() {
    const { src } = this.data;
    if(src){
      this.setData({
        src: null
      });
      return;
    }
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        this.setData({
          src: res.tempImagePath
        })
        this.uploadImg(res.tempImagePath);
      }
    })
  },
  uploadImg(imgUrl) {
    wx.showLoading({
      title: '上传中',
    })
    const that = this
    const suffix = /\.\w+$/.exec(imgUrl)[0];
    wx.cloud.uploadFile({
      cloudPath: `upload/ocr/${new Date().getTime()}${suffix}`,
      filePath: imgUrl, // 文件路径
      success: res => {
        console.log("上传成功", res.fileID)
        that.getImgUrl(res.fileID)
      },
      fail: err => {
        console.log("上传失败", err)
      }
    })
  },
  getImgUrl(imgUrl) {
    const that = this
    wx.cloud.getTempFileURL({
      fileList: [imgUrl],
      success: res => {
        const imgUrl = res.fileList[0].tempFileURL
        console.log("获取图片url成功", imgUrl)
        that.setData({
          imgUrl: imgUrl
        })
        that.OCR(imgUrl)
      },
      fail: err => {
        console.log("获取图片url失败", err)
      }
    })
  },
  OCR(imgUrl) {
    wx.showLoading({
      title: '识别中',
    })
    const that = this;
    wx.cloud.callFunction({
      name: "OCR",
      data: {
        imgUrl: imgUrl
      },
      success(res) {
        that.setData({
          user: res.result
        }, () => {
          wx.hideLoading()
        })
        console.log("识别成功", res)
      },
      fail(res) {
        console.log("识别失败", res)
        wx.showToast({
          icon: 'none',
          title: '识别失败',
        })
      }
    })
  },

  error(e) {
    console.log(e.detail)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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