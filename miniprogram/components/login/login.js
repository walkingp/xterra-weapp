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
    isLogined: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onGotUserInfo: function (e) {
      wx.showLoading({
        title: '登录中',
      })
      var _this = this
      //需要用户同意授权获取自身相关信息
      if (e.detail.errMsg == "getUserInfo:ok") {
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
                  isLogined: true,
                  isAdmin
                })
              } else {
                //未成功获取到用户信息
                //调用注册方法
                console.log("未注册")
                _this.register({
                  nickName: e.detail.userInfo.nickName,
                  gender: e.detail.userInfo.gender,
                  avatarUrl: e.detail.userInfo.avatarUrl
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
      } else
        console.log("未授权")
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
        },()=>{
          this.triggerEvent('onCompleted', { isLogined: true, userInfo: detail })
        })
      }
    },
  }
})