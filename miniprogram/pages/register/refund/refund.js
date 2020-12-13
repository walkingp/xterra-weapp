const { getRegistrationDetail, updateOrderStatus } = require("../../../api/race");
const dayjs = require("dayjs");
const { orderStatus } = require("../../../config/const");
// miniprogram/pages/register/status/status.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    reason: '请选择',
    disabled: true,//仅付款成功时可退款
    actions: [
      {
        name: '填错信息',
      },
      {
        name: '重复报名',
      },
      {
        name: '行程冲突',
      },
      {
        name: '其他原因',
      },
    ],
    id: null,
    detail: null
  },
  showAction(){
    this.setData({
      show: true
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    this.setData({
      id
    });
    this.fetch(id);
  },

  async fetch( id ) {
    const detail = await getRegistrationDetail(id);
    detail.orderTime = dayjs(detail.addedDate).format("YYYY-MM-DD HH:mm:ss");
    const disabled = detail.status !== orderStatus.paid
    this.setData({
      disabled,
      detail
    });
    console.log(detail);
  },
  onClose() {
    this.setData({ show: false });
  },

  onSelect(event) {
    const {name} = event.detail;
    this.setData({
      show: false,
      reason: name
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