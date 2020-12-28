const { getPloggingTemplate, getCertTemplate, getCertFields } = require("../../../api/cert");
const { getRaceDetail } = require("../../../api/race");
import { getResultDetail } from "../../../api/result";
import Poster from "./../../../miniprogram_dist/wxa-plugin-canvas/poster/poster";
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
    fields: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id, raceId } = options;
    this.setData({
      id, raceId
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

    const fields = await getCertFields(id);
    console.log(fields)
    this.setData({
      fields
    });

    let cert = null;
    const raceDetail = await getRaceDetail(id);
    if(raceDetail.type === 'X-Plogging'){
      cert = await getPloggingTemplate()
    }else{
      cert = await getCertTemplate(raceDetail._id);
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
      })
    }).catch(error => {
      // handle error
    })
  },
  async formatFields(){
    const { fields, id } = this.data;
    const result = await getResultDetail(id);
    fields.map(item=>{
      switch(item.key){
        case 'trueName':
          item.value = result.trueName;
          break;
        case 'cityName':
          item.value = result.city;
          break;
        case 'year':
          item.value = new Date(result.raceDate).getFullYear();
          break;
        case 'month':
          item.value = new Date(result.raceDate).getMonth() + 1;
          break;
        case 'date':
          item.value = new Date(result.raceDate).getDate();
          break;
      }
      return item;
    })
    this.setData({
      fields
    })
  },
  async onCreatePoster() {
    await this.formatFields();

    const { width, height, tempFileUrl, fields, id } = this.data;

    const texts = fields.map(item=>{
      return {
        textAlign: 'center',
        baseLine: 'bottom',
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