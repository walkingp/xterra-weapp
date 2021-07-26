import {
  updatePoint
} from "../../../api/points";
import {
  getUserDetail
} from "../../../api/user";
import config from "../../../config/config";
import {
  pointRuleEnum
} from "../../../config/const";
const app = getApp();
const i18n = require("./../../../utils/i18n");

const _t = i18n.i18n.translate();
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
    gender: _t['未选择'],
    region: _t['未选择'],
    defaultBirthDate: new Date(1990, 6, 15).getTime(),
    genders: [{
      name: _t['男']
    }, {
      name: _t['女']
    }],
    birthDate: '未选择',
    lang: null,
    langs: [{
      name: '中文'
    }, {
      name: 'English'
    }],
    minDate: new Date(1930, 1, 1).getTime(),
    maxDate: new Date().getTime(),
    actions: null,
    type: null

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: _t['加载中……'],
    })
    const isChinese = wx.getStorageSync(config.storageKey.isChinese);
    this.setData({
      lang: isChinese ? '中文' : 'English'
    });
    app.checkLogin().then(async res => {
      const {
        userId,
        userInfo
      } = res;
      this.setData({
        nickname: userInfo.nickname,
        userId
      });
      const data = await getUserDetail(userId);
      const {
        truename,
        phonenumber,
        gender
      } = data;
      this.setData({
        trueName: truename,
        phoneNum: phonenumber,
        gender: isNaN(gender) ? gender : (gender === 0 ? '男' : '女')
      }, () => {
        wx.hideLoading({
          success: (res) => {},
        })
      })
    })
  },
  showAction(e) {
    const {
      name
    } = e.currentTarget.dataset;
    const {
      langs,
      genders
    } = this.data;
    this.setData({
      showAction: true,
      type: name,
      actions: name === 'gender' ? genders : langs
    });
  },
  onClose() {
    this.setData({
      showAction: false
    });
  },
  async saveData(e) {
    this.saveLang();
    const {
      phoneNum,
      trueName
    } = e.detail.value;
    const {
      gender,
      userId
    } = this.data;
    if (!phoneNum || !trueName || gender === '请选择') {
      wx.showToast({
        icon: 'none',
        title: _t['请填写完整资料'],
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
    // 加分
    const data = await updatePoint(userId, pointRuleEnum.UpdateProfile, {
      id: userId,
      title: trueName
    })
    wx.showToast({
      icon: 'none',
      title: _t['保存成功'],
      success: () => {
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/my/my',
          })
        }, 1000);
      }
    });
  },
  saveLang(){
    const { lang } = this.data;
    const isChinese = lang === '中文';
    wx.setStorageSync(config.storageKey.isChinese, isChinese);
    getApp().globalData.isChinese = isChinese;    
  },
  onSelect(event) {
    const name = event.detail.name;
    const { type } = this.data;
    if(type === 'gender'){
      this.setData({
        gender: name
      })
    }else{
      this.setData({
        lang: name
      });
    }
  },
  selectAddr() {
    const that = this;
    wx.getSetting({
      success(res) {
        console.log("res.authSetting['scope.address']：", res.authSetting['scope.address'])
        if (res.authSetting['scope.address']) {
          wx.chooseAddress({
            success(res) {
              const {
                provinceName,
                cityName,
                countyName,
                detailInfo,
                userName,
                telNumber,
                postalCode
              } = res;
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
                const {
                  provinceName,
                  cityName,
                  countyName,
                  detailInfo,
                  userName,
                  telNumber,
                  postalCode
                } = res;
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