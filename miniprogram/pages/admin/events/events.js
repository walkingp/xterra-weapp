const { getAllRaces } = require("../../../api/race")
const dayjs = require("dayjs");
const app = getApp();
// miniprogram/pages/admin/events/events.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    headers: [
      {
        prop: 'title',
        width: 300,
        label: '赛事',
      },
      {
        prop: 'status',
        width: 152,
        label: '状态'
      },
      {
        prop: 'raceDate',
        width: 150,
        label: '比赛时间'
      },
      {
        prop: 'type',
        width: 152,
        label: '比赛类型'
      },
      {
        prop: 'feeType',
        width: 110,
        label: '收费'
      },
      {
        prop: 'regStartTime',
        width: 250,
        label: '报名开放时间'
      },
      {
        prop: 'endRegTime',
        width: 250,
        label: '报名截止时间'
      },
      {
        prop: 'region',
        width: 110,
        label: '地区'
      },
      {
        prop: 'location',
        width: 310,
        label: '比赛地点'
      }
    ],
    stripe: true,
    border: true,
    outBorder: true,
    races: [],
    msg: '暂无数据',
    show: false,
    loading: true,
    currentId: null,
    actions: [
      {
        name: '进入详情',
        type: 'detail'
      },
      {
        name: '查看报名订单',
        subname: '含未完成和已完成',
        type: 'registration'
      },
      {
        name: '查看已报名完成名单',
        subname: '已经完成报名的成员',
        type: 'startlist'
      },
      {
        name: '查看财务信息',
        type: 'finance'
      },
      {
        name: '查看比赛成绩',
        disabled: true,
        type: 'result'
      },
      {
        name: '复制分享链接',
        type: 'copy',
        subname: '可用于插入公众号',
      },
    ],
  },
  onClose() {
    this.setData({ show: false, currentId: null });
  },

  onSelect(event) {
    const {type} = event.detail;
    const { currentId } = this.data;
    const url = `pages/events/detail/detail?id=${currentId}`;
    switch(type){
      case 'detail':
        wx.navigateTo({
          url: `/${url}`,
        })
        break;
      case 'registration':
        wx.navigateTo({
          url: `/pages/admin/events/registration/registration?raceId=${currentId}`,
        })
        break;
      case 'startlist':
        wx.navigateTo({
          url: `/pages/admin/events/start-list/start-list?raceId=${currentId}`,
        })
        break;
      case 'finance':
        wx.navigateTo({
          url: `/pages/admin/events/finance/finance?raceId=${currentId}`,
        })
        break;
      case 'result':
        wx.navigateTo({
          url: `/pages/admin/events/result/result?raceId=${currentId}`,
        })
        break;
      case 'copy':
        wx.setClipboardData({
          data: url,
        })
        break;
    }
  },
  onRowClick: function(e) {
    const { _id } = e.detail.target.dataset.it;
    this.setData({
      currentId: _id,
      show: true
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res => {
      const isAdmin = res.userInfo.role === 'admin';
      if(!isAdmin){
        wx.showToast({
          icon: 'none',
          title: '你没有管理员权限',
          success: () => {
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/my/my',
              })
            }, 1000);
          }
        })
      }else{
        this.fetch();
      }
    });
  },
  async fetch(){
    wx.showLoading({
      title: '加载中……',
    })
    const races = await getAllRaces();
    console.log(races)
    races.map(item => {
      item.raceDate = dayjs(item.raceDate).format("YYYY-MM-DD");
      item.regStartTime = dayjs(item.regStartTime).format("YYYY-MM-DD HH:mm:ss");
      item.endRegTime = dayjs(item.endRegTime).format("YYYY-MM-DD HH:mm:ss");
    })
    this.setData({
      races,
      loading: false
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
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