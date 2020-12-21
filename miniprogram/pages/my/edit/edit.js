import areaList from "./../../../config/area";
const dayjs = require("dayjs");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: null,
    userInfo: null,

    areaList: areaList,
    showAddrPicker: false,
    showDatePicker: false,
    showAction: false,
    columns: [],
    trueName: '',
    phoneNum: '',
    email: '',
    gender: '未选择',
    region: '未选择',
    defaultBirthDate: new Date(1990,6,15).getTime(),
    genders: ['男', '女'],
    birthDate: '未选择',
    
    minDate: new Date(1920, 1, 1).getTime(),
    maxDate: new Date().getTime(),

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  selectAddr(){
    const that = this;
    wx.getSetting({
      success(res) {
        console.log("vres.authSetting['scope.address']：",res.authSetting['scope.address'])
        if (res.authSetting['scope.address']) {
          wx.chooseAddress({
            success(res) {
              const { provinceName, cityName, countyName, detailInfo, userName, telNumber, postalCode } = res;
              const region = `${provinceName}${cityName}${countyName}`;
              const addr = detailInfo;
              that.setData({
                trueName: userName,
                phoneNum: telNumber,
                region,
                addr
              });
            }
          })
        } else {
          if (res.authSetting['scope.address'] == false) {
            console.log("222")
            wx.openSetting({
              success(res) {
                console.log(res.authSetting)            
              }
            })
          } else {
            wx.chooseAddress({
              success(res) {
                const { provinceName, cityName, countyName, detailInfo, userName, telNumber, postalCode } = res;
                const region = `${provinceName}${cityName}${countyName}`;
                const addr = detailInfo;
                that.setData({
                  trueName: userName,
                  phoneNum: telNumber,
                  region,
                  addr
                });
              }
            })
          }
        }
      }
    })
  }
})