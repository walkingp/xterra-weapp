// miniprogram/pages/admin/coupon/coupon.js
const dayjs = require("dayjs");
const { getCouponList, getCouponDetail, exportCouponList, } = require("../../../api/coupon");
const { fetchNotFreeRaces, fetchNotFreeCates } = require("../../../api/race");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isChecked: false,
    showAddrPicker: false,
    showAction: false,
    type: '全额抵扣券',
    typeValue: 'free',
    expiredDate: dayjs().add(14, 'day').format("YYYY-MM-DD HH:mm:ss"),
    currentDate: new Date().getTime(),
    minDate: new Date().getTime(),
    maxDate: new Date(dayjs().add(1, 'year').format("YYYY-MM-DD HH:mm:ss")),
    coupons: [],
    activeCoupons: [],
    usedCoupons: [],
    detail: null,
    value: 0,
    showDetail: false,
    selectedRaceId: null,
    selectedCateId: null,
    actionType: null,
    actions: [],
    active: 0,
    types: [
      {
        name: '全额抵扣券',
        value: 'free'
      },{
        name: '减免券',
        value: 'partial'
      }
    ],
    race: '不限制',
    cate: '不限制'
  },
  onChecked(e){
    const checked = e.detail;
    this.setData({
      isChecked: checked,
      value: 0.85
    })
  },
  onValueChange(e){
    debugger
    const value = e.detail;
  },
  showDate(){
    this.setData({
      currentDate: new Date(dayjs().add(14, 'day')).getTime(),
      showDatePicker: true
    })
  },  
  onChange(e) {
    const { name } = e.detail;
    this.setData({
      active: name
    })
  },
  async exportData(){
    wx.showLoading({
      title: '导出中',
    })
    const { active } = this.data;
    const res = await exportCouponList(active === 1);
    const url = res.fileList[0].tempFileURL;
    const filePath =  wx.env.USER_DATA_PATH + url.substr(url.lastIndexOf('/'));
    console.log(filePath)
    wx.downloadFile({
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
  copy(e) {
    const {
      text
    } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: text,
    })
  },
  onClose(e){
    const { type } = e.currentTarget.dataset;
    switch(type){
      case 'date':
        this.setData({
          showDatePicker: false
        })
        break;
    }
  },
  onDateConfirm(e){
    console.log(e.detail);
    this.setData({
      expiredDate: dayjs(e.detail).format("YYYY-MM-DD HH:mm:ss"),
      currentDate: e.detail,
      showDatePicker: false
    })
  },
  onDateCancel(){
    this.setData({
      showDatePicker: false
    })
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
    const { typeValue, expiredDate, selectedCateId, selectedRaceId, race, cate } = this.data;
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
        type: typeValue,
        raceId: selectedRaceId,
        cateId: selectedCateId,
        raceTitle: race,
        cateTitle: cate
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
  onShowAction(e){
    const { type } = e.currentTarget.dataset;
    const { types, races, cates } = this.data;
    switch(type){
      case 'type':
        this.setData({
          actions: types,
          showAction: true
        })
        break;
      case 'race':
        this.setData({
          actions: races,
          showAction: true
        })
        break;
      case 'cate':
        this.setData({
          actions: cates,
          showAction: true
        })
        break;
    }
    this.setData({
      actionType: type
    })
  },
  onClose() {
    this.setData({ showAction: false });
  },

  onSelect(e) {
    const { name, value } = e.detail;
    const { actionType } = this.data;
    switch(actionType){
      case 'type':
        this.setData({
          type: name,
          typeValue: value
        })
        break;
      case 'race':
        this.setData({
          race: name,
          selectedRaceId: value
        }, () => {
          this.fetchCates();
        })
        break;
      case 'cate':
        this.setData({
          cate: name,
          selectedCateId: value
        })
        break;
    }
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
  async fetchRaces(){
    let races = await fetchNotFreeRaces();
    races = races.map(item=>{
      return {
        name: item.title,
        value: item._id
      }
    });
    this.setData({
      races
    })
  },
  async fetchCates(){
    const { selectedRaceId } = this.data;
    let cates = await fetchNotFreeCates(selectedRaceId);
    cates = cates.map(item=>{
      return {
        name: item.title,
        value: item._id
      }
    });
    this.setData({
      cates
    })
  },
  async fetch(){
    const coupons = await getCouponList();
    const { types } = this.data;
    coupons.map(item=>{
      item.typeText = types.find(a=>a.value === item.type).name;
      return item;
    })
    this.setData({
      coupons,
      activeCoupons: coupons.slice().filter(item => item.isUsed === false),
      usedCoupons: coupons.slice().filter(item => item.isUsed)
    })
    this.fetchRaces();
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