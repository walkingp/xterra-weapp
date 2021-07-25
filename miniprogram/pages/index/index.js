const {
  getBannerList
} = require("../../api/race");
const app = getApp();
const {
  getNewsIndexList
} = require("../../api/news");
const dayjs = require("dayjs");
const {
  getCityDetailByName,
  getPlaceList,
  getCityList
} = require("../../api/venue");
const config = require("../../config/config");
const QQMapWX = require('./../../utils/qqmap-wx-jssdk.min.js');
let qqmapsdk;

// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    banners: [],
    news: [],
    races: [],
    headerBarHeight: 60,
    current: 0,
    currentCity: null,
    places: []
  },
  swiperChange(e) {
    this.setData({
      current: e.detail.current
    })
  },
  mainSwiperChanged(e) {},
  redirect(e) {
    const {
      url,
      wechaturl
    } = e.currentTarget.dataset;
    if (wechaturl) {
      wx.navigateTo({
        url: `/pages/more/webview/webview?url=${wechaturl}`,
      })
      return;
    }
    wx.navigateTo({
      url,
    })
  },
  tap(e) {
    let {
      src,
      type,
      url
    } = e.currentTarget.dataset;
    const {
      banners
    } = this.data;
    const urls = banners.map(item => item.picUrl);
    switch (type) {
      case 'preview':
        wx.previewImage({
          urls,
          current: src
        });
        break;
      case 'navigate':
        if (!url.startsWith('/')) {
          url = '/' + url;
        }
        url = url.replace('.html', '');
        const isTabbar = url.indexOf("/pages/news/news") >= 0 || url.indexOf("pages/events/events") >= 0;
        if (isTabbar) {
          app.globalData.tabBarLink = url;

          return;
        }
        wx.navigateTo({
          url,
        });
        break;
    }
  },
  async fetchCurrentCity(cityName) {
    const city = await getCityDetailByName(cityName);
    let currentCity = null;
    if (city.length > 0) {
      currentCity = city[0];
    }else{
      const { citys } = this.data;
      currentCity = citys[0];
    }
    wx.setStorageSync(config.storageKey.currentCity, currentCity.cityCN);
    this.setData({
      currentCity
    }, async () => {
      const {
        _id
      } = currentCity;
      const places = await getPlaceList(_id);
      this.setData({
        places
      });
    })
  },
  async fetch() {
    wx.showLoading({
      title: '加载中…',
    });
    const banners = await getBannerList();
    const news = await getNewsIndexList();
    news.map(item => {
      item.formatDate = dayjs(new Date(item.postTime)).format("MM月DD日");
      return item;
    });
    
    const citys = await getCityList();
    this.setData({
      loading: false,
      //races,
      news,
      citys,
      banners
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    });
  },
  watchChanges(dbName) {
    const db = wx.cloud.database()
    const that = this;
    db.collection(dbName).watch({
      onChange: function (snapshot) {
        const {
          type
        } = snapshot;
        if (type !== 'init') {
          that.fetch();
        }
        console.log('snapshot', snapshot)
      },
      onError: function (err) {
        console.error('the watch closed because of error', err)
      }
    })
  },

  async getCity() {
    let currentCity = wx.getStorageSync(config.storageKey.currentCity);
    if (!currentCity) {
      const {citys} = this.data;
      if (citys.length === 1) {
        currentCity = citys[0].cityCN;
      } else {
        this.locateCity();
      }
      wx.setStorageSync(config.storageKey.currentCity, currentCity);
    }else{
      this.fetchCurrentCity(currentCity)
    }
    app.globalData.currentCity = currentCity;

  },

  locateCity() {
    const that = this;
    wx.getSetting({
      success: (res) => {
        console.log(JSON.stringify(res))
        // res.authSetting['scope.userLocation'] == undefined    表示 初始化进入该页面
        // res.authSetting['scope.userLocation'] == false    表示 非初始化进入该页面,且未授权
        // res.authSetting['scope.userLocation'] == true    表示 地理位置授权
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: function (dataAu) {
                    if (dataAu.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 1000
                      })
                      //再次授权，调用wx.getLocation的API
                      wx.getLocation({
                        type: 'wgs84',
                        success(res) {
                          const {
                            latitude,
                            longitude
                          } = res;
                          that.decodeCity({
                            latitude,
                            longitude
                          })
                        }
                      });
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })
        } else if (res.authSetting['scope.userLocation'] == undefined) {
          wx.getLocation({
            type: 'wgs84',
            success(res) {
              const {
                latitude,
                longitude
              } = res;
              that.decodeCity({
                latitude,
                longitude
              })
            }
          });
        } else {
          wx.getLocation({
            type: 'wgs84',
            success(res) {
              const {
                latitude,
                longitude
              } = res;
              that.decodeCity({
                latitude,
                longitude
              })
            }
          });
        }
      }
    })
  },

  decodeCity({
    latitude,
    longitude
  }) {
    const that = this;
    qqmapsdk = new QQMapWX({
      key: config.mapKey
    });
    qqmapsdk.reverseGeocoder({
      sig: config.mapSig, // 必填
      location: {
        latitude,
        longitude
      },
      success(res) {
        const locatedCity = res.result.ad_info.city.replace('市','');
        that.fetchCurrentCity(locatedCity);
      },
      fail(err) {
        console.log(err)
        wx.showToast('获取城市失败')
      },
      complete() {
        // 做点什么

      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    await this.fetch();
    this.getCity();
    this.watchChanges('banner');
    this.watchChanges('news');
    this.setData({
      headerBarHeight: app.globalData.headerBarHeight
    })
  },
  onShow() {}
})