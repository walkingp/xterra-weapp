// components/login/login.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isLogined: false,
    isAdmin: false,
    canIUseGetUserProfile: false
  },
  lifetimes: {
    attached: function () {
      if (wx.getUserProfile) {
        this.setData({
          canIUseGetUserProfile: true
        })
      }
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getUserProfile(e) {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
      // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          this.callGetUserInfo(res.userInfo);
        }
      })
    },
    onGotUserInfo: function (e) {
      wx.showLoading({
        title: '登录中',
      })
      //需要用户同意授权获取自身相关信息
      debugger;
      if (e.detail.errMsg == "getUserInfo:ok") {
        this.callGetUserInfo(e.detail.userInfo);
      } else
        console.log("未授权")
    },
    callGetUserInfo(userInfo) {
      var _this = this
      //将授权结果写入app.js全局变量
      app.globalData.auth['scope.userInfo'] = true
      //尝试获取云端用户信息
      wx.cloud.callFunction({
        name: 'get_setUserInfo',
        data: {
          getSelf: true
        },
        success: async res => {
          if (res.errMsg == "cloud.callFunction:ok")
            if (res.result) {
              //如果成功获取到
              //将获取到的用户资料写入app.js全局变量
              console.log(res)
              app.globalData.userInfo = res.result.data.userData
              app.globalData.userId = res.result.data._id
              app.globalData.isLogined = true
              const isAdmin = res.result.data.isAdmin;
              app.globalData.isAdmin = isAdmin

              _this.setData({
                isAdmin,
                isLogined: true,
                isAdmin
              })
            } else {
              //未成功获取到用户信息
              //调用注册方法
              console.log("未注册")
              _this.register({
                nickName: userInfo.nickName,
                gender: userInfo.gender,
                avatarUrl: userInfo.avatarUrl
              })
            }
          await _this.fetch();
          wx.hideLoading({
            success: (res) => {},
          })
        },
        fail: err => {
          wx.showToast({
            title: '请检查网络您的状态',
            duration: 800,
            icon: 'none'
          })
          console.error("get_setUserInfo调用失败", err.errMsg)
        }
      })
    },
    register: function (e) {
      let _this = this
      wx.cloud.callFunction({
        name: 'get_setUserInfo',
        data: {
          setSelf: true,
          userData: e
        },
        success: async res => {
          if (res.errMsg == "cloud.callFunction:ok" && res.result) {
            _this.setData({
              isLogined: true
            })
            app.globalData.userInfo = e
            app.globalData.userId = res.result._id
            app.globalData.isLogined = true
            _this.data.registered = true
            console.log(res)
            await _this.fetch();
          } else {
            console.log("注册失败", res)
            wx.showToast({
              title: '请检查网络您的状态',
              duration: 800,
              icon: 'none'
            })
          }
        },
        fail: err => {
          wx.showToast({
            title: '请检查网络您的状态',
            duration: 800,
            icon: 'none'
          })
          console.error("get_setUserInfo调用失败", err.errMsg)
        }
      })
    },
    async fetch() {
      const {
        userId
      } = app.globalData;
      if (!userId) {
        return;
      }
      const db = wx.cloud.database();
      const result = await db.collection("userlist").doc(userId).get();
      if (result) {
        const detail = result.data;
        console.log(detail)
        this.setData({
          detail,
          isLoaded: true
        }, () => {
          const isAdmin = detail.role === 'admin';
          this.triggerEvent('onCompleted', {
            isLogined: true,
            isAdmin,
            userInfo: detail
          })
        })
      }
    },
  }
})