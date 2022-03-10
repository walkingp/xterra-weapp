const dayjs = require("dayjs");
const { getRaceDetail, getStartListByRaceIdUserId, updateBibNum } = require("../../../api/race");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    raceDetail: null,
    orderDetail: null,
    raceId: null,
    detail: null,
    showSaveBtn: false,
    bibPic: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { raceId } = options;
    this.setData({
      raceId
    });
    this.fetch();

  },
  copyText(e){
    const { text } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: text,
      success: function(){
        wx.showToast({
          icon: 'success',
          title: '已复制',
        })
      }
    })
  },
  upload(event) {
    const that = this;
    const { orderDetail } = this.data;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;        
        wx.cloud.init();
        if (tempFilePaths.length === 0) {
          wx.showToast({
            title: '请选择图片',
            icon: 'none'
          });
        } else {
          wx.showLoading({
            title: '上传中...',
          })
          const uploadTasks = fileList.map((file, index) => this.uploadFilePromise(`upload/snap/my-photo/${new Date().getTime()}.png`, file));
          Promise.all(uploadTasks)
            .then(data => {
              wx.showToast({ title: '上传成功', icon: 'none' });
              const newFileList = data.map(item => ({ url: item.fileID }));
              this.setData({ cloudPath: data, fileList: newFileList });
            })
            .catch(e => {
              wx.showToast({ title: '上传失败', icon: 'none' });
              console.log(e);
            });
        }
      }
    })
  },
  uploadFilePromise(fileName, chooseResult) {
    return wx.cloud.uploadFile({
      cloudPath: fileName,
      filePath: chooseResult.url
    });
  },
  async fetch() {
    wx.showLoading({
      title: '加载中……',
    })
    
    app.checkLogin()
      .then(async (res) => {
        const { userId } = res;
        const { raceId } = this.data;
        let detail = null;
        if (userId && raceId) {
          detail = await getStartListByRaceIdUserId({ raceId, userId });
        }
        debugger;
        if(!detail.bibNum){
          updateBibNum(raceId, userId);
        }
        const raceDetail = await getRaceDetail(raceId);
        raceDetail.orderTime = dayjs(raceDetail.addedDate).format("YYYY-MM-DD HH:mm:ss");
        const isBeforeRaceDate = dayjs().isBefore(dayjs(raceDetail.raceDate));

        this.setData({
          detail, raceDetail
        }, () => {
          wx.hideLoading();
        })
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