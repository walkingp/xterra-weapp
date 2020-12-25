const { getRaceDetail, getRaceCatesList, getRaceNewsList } = require("./../../../api/race");
const dayjs = require("dayjs");
const config = require("../../../config/config");
const { raceStatus } = require("../../../config/const");
const app = getApp();
// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mapKey: null,
    markers: [],
    id: null,
    loading: false,
    detail: null,
    news: [],
    cates: [],
    type: '活动',
    active: 'content',
    regBtnEnabled: false,
    pageIndex: 1,
    pageSize: 2,
    hasMoreData: true
  },
  register(){
    const { id } = this.data;
    wx.navigateTo({
      url: `/pages/register/register?id=${id}`,
    })
  },
  async fetch(id){
    wx.showLoading({
      title: '加载中...',
    });
    let { active, pageIndex, pageSize } = this.data;
    const detail = await getRaceDetail(id);

    const status = raceStatus.find(s => s.value === detail.status);
    detail.status = status;

    console.log(detail);
    detail.cates = detail.catesName ? detail.catesName.join('/') : '/';
    detail.isEnded = dayjs(new Date(detail.raceDate)).isBefore(dayjs());// 是否截止
    detail.raceDate = dayjs(new Date(detail.raceDate)).format("YYYY年MM月DD日");
    detail.endRegTime = dayjs(new Date(detail.endRegTime)).format("YYYY年MM月DD日 HH:mm:ss");
    detail.regStartTimeStr = dayjs(new Date(detail.regStartTime)).format("YYYY年MM月DD日 HH:mm:ss");
    detail.showAdminssion = detail.admission && detail.admission !== '<p>欢迎使用富文本编辑器</p>';
    detail.admission = app.towxml(detail.admission,'html'); // 报名须知
    detail.showContent = detail.content && detail.content !== '<p>欢迎使用富文本编辑器</p>';
    detail.content = app.towxml(detail.content,'html');
    detail.showFlow = detail.flow && detail.flow !== '<p>欢迎使用富文本编辑器</p>';
    detail.flow = app.towxml(detail.flow,'html');
    detail.showCuisine = detail.cuisine && detail.cuisine !== '<p>欢迎使用富文本编辑器</p>';
    detail.cuisine = app.towxml(detail.cuisine,'html'); // 美食美景
    if(detail.showContent){
      active = 'content'
    }else{
      if(detail.showAdminssion){
        active = 'admission'
      }else{
        if(detail.showFlow){
          active = 'flow';
        }
      }
    }
    detail.picUrls = detail.picUrls.map(item=> {
      return {
        picUrl: item,
        type: 'preview'
      }
    });
    if(detail.routePics){
      detail.routePics = detail.routePics.map(item=> {
        return {
          picUrl: item,
          type: 'preview'
        }
      });
    }

    let markers = null;
    if(detail.coordinate){
      detail.coordinate = detail.coordinate.map(item=>+item);

      markers = [{
        id: 0,
        longitude: detail.coordinate[0],
        latitude: detail.coordinate[1],
        title: '卢湾体育中心',
        iconPath: '/images/icons/marker.png',
        width: 32,
        height: 32
      }];
    }

    const cates = await getRaceCatesList(id);
    cates.map(item=>{
      item.desc = item.desc.trim();
      return item;
    })
    const news = await getRaceNewsList(id, pageIndex, pageSize);
    news.map(item=>{
      item.formatDate = dayjs(new Date(item.postTime)).format("MM月DD日");
      return item;
    });
    
    // 最下方按钮状态 有组别 && (报名状态为“报名中” || 报名开始时间)
    const regBtnEnabled = cates.length > 0 && (detail.status === '报名中' || dayjs().isAfter(dayjs(new Date(detail.regStartTime))));

    const type =  ['越野跑', '铁人三项', '山地车'].indexOf(detail.type) >= 0 ? '赛事' : '活动';
    this.setData({
      regBtnEnabled,
      type,
      active,
      loading: false,
      cates,
      news,
      markers,
      detail
    }, ()=>{
      wx.hideLoading({
        success: (res) => {},
      })
    });
  },
  async loadMoreNews(){
    wx.showLoading({
      title: '加载中……',
    })
    let { id, pageIndex, pageSize, news } = this.data;
    pageIndex = pageIndex + 1;
    const newData = await getRaceNewsList(id, pageIndex, pageSize);
    newData.map(item=>{
      item.formatDate = dayjs(new Date(item.postTime)).format("MM月DD日");
      return item;
    });
    this.setData({
      hasMoreData: newData.length > 0,
      pageIndex,
      news: [...news, ...newData]
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
    });
  },
  onLoad: function (options) {
    const { id } = options;
    const { mapKey } = config;
    this.setData({
      mapKey,
      id
    });
    this.fetch(id);
  },
  showLocation(e) {
    const {
      detail
    } = this.data;
    wx.openLocation({
      longitude: +detail.coordinate[0],
      latitude: +detail.coordinate[1],
      scale: 16,
      name: detail.title,
      address: detail.location
    });
  },
  regionchange(e){

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