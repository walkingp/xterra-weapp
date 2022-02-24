const { getPloggingTemplate, getCertTemplate, getCertFields } = require("../../../api/cert");
const { getRaceDetail, getRaceCateDetail, getPinyin } = require("../../../api/race");
import { getResultDetail } from "../../../api/result";
const i18n = require("./../../../utils/i18n");

const _t = i18n.i18n.translate();
import Poster from "./../../../miniprogram_npm/wxa-plugin-canvas/poster/poster";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    raceId: null,
    id: null,
    tempFileUrl: null,
    width: 100,
    height: 100,
    certUrl: null,
    fields: [],
    isPlogging: false,
    isTriRace: false,
    type: null,
    isMillionForrest: false
  },
  redirect(){
    const { isMillionForrest, raceId, cateId, id } = this.data;
    const url = isMillionForrest ? `/pages/events/cert/cert?raceId=${raceId}&cateId=${cateId}&id=${id}` : `/pages/events/cert/cert?raceId=${raceId}&cateId=${cateId}&id=${id}&type=million-forrest`;
    wx.navigateTo({
      url
    });
  },
  backTo(){
    wx.navigateBack({
      delta: 1,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id, raceId, cateId, type } = options;
    this.setData({
      id, raceId, type, cateId,
      isMillionForrest: type === 'million-forrest'
    })
    this.fetchRaceDetail(raceId);
  },
  onImageLoad(e){
    const { width, height } = e.detail;
    this.setData({
      width, height
    })
    this.onCreatePoster();
  },
  async fetchRaceDetail(id){
    wx.showLoading({
      title: _t['加载中'],
    });

    let cert = null;
    const raceDetail = await getRaceDetail(id);
    const isPlogging = raceDetail.type === 'X-Plogging';
    const isTriRace = raceDetail.type === '铁人三项';
    this.setData({
      isPlogging,
      isTriRace
    })
    wx.setNavigationBarTitle({
      title: raceDetail.title,
    })
    const fields = await getCertFields(id, isPlogging);
    console.log(fields)
    this.setData({
      fields
    });
    const { isMillionForrest } = this.data;
    const temps = await getPloggingTemplate();
    if(isPlogging){
      // 百万森林
      cert = isMillionForrest ? temps[1] : temps[0];
    }else{
      cert = isMillionForrest ? temps[1] : await getCertTemplate(raceDetail._id);
    }

    const { tempFileUrl } = cert;
    wx.cloud.getTempFileURL({
      fileList: [{
        fileID: tempFileUrl
      }]
    }).then(res => {
      // get temp file URL
      const url = res.fileList[0].tempFileURL;
      this.setData({
        tempFileUrl: url
      }, () => {
        wx.hideLoading({
          success: (res) => {},
        })
      })
    }).catch(error => {
      wx.showToast({
        icon: 'none',
        title: '生成失败',
      });
    })
  },

  async formatCityName(city){
    const arr = await getPinyin(city.replace('市',''));
    const chars = [...arr.join('')];
    chars[0] = chars[0].toUpperCase();
    return chars.join('')
  },
  async formatFields(){
    let { fields, id, isMillionForrest, isTriRace, isPlogging, cateId } = this.data;
    const result = await getResultDetail(isTriRace, id);
    const cityNameEn = await this.formatCityName(result.city);
    if(isPlogging){
      const cateDetail = await getRaceCateDetail(cateId);
      fields.map(async item=>{
        switch(item.key){
          case 'trueName':
            item.value = result.trueName;
            break;
          case 'cityName':
            item.value = result.city;
            break;
          case 'cityNameEn':
            item.value = cityNameEn;
            break;
          case 'year':
            item.value = new Date(cateDetail.cateDate || result.raceDate).getFullYear();
            break;
          case 'month':
            item.value = new Date(cateDetail.cateDate || result.raceDate).getMonth() + 1;
            break;
          case 'date':
            item.value = new Date(cateDetail.cateDate || result.raceDate).getDate();
            break;
          case 'yearMonthDate':
            item.value = [new Date(cateDetail.cateDate || result.raceDate).getFullYear(),
              new Date(cateDetail.cateDate || result.raceDate).getMonth() + 1,
              new Date(cateDetail.cateDate || result.raceDate).getDate()].join('-')
            break;
        }
        return item;
      })
    }else{//正常比赛
      fields.map(item=>{
        item.value = result[item.key];
        return item;
      })
    }
    if(isMillionForrest){
      fields = [{
        color: "#333",
        fontSize: 40,
        key: "millionForrestNo",
        posX: 210,
        posY: 200,
        textAlign: 'left',
        value: result.millionForrestNo
      },{
        color: "#333",
        fontSize: 80,
        key: "trueName",
        posX: 420,
        posY: 420,
        textAlign: 'left',
        value: result.trueName
      }]
    }
    this.setData({
      fields
    })
  },
  async onCreatePoster() {
    await this.formatFields();

    const { width, height, tempFileUrl, fields, id } = this.data;

    const texts = fields.map(item=>{
      return {
        textAlign: item.textAlign || 'center',
        baseLine: 'bottom',
        fontWeight: item.fontWeight || 'bold',
        x: item.posX,
        y: item.posY,
        text: item.value,
        fontSize: item.fontSize,
        color: item.color
      }
    });
    const config = {
      width,
      height,
      backgroundColor: '#fff',
      debug: false,
      pixelRatio: 1,
      images: [
        {
          width,
          height,
          x: 0,
          y: 0,
          url: tempFileUrl
        }
      ],
      texts
    };
    this.setData({ posterConfig: config }, () => {
      setTimeout(() => {
        Poster.create(true);
      }, 200);
    });
  },
  onPosterSuccess(e) {
    const {
      detail
    } = e;
    this.setData({
      certUrl: detail
    })
  },
  onTapImg(){
    const { certUrl } = this.data;
    wx.showToast({
      icon: 'none',
      title: '长按即可保存',
    })
    wx.previewImage({
      current: certUrl,
      urls: [certUrl]
    })
  },
  onPosterFail(e) {
    console.error(e)
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