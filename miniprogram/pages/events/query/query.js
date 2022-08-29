const {
  getMyProfiles,
  getRegistrationByCardNo,
  getRaceDetail,
  getStartedUsersByRaceId,
  getRaceCatesList
} = require("../../../api/race");
const dayjs = require("dayjs");
const {
  searchResultByCardNo
} = require("../../../api/result");
const {
  raceResultStatus
} = require("../../../config/const");
const { getSingleCollectionByWhere, getCollectionByWhere } = require("../../../utils/cloud");
const app = getApp();
const i18n = require("./../../../utils/i18n");

const _t = i18n.i18n.translate();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    raceId: null,
    cateId: null,
    raceDetail: null,
    show: false,
    isTriRace: false,
    defaultName: '请选择',
    defaultCate: '请选择',
    cardNo: '',
    profiles: [],
    allCates: [],
    cates: [],
    actions: [],
    searchedReg: null,
    searchResult: null,
    isPlogging: false,
    type: 'registration',
    actionType: null,
    isAdmin: false,
    users: []
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  showAction(e) {
    const { cates, profiles } = this.data;
    const { type } = e.currentTarget.dataset;
    let actions = null;
    switch(type){
      case "profile":
        actions = profiles;
        break;
      case "cate":
        actions = cates;
        break;
    }
    this.setData({
      actionType: type,
      actions,
      show: true
    })
  },
  onSelect(event) {
    const { actionType } = this.data;
    if(actionType === 'profile'){
      const {
        name,
        cardNo
      } = event.detail;
  
      this.setData({
        cardNo: name === '自定义...' ? '' : cardNo
      })
      return;
    }
    const { id, name } = event.detail;
    this.setData({
      defaultCate: name,
      cateId: id
    })
  },
  batchDone() {

  },
  async query(e) {
    const {
      type,
      cateId,
      raceId,
      isTriRace,
      isPlogging
    } = this.data;
    if(isPlogging && !cateId){
      wx.showToast({
        icon: 'none',
        title: '请选择分站',
      });
      return;
    }
    wx.showLoading({
      title: '查询中……',
    })
    const {
      cardNo
    } = e.detail.value;
    const param = isPlogging ? { cateId } : { raceId };
    if (type === 'result') {
      let searchResult = await searchResultByCardNo(isTriRace, { cardNo, ...param });
      if(!searchResult){
        wx.showToast({
          icon: 'none',
          title: '没有查询到完赛记录',
        })
        return;
      }
      const {
        status
      } = searchResult;
      if (status === raceResultStatus.notStart.value) {
        wx.showToast({
          icon: 'none',
          title: '没有查询到完赛记录',
        })
        wx.hideLoading();
        return;
      }
      searchResult.statusText = raceResultStatus[status].title;
      console.log(searchResult)
      this.setData({
        searchResult
      }, () => {
        wx.hideLoading({
          success: (res) => {},
        })
      })
    }else{
      const searchedReg = await getRegistrationByCardNo({cardNo, ...param});
      console.log(searchedReg)
      if(!searchedReg){
        wx.showToast({
          icon: 'none',
          title: '没有结果',
        });
        return;
      }
      const bibUsers = await getCollectionByWhere({ dbName: 'start-list', filter: { raceId, cardNo }});
      searchedReg.regDate = dayjs(searchedReg.createdAt).format("YYYY-MM-DD HH:mm:ss");
      this.setData({
        bibUsers,
        searchedReg
      }, () => {
        wx.hideLoading({
          success: (res) => {},
        })
      })
    }
  },
  async fetch() {
    const { raceId } = this.data;
    const {
      userId
    } = app.globalData;
    if (!userId) {
      return;
    }
    wx.showLoading({
      title: _t['加载中……'],
    })
    const allCates = await getRaceCatesList(raceId);
    const cates = allCates.map(item => {
      return {
        name: item.title,
        id: item._id
      }
    });

    let profiles = await getMyProfiles(userId);
    profiles = profiles.map(item => {
      return {
        relation: item.relation,
        name: item.trueName,
        cardNo: item.cardNo
      }
    });
    profiles.push({
      name: '自定义...'
    });
    const found = profiles.find(item => item.relation === '本人');
    if (found) {
      const {
        cardNo,
        name
      } = found;
      this.setData({
        cardNo,
        defaultName: name
      })
    }
    this.setData({
      allCates,
      cates,
      profiles
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    });
  },
  onChange(e) {
    const {
      name
    } = e.detail;
    this.setData({
      type: name
    })
    if (name === 'admin') {
      this.fetchStartedUsers();
    }
  },
  async fetchStartedUsers() {
    wx.showLoading({
      title: '加载中……',
    })
    const {
      raceId
    } = this.data;
    const users = await getStartedUsersByRaceId(raceId);
    users.map(item => {
      const status = item.finishedStatus;
      item.statusText = raceResultStatus[status].title;
      return item;
    });
    this.setData({
      users
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const {
      raceId,
      type
    } = options;

    if (!raceId) {
      wx.navigateBack({
        delta: 1,
      })
    }
    this.setData({
      type,
      raceId
    })
    this.fetchRaceDetail(raceId);
    app.checkLogin().then(res => {
      const isAdmin = res.userInfo.role === 'admin';
      this.setData({
        isAdmin
      })
      this.fetch();
    })
  },
  async fetchRaceDetail(id) {
    const raceDetail = await getRaceDetail(id);
    raceDetail.picUrls = raceDetail.picUrls.map(item => {
      return {
        picUrl: item,
        type: 'preview'
      }
    });
    this.setData({
      isTriRace: raceDetail.type === '铁人三项',
      isPlogging: raceDetail.type === 'X-Plogging',
      raceDetail
    })
  },
  viewCert(e) {
    const {
      type = 'cert'
    } = e.currentTarget.dataset;
    const {
      raceDetail, cateId, searchResult, searchedReg
    } = this.data;
    const id = type === 'cert' ? searchResult._id : searchedReg._id;
    wx.navigateTo({
      url: `/pages/events/cert/cert?raceId=${raceDetail._id}&cateId=${cateId}&id=${id}&isbib=${type === "bib"}`,
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