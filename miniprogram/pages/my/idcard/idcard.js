const {
  getRaceDetail
} = require("../../../api/race");
const config = require("../../../config/config");
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
    raceId: null,
    loading: false,
    user: null,
    src: null, //显示
    imgUrl: null, //真实地址
    isChecked: false,
    hasUnchecked: false,
    race: null,
    results: null,
    isByManual: false,
    currentRaces: []
  },
  async manualSearch(e){
    const { raceId } = this.data;
    const { id } = e.detail.value;
    if(!id){
      wx.showToast({
        title: '请输入后6位证件号',
      })
      return;
    }
    
    this.setData({
      loading: true,
    });
    wx.showLoading({
      title: '查询中',
    })
    const db = wx.cloud.database();
    const _ = db.command;
    const userTable = db.collection("start-list");
    const res = await userTable.where({
      raceId,
      cardNo: {
        $regex: '.*' + id,
        $options: 'i'
      }
    }).get();
    const hasUnchecked = res.data.some(item=> item.finishedStatus === 'notStart' || !item.finishedStatus);
    this.setData({
      hasUnchecked,
      loading: false,
      isChecked: true,
      isByManual: true,
      results: res.data
    }, ()=>{
      wx.showToast({
        icon: 'none',
        title: `查询到${res.data.length}条参赛信息`,
      })
    })
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
            raceId: race.id,
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
      quality: 'normal',
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
          isByManual: false,
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
  async fetch(){
    const db = wx.cloud.database();
    const _ = db.command;
    const configData = await getSingleCollectionByWhere({
      dbName: 'config',
      filter: {
        currentRaceId: _.neq(null)
      }
    });
    if (configData) {
      let raceId = configData.currentRaceId[0];
      let race = null;
      if(wx.getStorageSync(config.storageKey.currentCheckInRace)){
        race = wx.getStorageSync(config.storageKey.currentCheckInRace);
      }else{
        const _race = await getRaceDetail(raceId);
        const { _id, title } = _race;
        race = { id: _id, title };
        wx.setStorageSync(config.storageKey.currentCheckInRace, race)
      }
      wx.setNavigationBarTitle({
        title: race.title + ' | 志愿者检录',
      })
      this.setData({
        raceId,
        race
      })
      this.getCheckinRaces();
    }
  },
  async getCheckinRaces(){
    try{
      wx.cloud.callFunction({
        name: 'getCheckInRaces'
      }).then(res => {
        const currentRaces = res.result.list[0].races.map(item=>{
          const { _id, title} = item;
          return { id: _id, name: title };
        });
        this.setData({
          currentRaces
        })
        console.log(currentRaces)
      })
    }catch(err){
      console.error(err);
    }
  },
  onClose() {
    this.setData({ show: false });
  },
  selectRaces() {
    this.setData({ show: true });
  },
  onSelect(event) {
    console.log(event.detail);
    const { id, name } = event.detail;
    const race = { id, title: name };
    this.setData({
      raceId: id,
      race
    });
    
    wx.setStorageSync(config.storageKey.currentCheckInRace, race)
  },
  async search(id) {
    wx.showLoading({
      title: '查询中',
    })
    const db = wx.cloud.database();
    const _ = db.command;
    const userTable = db.collection("start-list");
    const { race } = this.data;
    if(race){
      const results = await userTable.where({
        raceId: race.id,
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
      if(!isLogined){
        wx.showToast({
          title: '没有登录',
        })
        return;
      };
      const hasRole = userInfo.role === 'admin' || userInfo.role === 'volunteer';
      if(!hasRole){
        wx.showToast({
          title: '没有权限',
        })
        return;
      }
      this.setData({
        isLogined,
        userId,
        userInfo
      }, () => {
        this.fetch();
      });
    });
  },
})