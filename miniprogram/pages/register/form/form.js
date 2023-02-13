import {
  checkIsJoinedPlogging,
  getMyProfiles,
  getMyRegistrations,
  getPinyin,
  getProfileDetail,
  getRaceCateDetail,
  getRaceDetail
} from "../../../api/race";
import {
  getCateFormFields
} from "./../../../api/profile";
// miniprogram/pages/register/form/form.js
import areaList from "./../../../config/area";
import { checkIDCard } from "./util";
const dayjs = require("dayjs");
const app = getApp();
const i18n = require("./../../../utils/i18n");

const _t = i18n.i18n.translate();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogined: false,
    userId: null,
    userInfo: null,

    pinyinLast: null,
    pinyinFirst: null,
    wechatId: null,

    raceId: null,
    raceDetail: null,

    cateId: null,
    cateDetail: null,

    id: null,
    action: null,
    detail: null,

    plogging: '否',
    isPlogged: false,
    ploggings: ['是', '否'],

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
    relation: '本人',
    nation: '中国',
    relations: ['本人', '家人', '同事', '朋友', '其他'],
    defaultBirthDate: new Date(1990, 5, 15).getTime(),
    genders: ['男', '女'],
    cardTypes: ['身份证', '护照', '军官证', '其他'],
    bloodTypes: ['O', 'A', 'B', 'AB'],
    birthDate: '未选择',
    isPlogging: false,
    isDiscovery: false,

    minDate: new Date(1920, 1, 1).getTime(),
    maxDate: new Date().getTime(),
    tSizes: ['S', 'M', 'L', 'XL'],
    isView: false,

    myProfiles: [],

    fileList: [],
    certPic: null,

    hasCert: null,
    fields: [],
  },
  onRadioChange(e){
    let { fields } = this.data;
    const { idx } = e.target.dataset;
    fields[idx]['value'] = e.detail;
    this.setData({
      fields
    });
  },
  onInputChange(e){
    let { fields } = this.data;
    const { idx } = e.target.dataset;
    fields[idx]['value'] = e.detail.value;
    this.setData({
      fields
    });
  },
  onCheckboxChange(e){
    let { fields } = this.data;
    const { idx } = e.target.dataset;
    fields[idx]['value'] = e.detail;
    this.setData({
      fields
    });
    console.log(e);
  },
  async onNameChange(e) {
    const {value} = e.detail;
    const isChinese = new RegExp("[\\u4E00-\\u9FFF]+", "g").test(value);
    if (!isChinese && value) {
      const index = value.lastIndexOf(' ');
      this.setData({
        nation: '',
        pinyinFirst: value.substr(0, index),
        pinyinLast: value.substr(index + 1)
      })
      return;
    }
    const xing = value.substr(0, 1);
    const ming = value.substr(1);

    let pinyinFirst = await getPinyin(ming);
    let pinyinLast = await getPinyin(xing);
    pinyinFirst = pinyinFirst.join('');
    pinyinLast = pinyinLast.join('');
    this.setData({
      nation: '中国',
      pinyinFirst: pinyinFirst.replace(pinyinFirst[0], pinyinFirst[0].toUpperCase()).replace(/\s/g, ""),
      pinyinLast: pinyinLast.replace(pinyinLast[0], pinyinLast[0].toUpperCase())
    })
  },
  onDateConfirm(e) {
    console.log(e.detail);
    this.setData({
      birthDate: dayjs(e.detail).format("YYYY年MM月DD日"),
      defaultBirthDate: e.detail,
      showDatePicker: false
    })
  },
  showDate() {
    this.setData({
      showDatePicker: true
    })
  },
  async onCardNoChange(e) {
    const idCard = e.detail.value;
    const {
      myProfiles,
      action, cardType
    } = this.data;
    if(idCard.trim()){
      const isValid = cardType === '身份证' && checkIDCard(idCard);
      if(!isValid){
        wx.showToast({
          title: '身份证格式不正确',
          icon: 'none'
        });
        return;
      }
    }
    if (action !== 'edit' && myProfiles.find(item => item.cardNo === idCard)) {
      wx.showToast({
        title: '此证件号码已经添加过',
        icon: 'none'
      });
      return;
    }

    let isPlogged = await checkIsJoinedPlogging(idCard);
    const plogging = isPlogged ? '是' : '否';
    const gender = this.getGenderFromIdCard(idCard);
    const birthDate = this.getBirthdayFromIdCard(idCard);
    this.setData({
      isPlogged: !!isPlogged,
      plogging,
      gender,
      birthDate,
      defaultBirthDate: new Date(birthDate)
    });
  },
  async fetch(id) {
    let detail = await getProfileDetail(id);
    console.log(detail)

    const {
      wechatId,
      pinyinLast,
      pinyinFirst,
      certPic,
      relation,
      club,
      nation,
      trueName,
      cardType,
      gender,
      birthDate,
      bloodType,
      tSize,
      region,
      addr,
      cardNo,
      contactUser,
      contactUserPhone,
      email,
      phoneNum,
      fields
    } = detail;
    if (certPic) {
      this.setData({
        hasCert: true,
        fileList: [{
          url: certPic,
          deletable: true,
        }]
      })
    }
    fields && fields.map(item => {
      if (item.options) {
        item.options_arr = item.options.split(';');
      }
      if(item.defaultVal){
        if(item.defaultVal.split(';').length === 1){
          item.value = item.defaultVal;
        }else{
          item.value = item.defaultVal.split(';');
        }
      }
      return item;
    });
    this.setData({
      fields,
      wechatId,
      pinyinLast,
      pinyinFirst,
      certPic,
      relation: relation || '本人',
      club,
      nation,
      trueName,
      cardType,
      gender,
      defaultBirthDate: birthDate.getTime(),
      birthDate: dayjs(birthDate).format("YYYY-MM-DD"),
      bloodType,
      tSize,
      region,
      addr,
      cardNo,
      contactUser,
      contactUserPhone,
      email,
      phoneNum
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },

  async fetchMyProfiles(userId) {
    const myProfiles = await getMyProfiles(userId);
    let {
      relation,
      relations,
      action
    } = this.data;
    const existedMe = myProfiles.find(item => item.relation === '本人');
    if (existedMe && action !== 'edit') {
      relation = '其他';
      relations.splice(0, 1);
      this.setData({
        relation,
        relations
      });
    }
    this.setData({
      myProfiles
    });
  },
  async saveData(e) {
    let profile = e.detail.value;
    const {
      trueName,
      cardNo,
      phoneNum,
      nation,
      email,
      wechatId
    } = profile;
    const {
      myProfiles,
      id,
      certPic,
      relation,
      cardType,
      gender,
      birthDate,
      defaultBirthDate,
      bloodType,
      tSize,
      region,
      userId,
      userInfo,
      raceId,
      action,
      plogging,
      fields,
      isDiscovery
    } = this.data;
    if (!trueName) {
      wx.showToast({
        title: '姓名不可为空',
        icon: 'none'
      })
      return;
    }
    if (!nation) {
      wx.showToast({
        title: '国籍不可为空',
        icon: 'none'
      })
      return;
    }
    if (!cardNo) {
      wx.showToast({
        title: '证件号码不可为空',
        icon: 'none'
      })
      return;
    }
    if (action !== 'edit' && myProfiles.find(item => item.cardNo === cardNo)) {
      wx.showToast({
        title: '此证件号码已经添加过',
        icon: 'none'
      })
      return;
    }
    if (!phoneNum) {
      wx.showToast({
        title: '手机号不可为空',
        icon: 'none'
      })
      return;
    }
    if (!email && !isDiscovery) {
      wx.showToast({
        title: '邮箱不可为空',
        icon: 'none'
      })
      return;
    }
    let isFieldsNotValid = false;
    if(fields && fields.length){
      isFieldsNotValid = fields.some(item=> item.isRequired && !item.value);
    }
    if(isFieldsNotValid){
      wx.showToast({
        icon: 'none',
        title: `请检查自定义项是否输入完整`,
      })
      return;
    }
    if (birthDate === '未选择') {
      defaultBirthDate = new Date(1900, 1, 1)
    }
    profile = {
      ...profile,
      wechatId,
      certPic,
      relation,
      cardType,
      gender,
      birthDate,
      bloodType,
      tSize,
      plogging,
      region,
      birthDate: new Date(defaultBirthDate),
      createdAt: new Date(),
      userId,
      fields,
      userName: userInfo.nickname
    }
    const db = wx.cloud.database();
    if (action === 'edit') {
      const res = await db.collection("profile").doc(id).update({
        data: profile
      });
      console.log(res);
    } else {
      const result = await db.collection("profile").add({
        data: profile
      });
      console.log(result);
    }
    wx.showToast({
      title: '保存成功',
      success: () => {
        setTimeout(() => {
          if (raceId) {
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
  onConfirm(e) {
    const {
      value
    } = e.detail;
    const {
      actionType
    } = this.data;
    this.setData({
      showAction: false
    })
    console.log(value);
    switch (actionType) {
      case 'plogging':
        this.setData({
          plogging: value
        })
        break;
      case 'relation':
        this.setData({
          relation: value
        })
        break;
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
  onAddConfirm(e) {
    const {
      values
    } = e.detail;
    console.log(values);
    const region = values.map(item => item.name).join('');
    this.setData({
      showAddrPicker: false,
      region
    })
  },
  showPicker(e) {
    const {
      type
    } = e.currentTarget.dataset;
    const {
      isPlogged
    } = this.data;
    let showAction = true;
    let columns = [];
    switch (type) {
      case 'relation':
        columns = this.data.relations;
        break;
      case 'plogging':
        columns = this.data.ploggings;
        showAction = !isPlogged;
        break;
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
      showAction
    })
  },
  showAddr() {
    this.setData({
      showAddrPicker: true
    })
  },
  onCancel() {
    this.setData({
      showAction: false
    })
  },
  onDateCancel() {
    this.setData({
      showDatePicker: false
    })
  },
  onClose(e) {
    const {
      type
    } = e.currentTarget.dataset;
    switch (type) {
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
  onLoad: async function (options) {
    wx.showLoading({
      title: _t['加载中……'],
    })
    app.checkLogin().then(async res => {
      const {
        isLogined,
        userId,
        userInfo
      } = res;

      if (!isLogined) {
        wx.showToast({
          icon: 'none',
          title: '请先登录',
          success: function () {
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/my/my',
              })
            }, 1000);
          }
        });
        return;

      }
      this.setData({
        isLogined,
        userId,
        userInfo
      });
      this.fetchMyProfiles(userId);

      const {
        id,
        action,
        raceId,
        cateId
      } = options;
      this.setData({
        raceId,
        action,
        isView: action === 'view',
        cateId,
        id
      });
      if (action === 'edit') {
        this.fetch(id)
      }
      if (raceId) {
        const raceDetail = await getRaceDetail(raceId);

        const isPlogging = raceDetail.type === 'X-Plogging';
        const isDiscovery = raceDetail.type === 'X-Discovery';
        this.setData({
          isDiscovery,
          isPlogging
        });
      }
      if (cateId) {
        // const cateDetail = await getRaceCateDetail(cateId);
        let cateDetail = await getCateFormFields(cateId);
        console.log(cateDetail)
        cateDetail.fields.map(item => {
          if (item.options) {
            item.options_arr = item.options.split(';');
          }
          if(item.defaultVal.split(';').length === 1){
            item.value = item.defaultVal;
          }else{
            item.value = item.defaultVal.split(';');
          }
          return item;
        })
        console.log(cateDetail)
        this.setData({
          fields: cateDetail.fields,
          cateDetail: cateDetail
        })
      }
      wx.hideLoading({
        success: (res) => {},
      })
    }).catch(err => {
      console.error(err)
      wx.showToast({
        icon: 'none',
        title: '发生错误'
      });
    });
  },
  getGenderFromIdCard(idCard) {
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
  uploadToCloud(event) {
    const {
      file
    } = event.detail;
    wx.cloud.init();
    const that = this;
    if (!file) {
      wx.showToast({
        title: '请选择图片',
        icon: 'none'
      });
    } else {
      wx.showLoading({
        title: '上传中...',
      })
      const suffix = /\.\w+$/.exec(file.url)[0];
      wx.cloud.uploadFile({
        cloudPath: `upload/certs/${new Date().getTime()}${suffix}`,
        filePath: file.url,
        success: async (result) => {
          that.setData({
            certPic: result.fileID,
            fileList: [{
              url: result.fileID,
              deletable: true,
            }]
          });

          wx.hideLoading({
            success: (res) => {},
          })
        },
        fail: err => {
          console.error(err);
        }
      });
    }
  },
  onDeletePic(e){
    const { index } = e.detail;
    this.setData({
      fileList: []
    })
  },
  selectAddr() {
    const that = this;
    wx.getSetting({
      success(res) {
        console.log("vres.authSetting['scope.address']：", res.authSetting['scope.address'])
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