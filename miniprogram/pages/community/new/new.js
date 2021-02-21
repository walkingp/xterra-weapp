const dayjs = require("dayjs");
const {
  addFeed, checkTextSec
} = require("../../../api/feed");
const { updatePoint } = require("../../../api/points");
const { pointRuleEnum } = require("../../../config/const");

// miniprogram/pages/community/new/new.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogined: false,
    userId: null,
    userInfo: null,
    photolist: [],
    btnDisabled: false
  },
  async bindTextAreaBlur(e){
    const content = e.detail.value;
    if(!content){
      return;
    }
    const res = await checkTextSec({ content });
    const isInvalid = res.result.code === -1;
    this.setData({
      btnDisabled: isInvalid
    })
    if(isInvalid){
      wx.showToast({
        icon: 'none',
        title: res.result.msg,
      })
      return;
    }
  },

  uploadPhoto() {
    var that = this;
    // 选择图片
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const filePath = res.tempFilePaths
        const photolist = that.data.photolist.concat(filePath);
        console.log(photolist);
        that.setData({
          photolist
        });
      }
    });
  },
  savePhoto(e) {
    const { content } = e.detail.value;
    if (!this.data.photolist.length) {
      wx.showToast({
        icon: 'none',
        title: '请选择图片'
      });
      return;
    }
    //上传图片到云存储
    wx.showLoading({
      title: '上传中',
    })
    let promiseArr = [];
    const that = this;
    let {
      photolist
    } = this.data;
    for (let i = 0; i < photolist.length; i++) {
      promiseArr.push(new Promise((reslove, reject) => {
        let item = photolist[i];
        let suffix = /\.\w+$/.exec(item)[0]; //正则表达式返回文件的扩展名
        const folder = dayjs().format("YYYYMMDD");
        wx.cloud.uploadFile({
          cloudPath: `upload/post/${folder}/${new Date().getTime()}${suffix}`,
          filePath: item, // 小程序临时文件路径
          success: res => {
            photolist[i] = res.fileID;
            try {
              wx.cloud.callFunction({
                name: 'checkImage',
                data: {
                  contentType: "image/png",
                  fileID: res.fileID
                }
              }).then(res => {
                console.log("检测结果", res.result);
                if (res.result.errCode === 0) {
                  reslove();
                } else {
                  wx.showToast({
                    icon: 'none',
                    title: '图片含有违法信息',
                  })
                  reject(err)
                }
              })
            } catch (err) {
              reject(err)
            }
          },
          fail: res => {
            wx.hideLoading();
            wx.showToast({
              title: "上传失败",
            })
          }
        })
      }));
    }
    Promise.all(promiseArr).then(async res => {
      this.setData({
        photolist
      })
      await that.saveDB(content);
      wx.showToast({
        title: "发布成功",
      });
      wx.hideLoading();
      const url = ''
      wx.redirectTo({
        url
      })
    })
  },
  async saveDB(content) {
    const {
      photolist,
      userId,
      userInfo
    } = this.data;

    const {
      avatarUrl,
      nickname
    } = userInfo;
    const res = await addFeed({
      userId,
      avatarUrl,
      content,
      picUrls: photolist,
      nickName: nickname
    });
    
    // 加分
    await updatePoint(userId, pointRuleEnum.Post, {
      id: userId,
      title: '发布新贴'
    });
    const id = res.result._id;
    wx.showToast({
      icon: 'success',
      title: '发布成功',
      success: function(){
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/community/detail/detail?id=' + id,
          })
        }, 1000);
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.checkLogin().then(res => {
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
    });
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