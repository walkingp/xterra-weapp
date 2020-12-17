import { getProfileDetail } from "../../../api/race";
// miniprogram/pages/register/form/form.js
import areaList from "./../../../config/area";
const dayjs = require("dayjs");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogined: false,
    userId: null,
    userInfo: null,

    raceId: null,
    id: null,
    action: null,
    detail: null,

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
    const idCard = e.detail.value;
    const gender = this.getGenderFromIdCard(idCard);
    const birthDate = this.getBirthdayFromIdCard(idCard);
    this.setData({
      gender,
      birthDate
    });
  },
  async fetch(id){
    const detail = await getProfileDetail(id);
    
    this.setData({
      detail
    });
    const { trueName, cardType, gender, birthDate, bloodType, tSize, region, addr, cardNo, contactUser, contactUserPhone, email, phoneNum } = detail;
    this.setData({
      trueName, cardType, gender, birthDate: dayjs(birthDate).format("YYYY-MM-DD"), bloodType, tSize, region, addr, cardNo, contactUser, contactUserPhone, email, phoneNum
    })
  },
  async saveData(e){
    let profile = e.detail.value;
    const { id, cardType, gender, birthDate, bloodType, tSize, region, userId, userInfo, raceId, action } = this.data;
    profile = { ...profile, cardType, gender, birthDate, bloodType, tSize, region, birthDate: new Date(birthDate), createdAt: new Date(), userId, userName: userInfo.nickname }

    const db = wx.cloud.database();
    if(action === 'edit'){
      const res = await db.collection("profile").doc(id).update({
        data: profile
      });
      console.log(res);
    }else{
      const result = await db.collection("profile").add({
        data: profile
      });
      console.log(result);
    }
    wx.showToast({
      title: '保存成功',
      success: ()=>{
        setTimeout(() => {
          if(raceId){
            wx.redirectTo({
              url: `/pages/register/register?id=${raceId}&step=2`,
            });
            return;
          }
          wx.redirectTo({
            url: '/pages/my/profile/profile',
          })
        }, 2000);
      }
    })
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
  onCancel(){
    this.setData({
      showAction: false
    })
  },
  onDateCancel(){
    this.setData({
      showDatePicker: false
    })
  },
  onClose(e){
    const { type } = e.currentTarget.dataset;
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
    const { id, action, raceId } = options;
    this.setData({
      raceId,
      action,
      id
    });
    if(action === 'edit'){
      this.fetch(id)
    }
    app.checkLogin().then(res=>{
      const { isLogined, userId, userInfo } = res;
      this.setData({
        isLogined,
        userId,
        userInfo
      });
    })
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