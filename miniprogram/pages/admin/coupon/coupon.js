// miniprogram/pages/admin/coupon/coupon.js
const dayjs = require("dayjs");
const { getCouponList, getCouponDetail } = require("../../../api/coupon");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAddrPicker: false,
    showAction: false,
    type: '全额抵扣券',
    typeValue: 'free',
    expiredDate: dayjs().add(14, 'day').format("YYYY-MM-DD HH:mm:ss"),
    minDate: new Date().getTime(),
    maxDate: new Date(dayjs().add(1, 'year').format("YYYY-MM-DD HH:mm:ss")),
    coupons: [],
    detail: null,
    showDetail: false,
    actions: [
      {
        name: '全额抵扣券',
        value: 'free'
      },{
        name: '减免券',
        value: 'partial'
      }
    ]
  },
  async showDetail(e){
    const { id } = e.currentTarget.dataset;
    const detail = await getCouponDetail(id);
    console.log(detail);
    detail.expiredDate = dayjs(detail.expiredDate).format("YYYY-MM-DD HH:mm:ss");
    detail.source = detail.source === 'admin' ? '管理员后台添加' : '用户领取';
    detail.isUsed = detail.isUsed ? '已使用' : '未使用' 
    detail.usedTime = dayjs(detail.usedTime).format("YYYY-MM-DD HH:mm:ss");
    detail.type = detail.type === 'free' ? '全额抵扣券' : '减免券';
    this.setData({
      showDetail: true,
      detail
    })
  },
  onCloseDetail(e){
    this.setData({
      showDetail: false
    })
  },
  saveData(e){
    const { value } = e.detail;
    const { typeValue, expiredDate } = this.data;
    const { title} = value;
    const num = +value.num;
    if(typeValue === ''){
      wx.showToast({
        title: '请选择优惠券类型',
      })
      return;
    }
    if(value.value === ""){
      wx.showToast({
        title: '请输入有效金额',
      })
      return;
    }
    if(value.value === '0' && typeValue === 'partial'){
      wx.showToast({
        icon: 'none',
        title: '减免券金额不可为0',
      })
      return;
    }
    if(value.num === "" || num ===0){
      wx.showToast({
        title: '请输入有效数量',
      })
      return;
    }
    wx.showLoading({
      title: '生成中',
    })
    wx.cloud.callFunction({
      name: 'generateCoupon',
      data: {
        num,
        title,
        expiredDate,
        value: + value.value,
        expiredDate,
        type: typeValue
      }
    }).then(res => {
      wx.showToast({
        icon: 'none',
        title: '生成成功',
      })
      this.fetch();
    }).catch(err=>{
      console.error(err);
      wx.showToast({
        icon: 'none',
        title: '生成失败',
      })
    })
  },
  onShowAction(){
    this.setData({
      showAction: true
    })
  },
  onClose() {
    this.setData({ showAction: false });
  },

  onSelect(e) {
    const { name, value } = e.detail;
    this.setData({
      type: name,
      typeValue: value
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
        })
        return;
      }
    });
    this.fetch();
  },
  async fetch(){
    const coupons = await getCouponList();
    const { actions } = this.data;
    coupons.map(item=>{
      item.typeText = actions.find(a=>a.value === item.type).name;
      return item;
    })
    this.setData({
      coupons
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