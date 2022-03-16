const dayjs = require("dayjs");
const { getRaceDetail, getStartListByRaceIdUserId, updateBibNum, updateGpxJsonFile, updateStartList } = require("../../../api/race");
const { gpxToJson } = require("../../../api/upload");
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
    bibPic: null,
    fileList: [],
    jsonUrl: null,
    virtualStatuses: ['未上传', '已上传待审核', '审核通过', '审核不通过'],
    virtualStatus: "",
    btnDisabled: true,
    appActivities: null
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
    const that = this;
    let { raceDetail, fileList = [], appActivities = [] } = this.data;
    const { file } = event.detail;
    let files = [];
    if(raceDetail.isMultiPic) {
      files = file;
    }else{
      files = [ file ];
    }
    wx.cloud.init();
    if (files.length === 0) {
      wx.showToast({
        title: '请选择图片',
        icon: 'none'
      });
    } else {
      wx.showLoading({
        title: '上传中...',
      })
      const uploadTasks = files.map((file) => this.uploadFilePromise(`upload/app/${dayjs().format("YYYYMMDD")}/${new Date().getTime()}.png`, file));
      Promise.all(uploadTasks)
        .then(async data => {
          const newFileList = data.map(item => ({ url: item.fileID }));
          fileList.push(...newFileList);
          wx.showToast({ title: '上传成功', icon: 'none' });
          const btnDisabled = fileList.length === 0;
          const newFiles = data.map(item => item.fileID);
          appActivities.push(...newFiles);
          that.setData({ cloudPath: data, fileList, appActivities, btnDisabled });
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
    const that = this;
    
    app.checkLogin()
      .then(async (res) => {
        const { userId } = res;
        const { raceId } = this.data;
        let detail = null;
        if (userId && raceId) {
          detail = await getStartListByRaceIdUserId({ raceId, userId });          
        }
        if(!detail){
          wx.showToast({
            title: '没有报名',
            icon: 'error'
          })
          return;
        }
        let { appActivities, virtualStatus } = detail;
        const fileList = appActivities?.map(item=> {
          return { url: item };
        });
        if(!detail.bibNum){
          updateBibNum(raceId, userId);
        }
        const raceDetail = await getRaceDetail(raceId);
        raceDetail.orderTime = dayjs(raceDetail.addedDate).format("YYYY-MM-DD HH:mm:ss");
        
        const btnEnabled = virtualStatus === undefined || ['未上传', '审核不通过'].includes(virtualStatus);
        const isDateValid = dayjs().isBefore(dayjs(raceDetail.appEndDate)) && dayjs().isAfter(dayjs(raceDetail.appStartDate));
        const isFilesValid = fileList?.length > 0;
        raceDetail.appStartDate = dayjs(raceDetail.appStartDate).format("YYYY-MM-DD");
        raceDetail.appEndDate = dayjs(raceDetail.appEndDate).format("YYYY-MM-DD");
        let btnDisabled = !(btnEnabled && isDateValid && isFilesValid);
        const uploadDisabled = !(btnEnabled && isDateValid);
        if(!virtualStatus){
          virtualStatus = '等待上传';
        }
        that.setData({
          detail, raceDetail, appActivities, jsonUrl: detail.gpxFileUrl, fileList, virtualStatus, btnDisabled, uploadDisabled
        }, () => {
          wx.hideLoading();
        })
        that.watchChanges(detail._id);
      });
  },
  uploadGpx(event) {
    const { file } = event.detail;
    const { detail } = this.data;
    wx.cloud.init();
    if (!file) {
      wx.showToast({
        title: '请选择文件',
        icon: 'none'
      });
    } else {
      if(!file.url.toLocaleLowerCase().endsWith('.gpx')){
        wx.showToast({
          title: '请选择.gpx文件',
          icon: 'none'
        });
        return;
      }
      wx.showLoading({
        title: '上传中...',
      })
      const that = this
      const suffix = /\.\w+$/.exec(file.url)[0];
      wx.cloud.uploadFile({
        cloudPath: `upload/gpx/${new Date().getTime()}${suffix}`,
        filePath: file.url, // 文件路径
        success: async res => {
          console.log("上传成功", res.fileID);
          const { errMsg, result } = await gpxToJson(res.fileID);
          if(errMsg === "cloud.callFunction:ok"){
            const jsonUrl = result.fileID;
            that.setData({
              btnDisabled: false,
              jsonUrl
            }, async () => {
              const data = await updateGpxJsonFile(detail._id, jsonUrl);
              if(data.errMsg === "document.update:ok"){
                wx.showToast({
                  title: '上传成功',
                  icon: 'success'
                });
                return;
              }
            })
          }
        },
        fail: err => {
          console.log("上传失败", err)
        }
      })
    }
  },
  async submitApprove(){
    const { detail, jsonUrl, appActivities } = this.data;
    const res = await updateStartList(detail._id, { jsonUrl, appActivities, gpxUploadTime: new Date(), virtualStatus: '已上传待审核' })
    if(res.errMsg === "document.update:ok"){
      wx.showToast({ title: '提交成功', icon: 'none' });
    }
  },
  watchChanges(id) {
    const db = wx.cloud.database();
    const that = this;
    db.collection('start-list').doc(id).watch({
      onChange: function (snapshot) {
        const { type } = snapshot;
        if (type !== "init") {
          that.fetch();
        }
        console.log("snapshot", snapshot);
      },
      onError: function (err) {
        console.error("the watch closed because of error", err);
      },
    });
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