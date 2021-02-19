const config = require('./config/config.js');

require('./utils/libs.js');
//app.js
App({
  towxml: require('/towxml/index'),
  checkLogin() {
    const that = this;
    return new Promise((resolve, reject) => {
      //需要用户同意授权获取自身相关信息
      wx.getSetting({
        success: function (res) {
          if (res.authSetting['scope.userInfo']) {
            //将授权结果写入app.js全局变量
            that.globalData.auth['scope.userInfo'] = true
            //从云端获取用户资料
            wx.cloud.callFunction({
              name: 'get_setUserInfo',
              data: {
                getSelf: true
              },
              success: res => {
                if (res.errMsg == "cloud.callFunction:ok" && res.result) {
                  console.log(res.result.data);
                  //如果成功获取到
                  //将获取到的用户资料写入app.js全局变量
                  that.globalData.userInfo = res.result.data;
                  that.globalData.userId = res.result.data._id;
                  that.globalData.userName = res.result.data.nickname;
                  that.globalData.trueName = res.result.data.truename || res.result.data.nickname;
                  that.globalData.isLogined = true;
                  that.globalData.isAdmin = res.result.data.role === 'admin';

                  resolve({
                    userInfo: res.result.data,
                    userId: res.result.data._id,
                    isLogined: true
                  })
                }else{
                  reject(null)
                }
              },
              fail: err => {
                console.error("get_setUserInfo调用失败", err.errMsg)
                reject(err)
              }
            })
          } else {
            reject({
              message: '未授权'
            })
          }
        },
        fail(err) {
          wx.showToast({
            title: '请检查网络您的状态',
            duration: 800,
            icon: 'none'
          })
          console.error("wx.getSetting调用失败", err.errMsg)
          reject({
            message: err.errMsg
          })
        }
      })
    })
  },
  onLaunch: async function () {
    this.globalData = {
      winHeight: 0,
      userInfo: null,
      userId: null,
      isLogined: false,
      isJoined: false,
      auth: {
        'scope.userInfo': false
      },
    }

    this.checkUpdate();
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: config.env,
        traceUser: true,
      })
      const res = await this.checkLogin();
      console.log(res)
    }

    this.initDeviceInfo();
  },

  initDeviceInfo(){
    const that = this;
    wx.getSystemInfo({
      success: function (res) {
        const clientHeight = res.windowHeight;
        const clientWidth = res.windowWidth;
        const changeHeight = 750 / clientWidth;
        const winHeight = clientHeight * changeHeight;
        that.globalData.winHeight = winHeight;
    }});     
  },

  checkUpdate(){
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        console.log("是否更新版本:", res.hasUpdate)
      })
      updateManager.onUpdateReady(function () {
        updateManager.applyUpdate();
      })
    }
  }  
})
