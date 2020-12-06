// miniprogram/pages/register/form/form.js
import areaList from "./../../../config/area";
const dayjs = require("dayjs");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    areaList: areaList,
    showAddrPicker: false,
    showDatePicker: false,
    showAction: false,
    columns: [],
    actionType: '',
    cardType: '身份证',
    bloodType: '未选择',
    gender: '未选择',
    tSize: '未选择',
    region: '未选择',
    birthDate: '未选择',
    defaultBirthDate: new Date(1990,6,15).getTime(),
    genders: ['男', '女'],
    cardTypes: ['身份证', '护照', '军官证', '其他'],
    bloodTypes: ['O', 'A', 'B', 'AB'],
    birthDate: '未选择',
    
    minDate: new Date(1920, 1, 1).getTime(),
    maxDate: new Date().getTime(),
    tSizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  },
  onDateConfirm(e){
    console.log(e.detail);
    this.setData({
      birthDate: dayjs(e.detail).format("YYYY年MM月DD日"),
      defaultBirthDate: e.detail,
      showDatePicker: false
    })
  },
  showDate(){
    this.setData({
      showDatePicker: true
    })
  },
  onCardNoChange(e){

  },
  saveData(e){
    console.log(e);
  },
  onConfirm(e){
    const { value } = e.detail;
    const { actionType } = this.data;
    this.setData({
      showAction: false
    })
    console.log(value);
    switch (actionType) {
      case 'gender':
        this.setData({
          gender: value
        })
        break;
      case 'card':
        this.setData({
          cardType: value
        })
        break;
      case 'blood':
        this.setData({
          bloodType: value
        })
        break;
      case 'tsize':
        this.setData({
          tSize: value
        })
        break;
    }
  },
  onAddConfirm(e){
    const { values } = e.detail;
    console.log(values);
    const region = values.map(item=>item.name).join('');
    this.setData({
      showAddrPicker: false,
      region
    })
  },
  showPicker(e) {
    const { type } = e.currentTarget.dataset;
    let columns = [];
    switch (type) {
      case 'gender':
        columns = this.data.genders;
        break;
      case 'card':
        columns = this.data.cardTypes;
        break;
      case 'blood':
        columns = this.data.bloodTypes;
        break;
      case 'tsize':
        columns = this.data.tSizes;
        break;
    }
    this.setData({
      actionType: type,
      columns,
      showAction: true
    })
  },
  showAddr(){
    this.setData({
      showAddrPicker: true
    })
  },
  onClose(e){
    const { type } = e.currentTarget.dataset;
    debugger
    switch(type){
      case 'other':
        this.setData({
          showAction: false
        });
        break;
      case 'addr':
        this.setData({
          showAddrPicker: false
        })
        break;
      case 'date':
        this.setData({
          showDatePicker: false
        })
        break;
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  getGenderFromIdCard(idCard){
    return parseInt(idCard.substr(16, 1)) % 2 == 1 ? '男' : '女';
  },
  getBirthdayFromIdCard(idCard) {
    var birthday = "";
    if (idCard) {
      if (idCard.length == 15) {
        birthday = "19" + idCard.substr(6, 6);
      } else if (idCard.length == 18) {
        birthday = idCard.substr(6, 8);
      }

      birthday = birthday.replace(/(.{4})(.{2})/, "$1-$2-");
    }

    return birthday;
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