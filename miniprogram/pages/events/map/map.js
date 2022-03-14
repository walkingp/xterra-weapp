const dayjs = require("dayjs");
const config = require("../../../config/config");
const { getCollectionById } = require("../../../utils/cloud");

// pages/events/map/map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    subKey: config.mapKey,
    startId: null,
    detail: null,
    markers: [],
    polyline: [],
    jsonUrl: null,
    points: [],
    markers: [],
    properties: null
  },
  async fetchDetail(startId){
    const detail = await getCollectionById({ dbName: 'start-list', id: startId});
    this.setData({
      detail
    });
  },
  async loadJSON(url){
    const res = await wx.cloud.downloadFile({
      fileID: url
    });
    const fs = wx.getFileSystemManager();
    try{
      const res2 = fs.readFileSync(res.tempFilePath, 'utf8');
      const { geometry, properties } = JSON.parse(res2)?.features?.[0];
      const { coordinates } = geometry;
      this.setData({
        properties
      });
      return coordinates;
    } catch(e) {
      wx.showToast({
        title: '读取失败',
        icon: 'error'
      })
      return [];
    }
  },
  async loadMapData(jsonUrl){
    let points = await this.loadJSON(jsonUrl);
    const { properties } = this.data;
    points = points.map(item=> {
      return { longitude: item[0], latitude: item[1] }
    });
    const markers = [{
      iconPath: "/images/icons/start.png",
      id: 0,
      ...points[0],
      width: 14,
      height: 14,
      zIndex: 2,
      callout:{
        content: `开始时间：${dayjs(properties.time).format("YYYY-MM-DD HH:mm:ss")}`,
        padding:10,
        display:'BYCLICK',
        textAlign:'center'
      }
    }, {
      iconPath: "/images/icons/stop.png",
      id: 1,
      ...points[points.length - 1],
      width: 14,
      height: 14,
      zIndex: 3,
      callout:{
        content: '终点',
        padding:10,
        display:'BYCLICK',
        textAlign:'center'
      }
    }];

    const polyline = [{
      points,
      color: "#dd0000",
      width: 4,
    }]
    this.setData({
      points, polyline, markers
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    const { jsonUrl, startId } = options;
    this.loadMapData(decodeURIComponent(jsonUrl));
    this.fetchDetail(startId);
  },
  regionchange(e){},

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