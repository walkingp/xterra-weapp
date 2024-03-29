const dayjs = require("dayjs");
const { addFeed, checkTextSec } = require("../../../api/feed");
const { updatePoint } = require("../../../api/points");
const { tickPlace } = require("../../../api/venue");
const config = require("../../../config/config");
const { pointRuleEnum } = require("../../../config/const");
const { getCollectionById } = require("../../../utils/cloud");
const i18n = require("./../../../utils/i18n");
const t = i18n.i18n.translate();
// const QQMapWX = require("./../../../utils/qqmap-wx-jssdk.min.js");
// miniprogram/pages/community/new/new.js
// const qqmapsdk = new QQMapWX({
//   key: config.mapKey,
// });
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    mapKey: config.mapKey,
    MAX_METERS: 1 * 1000, // 最大打卡距离
    distance: 0,
    isLogined: false,
    userId: null,
    userInfo: null,
    photolist: [],
    videoCoverUrls: [],
    btnDisabled: false,
    type: null,
    placeId: null,
    place: null,
    isDistanceClose: false,
    isChinese: true,
    message: null,
    validMessage: null,
    places: [],
    selectedPlace: { title: t["所在位置"] },
    showPlaces: false,
  },
  regionchange() {},
  selectPlace(e) {
    const { title, address, lat, lng } = e.target.dataset;
    this.setData({
      showPlaces: false,
      selectedPlace: { title, address, lat, lng },
    });
  },
  clearLocation() {
    this.setData({
      showPlaces: false,
      selectedPlace: { title: t["所在位置"] },
    });
  },
  onClose() {
    this.setData({
      showPlaces: false,
    });
  },
  onPick(e) {
    wx.showLoading();
    const { places } = this.data;
    if (places.length) {
      this.setData({
        showPlaces: true,
      });
      wx.hideLoading();
      return;
    }
    // const that = this;
    // wx.getLocation({
    //   type: "wgs84",
    //   success: function (res) {
    //     const { latitude, longitude } = res;
    //     // 调用接口
    //     qqmapsdk.reverseGeocoder({
    //       sig: config.mapSig, // 必填
    //       location: {
    //         latitude,
    //         longitude,
    //       },
    //       get_poi: 1,
    //       success(val) {
    //         that.setData({
    //           showPlaces: true,
    //           places: val.result.pois,
    //         });
    //         wx.hideLoading();
    //       },
    //       fail(err) {
    //         console.error(err);
    //         wx.showToast({
    //           title: err,
    //         });
    //       },
    //     });
    //   },
    // });
  },
  async bindTextAreaBlur(e) {
    const content = e.detail.value;
    if (!content) {
      return;
    }
    const res = await checkTextSec({ content });
    const isInvalid = res.result.code === -1;
    this.setData({
      btnDisabled: isInvalid,
    });
    if (isInvalid) {
      wx.showToast({
        icon: "none",
        title: res.result.msg,
      });
      return;
    }
  },
  delPhoto(e) {
    const { photolist, videoCoverUrls } = this.data;

    if (photolist.length) {
      const id = e.currentTarget.dataset.id;
      photolist.splice(id, 1);
      videoCoverUrls.splice(id, 1);
      this.setData({
        photolist,
        videoCoverUrls,
      });
    }
  },
  uploadPhoto() {
    var that = this;
    // 选择图片
    wx.chooseMedia({
      count: 9,
      mediaType: ["image", "video"],
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: function (res) {
        const filePath = res.tempFiles.map((item) => item.tempFilePath);
        //const fileType =
        const videoCoverUrls = that.data.videoCoverUrls.concat(
          res.tempFiles
            .filter((item) => item.thumbTempFilePath)
            .map((item) => item.thumbTempFilePath)
        );
        const photolist = that.data.photolist.concat(filePath);
        console.log(photolist);
        that.setData({
          videoCoverUrls,
          photolist,
        });
      },
    });
  },

  showLocation(e) {
    const { place, isChinese } = this.data;
    wx.openLocation({
      longitude: +place.coordinate[0],
      latitude: +place.coordinate[1],
      scale: 16,
      name: isChinese ? place.title : place.titleEn,
      address: place.location,
    });
  },
  savePhoto(e) {
    const { content } = e.detail.value;
    if (!this.data.photolist.length) {
      wx.showToast({
        icon: "none",
        title: t["请选择图片"],
      });
      return;
    }
    this.setData({
      btnDisabled: true,
    });
    //上传图片到云存储
    wx.showLoading({
      title: t["上传中"],
    });
    let promiseArr = [];
    const that = this;
    let { photolist, videoCoverUrls } = this.data;
    for (let i = 0; i < photolist.length; i++) {
      promiseArr.push(
        new Promise((reslove, reject) => {
          let item = photolist[i];
          if (item.startsWith("cloud")) {
            reslove();
          }
          let suffix = /\.\w+$/.exec(item)[0]; //正则表达式返回文件的扩展名
          const folder = dayjs().format("YYYYMMDD");
          if (videoCoverUrls[i]) {
            const _suffix = /\.\w+$/.exec(videoCoverUrls[i])[0];
            wx.cloud.uploadFile({
              cloudPath: `upload/post/${folder}/${new Date().getTime()}${_suffix}`,
              filePath: videoCoverUrls[i], // 小程序临时文件路径
              success: (res) => {
                videoCoverUrls[i] = res.fileID;
              },
            });
          }
          wx.cloud.uploadFile({
            cloudPath: `upload/post/${folder}/${new Date().getTime()}${suffix}`,
            filePath: item, // 小程序临时文件路径
            success: (res) => {
              photolist[i] = res.fileID;
              try {
                wx.cloud
                  .callFunction({
                    name: "checkImage",
                    data: {
                      contentType: "image/png",
                      fileID: res.fileID,
                    },
                  })
                  .then((res) => {
                    console.log("检测结果", res.result);
                    if (
                      res.result.errCode === 0 ||
                      res.result.errCode === 40006 ||
                      res.result.errCode === 40002
                    ) {
                      reslove();
                    } else {
                      wx.showToast({
                        icon: "none",
                        title: "图片含有违法信息",
                      });
                      reject("图片含有违法信息");
                    }
                  });
              } catch (err) {
                reject(err);
              }
            },
            fail: (res) => {
              wx.hideLoading();
              wx.showToast({
                title: "上传失败",
              });
            },
          });
        })
      );
    }
    Promise.all(promiseArr).then(async (res) => {
      this.setData({
        photolist,
        videoCoverUrls,
      });
      await that.saveDB(content);
    });
  },
  async saveDB(content) {
    const {
      photolist,
      videoCoverUrls,
      userId,
      userInfo,
      type,
      placeId,
      selectedPlace,
    } = this.data;

    const { avatarUrl, nickname } = userInfo;
    let data = {
      userId,
      avatarUrl,
      content,
      picUrls: photolist,
      nickName: nickname,
      type,
      placeId,
    };
    if (videoCoverUrls.length) {
      data = { ...data, coverUrls: videoCoverUrls };
    }
    if (selectedPlace.address && selectedPlace.lat && selectedPlace.lng) {
      data.location = selectedPlace;
    }
    const res = await addFeed(data);

    // 加分
    await updatePoint(userId, pointRuleEnum.Post, {
      id: userId,
      title: "发布新贴",
    });
    const id = res.result._id;
    wx.showToast({
      icon: "none",
      title: t["发布成功"],
      success: async function () {
        const res = await tickPlace(placeId, userId);
        let url = "/pages/community/detail/detail?id=" + id;
        if (type === "place") {
          if (res.result === false) {
            url = `/pages/venue/detail/detail?id=${placeId}`;
          } else {
            url = `/pages/venue/detail/detail?id=${placeId}&type=succ`;
          }
        }

        setTimeout(() => {
          wx.redirectTo({
            url,
          });
        }, 1000);
      },
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { placeId, type } = options;
    this.setData(
      {
        placeId,
        type,
      },
      () => {
        if (placeId) {
          this.fetchPlace(placeId);
        }
      }
    );
    app.checkLogin().then((res) => {
      const { isLogined, userId, userInfo } = res;
      if (!isLogined) {
        wx.showToast({
          icon: "none",
          title: t["请先登录"],
          success: function () {
            setTimeout(() => {
              wx.switchTab({
                url: "/pages/my/my",
              });
            }, 1000);
          },
        });
        return;
      }

      this.setData({
        isLogined,
        userId,
        userInfo,
      });
    });
  },
  async fetchPlace(placeId) {
    const place = await getCollectionById({ dbName: "place", id: placeId });
    let markers = null;
    const isChinese = i18n.i18n.getLang();
    const title = isChinese ? place.title : place.titleEn;

    if (place.coordinate) {
      place.coordinate = place.coordinate.map((item) => +item);

      markers = [
        {
          id: 0,
          longitude: place.coordinate[0],
          latitude: place.coordinate[1],
          title,
          iconPath: "/images/icons/marker.png",
          width: 32,
          height: 32,
        },
      ];
    }
    this.setData({
      markers,
      place,
    });
    // wx.getLocation({
    //   type: "gcj02",
    //   success: (res) => {
    //     console.log("当前位置:", res);
    //     const { latitude, longitude } = res;
    //     const distance = this.getDistance(
    //       res.latitude,
    //       res.longitude,
    //       place.coordinate[1],
    //       place.coordinate[0]
    //     );
    //     console.log(distance);
    //     const { MAX_METERS, type, _t } = this.data;
    //     const isDistanceClose =
    //       !place.isGpsRequired ||
    //       (place.isGpsRequired && distance < place.meters);

    //     const btnDisabled = type === "place" && !isDistanceClose;
    //     let message = btnDisabled
    //       ? _t["您当前位置距离目标$0为$1米，超出打卡距离，不可打卡"]
    //       : _t["您当前位置距离目标$0为$1米，可以打卡"];
    //     message = message.replace("$0", title).replace("$1", distance);
    //     let validMessage = _t["您当前位置在$0附近$1米"]
    //       .replace("$0", title)
    //       .replace("$1", distance);
    //     this.setData({
    //       points: [
    //         { latitude, longitude },
    //         { latitude: place.coordinate[1], longitude: place.coordinate[0] },
    //       ],
    //       distance,
    //       isDistanceClose,
    //       btnDisabled,
    //       message,
    //       validMessage,
    //     });
    //   },
    // });
  },
  Rad(d) {
    //根据经纬度判断距离
    return (d * Math.PI) / 180.0;
  },
  getDistance(lat1, lng1, lat2, lng2) {
    // lat1用户的纬度
    // lng1用户的经度
    // lat2商家的纬度
    // lng2商家的经度
    var radLat1 = this.Rad(lat1);
    var radLat2 = this.Rad(lat2);
    var a = radLat1 - radLat2;
    var b = this.Rad(lng1) - this.Rad(lng2);
    var s =
      2 *
      Math.asin(
        Math.sqrt(
          Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
        )
      );
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    s = s.toFixed(3) * 1000;
    console.log("经纬度计算的距离:" + s);
    return s;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
