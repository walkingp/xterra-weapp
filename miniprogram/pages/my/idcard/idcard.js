const {
  getRaceDetail
} = require("../../../api/race");
const {
  getSingleCollectionByWhere,
  getCollectionByWhere
} = require("../../../utils/cloud");
const app = getApp();

// miniprogram/pages/my/idcard/idcard.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogined: false,
    userId: null,
    userInfo: null,

    loading: false,
    user: null,
    src: null, //显示
    imgUrl: null, //真实地址
    isChecked: false,
    hasUnchecked: false,
    race: null,
    results: null
  },
  checkIn() {
    this.setData({ loading: true })
    const {
      userId,
      userInfo,
      user,
      imgUrl,
      race,
      results
    } = this.data;
    const promises = [];
    results.forEach(item => {
      const {
        cateId,
        cateTitle,
        bibNum,
        trueName
      } = item;
      const p = new Promise((resolve, reject) =>{
        wx.cloud.callFunction({
          name: 'checkIn',
          data: {
            userId: item.userId,
            trueName,
            cardNo: user.id,
            checkinUserId: userId,
            checkinTrueName: userInfo.truename,
            raceId: race._id,
            raceTitle: race.title,
            cateId,
            cateTitle,
            bibNum,
            cardPic: imgUrl
          },
          success: res => {
            resolve(res)
          },
          fail: err => reject(err)
        })
      });
      promises.push(p);
    });
    const that = this;
    Promise.all(promises).then(res => {
      wx.showToast({
        title: '检录完成',
        success: function () {
          setTimeout(() => {
            that.setData({
              loading: false,
              isChecked: false,
              user: null,
              results: null,
              src: null
            });
          }, 1000);
        }
      });
    });
  },
  takePhoto() {
    const {
      src
    } = this.data;
    if (src) {
      this.setData({
        isChecked: false,
        user: null,
        results: null,
        src: null
      });
      return;
    }
    this.setData({
      loading: true
    })
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
      async success(res) {
        const {
          id
        } = res.result;
        that.setData({
          user: res.result
        }, () => {
          that.search(id);
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
  async search(id) {
    wx.showLoading({
      title: '查询中',
    })
    const db = wx.cloud.database();
    const _ = db.command;
    const userTable = db.collection("start-list");
    const config = await getSingleCollectionByWhere({
      dbName: 'config',
      filter: {
        currentRaceId: _.neq(null)
      }
    });
    if (config) {
      const race = await getRaceDetail(config.currentRaceId);
      this.setData({
        race
      })
      const results = await userTable.where({
        raceId: config.currentRaceId,
        cardNo: id
      }).get();
      if (results.data.length == 0) {
        wx.showToast({
          title: '没有查询到参赛信息',
        })
        this.setData({
          loading: false
        })
        return;
      }

      const hasUnchecked = results.data.some(item=> item.finishedStatus === 'notStart' || !item.finishedStatus);

      this.setData({
        loading: false,
        isChecked: true,
        results: results.data,
        hasUnchecked
      }, () => {
        wx.showToast({
          icon: 'none',
          title: `查询到${results.data.length}条参赛信息`,
        })
      })
    }

  },

  error(e) {
    console.log(e.detail)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(async res => {
      const {
        isLogined,
        userId,
        userInfo
      } = res;
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