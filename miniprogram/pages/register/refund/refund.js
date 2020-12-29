const { getRegistrationDetail, updateOrderStatus, getRaceDetail } = require("../../../api/race");
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
    canRefund: false,
    refundMoney: 0,
    disabled: true,//仅付款成功时可退款
    policyText: null,
    isPlogging: false,
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
    detail: null,
    raceDetail: null
  },
  back(){
    wx.navigateTo({
      url: '/pages/my/registration/registration',
    })
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

  //退款
  refund: async function() {    
    wx.showLoading({
      title: '退款中'
    })
    const { detail, isPlogging, raceDetail, refundMoney } = this.data;
    if(isPlogging || refundMoney === 0){
      await updateOrderStatus({id:detail._id, ...orderStatus.refunded, refundTime: new Date() });
      wx.showToast({
        icon: "success",
        title: '取消成功',
        success: function(){
          wx.redirectTo({
            url: '/pages/my/registration/registration',
          })
        }
      })
      return;
    }
    const total_fee = +detail.totalFee * 100;
    const refund_fee = Math.floor(refundMoney * 100);
    const that = this;
    wx.cloud.callFunction({
      name: "payment",
      data: {
        command: "refund",
        out_trade_no: detail.out_trade_no,
        body: raceDetail.raceTitle,
        total_fee,
        refund_fee,
        refund_desc: `报名费退款：${raceDetail.title}`
      },
      async success(res) {
        const id = detail._id;
        await updateOrderStatus({ id, ...orderStatus.refunded, refundTime: new Date() })
        wx.showToast({
          icon: "success",
          title: '退款成功',
          success: function(){
            that.updateCateUser();
            setTimeout(() => {
              wx.redirectTo({
                url: `/pages/register/status/status?id=${id}`,
              })              
            }, 1000);
          }
        })
        console.log("云函数payment提交成功：", res)
      },
      fail(res) {
        wx.showToast({
          icon:"none",
          title: '退款失败',
        })
        console.log("云函数payment提交失败：", res)
      }
    })
  },
  async updateCateUser(){
    const { id } = this.data;
    const { cateId } = this.data.detail;
    debugger
    const res = await wx.cloud.callFunction({
      name: 'updateRaceCate',
      data: {
        action: 'cancel',
        id,
        cateId
      }
    })
    console.log(res);
  },
  async fetch( id ) {
    const detail = await getRegistrationDetail(id);
    detail.orderTime = dayjs(detail.addedDate).format("YYYY-MM-DD HH:mm:ss");
    const disabled = detail.status !== orderStatus.paid;

    let policyText = '无退款政策' 
    const raceDetail = await getRaceDetail(detail.raceId);
    let refundMoney = 0;
    let canRefund = false;
    let isPlogging = false;
    if(raceDetail){
      const { enabledRefund, refundRate, refundLastDate, raceDate } = raceDetail;
      policyText = `${dayjs(refundLastDate).format('YYYY年MM月DD日')}前可申请退款${(refundRate*100).toFixed(0)}%`
      refundMoney = (Math.floor(detail.totalFee * refundRate*100)/100).toFixed(2);
      const isDateValid = dayjs(new Date()).isBefore(dayjs(refundLastDate));
      const isPaied = detail.status === orderStatus.paid.status || detail.status === orderStatus.pending.status;
      canRefund = enabledRefund && isDateValid && isPaied;
      isPlogging = raceDetail.type === 'X-Plogging';
      if(isPlogging){
        policyText = 'n/a';
        canRefund = isPaied && dayjs(new Date()).isBefore(dayjs(raceDate));
      }
    }
    this.setData({
      isPlogging,
      refundMoney,
      policyText,
      disabled,
      canRefund,
      raceDetail,
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
      disabled: false,
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