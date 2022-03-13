const dayjs = require("dayjs");
const { getRaceDetail, getStartListByRaceIdUserId, updateBibNum } = require("../../../api/race");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    raceDetail: null,
    orderDetail: null,
    raceId: null,
    detail: null,
    showSaveBtn: false,
    bibPic: null,
    fileList: [],
  },
  showPopup() {
    this.setData({ show: true });
  },

  onClose() {
    this.setData({ show: false });
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
  uploadToCloud(event) {
    const { raceDetail } = this.data;
    const { file } = event.detail;
    let filelist = [];
    if(raceDetail.isMultiPic) {
      filelist = file;
    }else{
      filelist = [ file ];
    }
    wx.cloud.init();
    if (filelist.length === 0) {
      wx.showToast({
        title: '请选择图片',
        icon: 'none'
      });
    } else {
      wx.showLoading({
        title: '上传中...',
      })
      const uploadTasks = filelist.map((file, index) => this.uploadFilePromise(`upload/app/${new Date().getTime()}.png`, file));
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