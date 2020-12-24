const { getRaceIndexList, getBannerList } = require("./../../api/race");
const dayjs = require("dayjs");
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
    locations: [
      { text: '地区', value: '' },
      { text: '江浙沪', value: '江浙沪' },
      { text: '京津冀', value: '京津冀' },
      { text: '珠三角', value: '珠三角' },
      { text: '西南地区', value: '西南地区' },
      { text: '其他地区', value: '其他地区' },
      { text: '海外', value: '海外' },
    ],
    statuses: [
      { text: '报名状态', value: '' },
      { text: '未开始报名', value: '未开始报名' },
      { text: '报名中', value: '报名中' },
      { text: '名额已满', value: '名额已满' },
      { text: '报名已截止', value: '报名已截止' },
      { text: '比赛已结束', value: '比赛已结束' },
    ],
    types: [
      { text: '运动类型', value: '' },
      { text: '铁人三项', value: '铁人三项' },
      { text: '越野跑', value: '越野跑' },
      { text: '山地车', value: '山地车' },
      { text: 'X-Plogging', value: 'X-Plogging' },
      { text: '训练营', value: '训练营' },
      { text: '其他', value: '其他' },
    ],
    location: '',
    status: '',
    type: ''
  },
  async fetch(){
    wx.showLoading({
      title: '加载中',
    })
    const races = await getRaceIndexList();
    races.map(item=>{
      item.cates = item.catesName ? item.catesName.join('/') : '/';
      item.raceDate = dayjs(new Date(item.raceDate)).format("MM月DD日");
      return item;
    });
    const banners = await getBannerList("race");
    this.setData({
      allRaces: races,
      races,
      banners,
      loading: false
    }, ()=>{
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  onFilterChanged(e){
    const { type } = e.currentTarget.dataset;
    const value = e.detail;
    let region = '', status = '', _type = '';
    switch(type){
      case 'region':
        region = value;
        break;
      case 'status':
        status = value;
        break;
      case 'type':
        _type = value;
        break;
    }
    let { races, allRaces } = this.data;
    if(region === ''){
      if(status === ''){
        if(type === ''){
          races = allRaces;
        }else{
          races = allRaces.filter(item=> item.type === value);
        }
      }else{
        if(type === ''){
          races = allRaces.filter(item=> item.status === value);
        }else{
          races = allRaces.filter(item=> item.status === status && item.type === _type);
        }
      }
    }else{
      if(status === ''){
        if(type === ''){
          races = allRaces.filter(item=> item.region === value);
        }else{
          races = allRaces.filter(item=> item.type === _type && item.region === region);
        }
      }else{
        if(type === ''){
          races = allRaces.filter(item=> item.status === status && item.region === region);
        }else{
          races = allRaces.filter(item=> item.status === status && item.region === region && item.type === _type);
        }
      }
    }
    this.setData({
      races
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetch();
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