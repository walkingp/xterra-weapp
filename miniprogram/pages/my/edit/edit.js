import { getUserDetail } from "../../../api/user";
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

    showAction: false,
    columns: [],
    nickname: '',
    trueName: '',
    phoneNum: '',
    email: '',
    gender: '未选择',
    region: '未选择',
    defaultBirthDate: new Date(1990,6,15).getTime(),
    genders: [{name: '男'}, {name: '女'}],
    birthDate: '未选择',
    
    minDate: new Date(1920, 1, 1).getTime(),
    maxDate: new Date().getTime(),

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中……',
    })
    app.checkLogin().then(async res => {
      const { userId, userInfo } = res;
      this.setData({
        nickname: userInfo.nickname,
        userId
      });
      const data = await getUserDetail(userId);
      const { truename, phonenumber, gender } = data;
      this.setData({
        trueName:truename,
        phoneNum: phonenumber,
        gender:  isNaN(gender) ? gender : (gender === 0 ? '男' : '女')
      }, () => {
        wx.hideLoading({
          success: (res) => {},
        })
      })
    })
  },
  showAction(){
    this.setData({ showAction: true });
  },
  onClose() {
    this.setData({ showAction: false });
  },
  async saveData(e){
    const { phoneNum, trueName } = e.detail.value;
    const { gender, userId } = this.data;
    if(!phoneNum || !trueName || gender === '请选择'){
      wx.showToast({
        icon: 'none',
        title: '请填写完整资料',
      })
      return;
    }
    const db = wx.cloud.database();
    const result = await db.collection("userlist").doc(userId).update({
      data: {
        gender,
        truename: trueName,
        phonenumber: phoneNum
      }
    });
    wx.showToast({
      icon: 'success',
      title: '保存成功',
      success: ()=> {
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/my/my',
          })          
        }, 1000);
      }
    });
  },
  onSelect(event) {
    const { name } = event.detail;
    this.setData({
      gender: name
    })
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