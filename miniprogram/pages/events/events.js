const { getRaceIndexList, getBannerList } = require("./../../api/race");
const dayjs = require("dayjs");
const { raceStatus } = require("../../config/const");
const app = getApp();
const i18n = require("./../../utils/i18n");
const { getCollectionById } = require("../../utils/cloud");

const _t = i18n.i18n.translate();
// miniprogram/pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    races: [],
    allRaces: [],
    banners: [],
    locations: [],
    statuses: [],
    types: [],
    location: "",
    status: "",
    type: "",
    ids: [],
    filterRaceIds: null,
    filterRaces: []
  },
  initialData() {
    const { _t } = this.data;
    this.setData({
      locations: [
        { text: _t["地区"], value: "" },
        { text: _t["江浙沪"], value: "江浙沪" },
        { text: _t["京津冀"], value: "京津冀" },
        { text: _t["珠三角"], value: "珠三角" },
        { text: _t["西南地区"], value: "西南地区" },
        { text: _t["其他地区"], value: "其他地区" },
        { text: _t["海外"], value: "海外" },
      ],
      statuses: [
        { text: _t["报名状态"], value: "" },
        { text: _t["未开始报名"], value: "未开始报名" },
        { text: _t["报名中"], value: "报名中" },
        { text: _t["名额已满"], value: "名额已满" },
        { text: _t["报名已截止"], value: "报名已截止" },
        { text: _t["比赛已结束"], value: "比赛已结束" },
      ],
      types: [
        { text: _t["活动类型"], value: "" },
        { text: _t["铁人三项"], value: "铁人三项" },
        { text: _t["越野跑"], value: "越野跑" },
        { text: _t["山地车"], value: "山地车" },
        { text: "X-Plogging", value: "X-Plogging" },
        { text: "X-Discovery", value: "X-Discovery" },
        { text: _t["训练营"], value: "训练营" },
        { text: _t["其他"], value: "其他" },
      ],
    });
  },
  async fetch() {
    wx.showLoading({
      title: _t["加载中……"],
    });
    let races = await getRaceIndexList();
    const isChinese = i18n.i18n.getLang();
    races.map((item) => {
      item.cates = item.catesName ? item.catesName.join("/") : "/";
      item.raceDate = dayjs(new Date(item.raceDate)).format(
        isChinese ? "MM月DD日" : "MMMM DD"
      );
      item.isPlogging = item.type === "X-Plogging";

      const status = raceStatus.find((s) => s.value === item.status);
      item.status = status;

      return item;
    });
    this.setData({
      allRaces: races.slice(),
    });
    const { region, status, type, filterRaceIds } = this.data;
    if (type) {
      races = races.filter((item) => item.type === type);
    }
    if (region) {
      races = races.filter((item) => item.region === region);
    }
    if (status) {
      races = races.filter((item) => item.status === status);
    }
    if(filterRaceIds){
      races = races.filter(item=> filterRaceIds.includes(item._id));
      debugger;
    }
    const banners = await getBannerList("race");
    this.setData(
      {
        races,
        banners,
        loading: false,
      },
      () => {
        wx.hideLoading({
          success: (res) => {},
        });
      }
    );
  },
  onFilterChanged(e) {
    const { type } = e.currentTarget.dataset;
    const value = e.detail;
    let { region = "", status = "", _type = "" } = this.data;
    switch (type) {
      case "region":
        region = value;
        break;
      case "status":
        status = value;
        break;
      case "type":
        _type = value;
        break;
    }
    this.setData({
      region,
      status,
      _type,
    });
    const filters = {
      region: region,
      status: status,
      type: _type,
    };
    // https://blog.csdn.net/xuxu_qkz/article/details/81067912
    const keys = Object.keys(filters);
    let { races, allRaces } = this.data;
    races = allRaces.filter((item) => {
      const exist = keys.every((key) => {
        if (filters[key]) {
          return key === "status"
            ? item[key].value === filters[key]
            : item[key] === filters[key];
        } else {
          return true;
        }
      });
      return exist ? item : null;
    });

    this.setData({
      races,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let { region, status, type, ids } = options;
    const { tabBarLink, bid } = app.globalData;
    if (tabBarLink) {
      const args = tabBarLink.substr(tabBarLink.indexOf("?") + 1);
      const arr = args.split("&");
      arr.forEach((item) => {
        const keys = item.split("=");
        let obj = {};
        obj[keys[0]] = keys[1];
        if (keys[0] === "type") {
          type = keys[1];
        }
      });
      app.globalData.tabBarLink = null;
    }
    let filterRaceIds = null;
    if(bid) {
      const banner = await getCollectionById({ dbName: 'banner', id: bid});
      if(banner.raceIds){
        filterRaceIds = banner.raceIds;
      }
    }
    this.setData({
      filterRaceIds,
      region,
      status,
      ids,
      type,
    });
    this.fetch();
    this.watchChanges("race");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  watchChanges(dbName) {
    const db = wx.cloud.database();
    const that = this;
    db.collection(dbName).watch({
      onChange: function (snapshot) {
        const { type } = snapshot;
        if (type !== "init") {
          that.fetch();
        }
        console.log("snapshot", snapshot);
      },
      onError: function (err) {
        console.error("the watch closed because of error", err);
      },
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData(
      {
        _t: i18n.i18n.translate(),
      },
      () => {
        this.initialData();
      }
    );
  },

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
  onShareAppMessage: function () {
    const { type } = this.data;
    return {
      title: "XTERRA",
      imageUrl: "",
      path: `/pages/events/events?type=${type}`,
    };
  },
});
