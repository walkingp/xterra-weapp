const { getRaceDetail } = require("../../../../api/race");
const { getAllStartListByRaceId } = require("../../../../api/registration");
const dayjs = require("dayjs");
// miniprogram/pages/admin/events/registration/registration.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    headers: [
      {
        prop: 'trueName',
        width: 152,
        label: '姓名'
      },
      {
        prop: 'cateTitle',
        width: 352,
        label: '组别'
      },
      {
        prop: 'statusText',
        width: 150,
        label: '报名状态'
      },
      {
        prop: 'gender',
        width: 80,
        label: '性别'
      },
      {
        prop: 'wechatId',
        width: 280,
        label: '微信号'
      },
      {
        prop: 'cardType',
        width: 152,
        label: '证件'
      },
      {
        prop: 'cardNo',
        width: 352,
        label: '证件号码'
      },
      {
        prop: 'phoneNum',
        width: 200,
        label: '手机',
      },
      {
        prop: 'email',
        width: 300,
        label: '邮箱',
      },
      {
        prop: 'birthDate',
        width: 200,
        label: '出生日期',
      },
      {
        prop: 'bloodType',
        width: 200,
        label: '血型',
      },
      {
        prop: 'region',
        width: 300,
        label: '地区',
      },
      {
        prop: 'addr',
        width: 500,
        label: '住址',
      },
      {
        prop: 'contactUser',
        width: 200,
        label: '紧急联系人',
      },
      {
        prop: 'contactUserPhone',
        width: 200,
        label: '紧急联系人手机',
      },
      {
        prop: 'userName',
        width: 300,
        label: '订单提交人',
      },
      {
        prop: 'createdAt',
        width: 252,
        label: '报名时间'
      }
    ],
    stripe: true,
    border: true,
    outBorder: true,
    races: [],
    msg: '暂无数据',
    detail: null,
    results: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { raceId } = options;
    this.setData({
      raceId
    })
    this.fetch();
  },
  onCellClick(e){
    console.log(e.detail.target.dataset.it);
  },
  onRowClick(e){
    console.log(e.detail.target.dataset.it);
  },
  async fetch(){
    wx.showLoading({
      title: '加载中',
    })
    const { raceId } = this.data;
    const detail = await getRaceDetail(raceId);
    const results = await getAllStartListByRaceId(raceId);
    results.map(item => {
      item.createdAt = dayjs(item.createdAt).format("YYYY-MM-DD HH:mm:ss");
      item.birthDate = dayjs(item.birthDate).format("YYYY-MM-DD");
    });
    this.setData({
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