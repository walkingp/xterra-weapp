const { getRaceDetail, getUnsavedStartList } = require("../../../../api/race");
const { getAllRegistrationsByRaceId } = require("../../../../api/registration");
const dayjs = require("dayjs");
const app = getApp();
const { exportFinanceReport } = require("../../../../api/user");
const { getCollectionCount } = require("../../../../utils/cloud");
// miniprogram/pages/admin/events/registration/registration.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: ["0", "1", "2", "5", "6"],
    headers: [
      {
        prop: 'orderNum',
        width: 300,
        label: '订单编号',
      },
      {
        prop: 'out_trade_no',
        width: 300,
        label: '商家订单编号',
      },
      {
        prop: 'userName',
        width: 200,
        label: '订单提交人',
      },
      {
        prop: 'cateTitle',
        width: 152,
        label: '组别'
      },
      {
        prop: 'profiles',
        width: 152,
        label: '报名人'
      },
      {
        prop: 'statusText',
        width: 150,
        label: '报名状态'
      },
      {
        prop: 'totalFee',
        width: 152,
        label: '订单金额'
      },
      {
        prop: 'discountFee',
        width: 152,
        label: '优惠金额'
      },
      {
        prop: 'paidFee',
        width: 152,
        label: '实付金额'
      },
      {
        prop: 'refundFee',
        width: 152,
        label: '退款金额'
      },
      {
        prop: 'addedDate',
        width: 152,
        label: '报名时间'
      }
    ],
    stripe: true,
    border: true,
    outBorder: true,
    races: [],
    msg: '暂无数据',
    detail: null,
    results: [],
    total: 0
  },
  onChange(event) {
    this.setData({
      result: event.detail,
    });
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
        const { raceId } = options;
        this.setData({
          raceId
        })
        this.fetch();
      }
    });
  },
  async fetch(){
    wx.showLoading({
      title: '加载中',
    })
    const { raceId } = this.data;
    const detail = await getRaceDetail(raceId);
    const res = await getUnsavedStartList(raceId);
    const results = res.result.list;
    const total = results.length;
    results.map(item => {
      item.addedDate = dayjs(item.addedDate).format("YYYY-MM-DD HH:mm:ss");
      item.profiles = item.profiles && item.profiles.length ? item.profiles.map(p=>p.trueName).join() : ''
    });
    this.setData({
      total,
      detail,
      results
    }, () => {
      wx.setNavigationBarTitle({
        title: detail.title,
      })
      wx.hideLoading({
        success: (res) => {},
      })
    });
  },
  
  async exportCSV() {
    wx.showLoading({
      title: '生成中……',
    })
    const that = this;
    const {
      raceId
    } = this.data;
    
    const res = await exportFinanceReport(raceId);
    const url = res.fileList[0].tempFileURL;
    const filePath =  wx.env.USER_DATA_PATH + url.substr(url.lastIndexOf('/'));
    wx.downloadFile({
      // 示例 url，并非真实存在
      url,
      filePath,
      header: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      success: function (res) {
        wx.openDocument({
          filePath,
          fileType: 'xlsx',
          showMenu: true,
          success: function (res) {
            wx.hideLoading({
              success: (res) => {},
            })
            console.log('打开文档成功')
          },
          fail: function (res) {    
            console.error(res)
            wx.showToast({title: '打开文档失败', icon: 'none', duration: 2000})    
          },
        })
      }
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