const app = getApp();
const { getdetail, getRaceDetail } = require("../../../api/race");
const config = require("../../../config/config");
// miniprogram/pages/news/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    detail: null,
    mandatoryEquips: [],
    optionalEquips: [],
    mandatoryKits: [],
    optionalKits: [],
    localKits: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: _t['加载中'],
    })
    const { id } = options;

    this.setData({
      id
    });
    this.fetchdetail(id);
    this.fetchStorage();
  },

  fetchStorage(){
    const localKits = wx.getStorageSync(config.storageKey.kits);

    if(localKits){ 
      const { id } = this.data;
      const currentKits = localKits.find(item => item.raceId === id);
      if(currentKits){     
        const { mandatoryKits, optionalKits } = currentKits;
        this.setData({
          localKits, mandatoryKits, optionalKits
        })
      }
      return;
    }
    this.setData({
      localKits: []
    })
  },

  saveStorage(){
    let { localKits, mandatoryKits, optionalKits, id } = this.data;
    const value = {
      raceId: id,
      mandatoryKits,
      optionalKits
    };
    const index = localKits.findIndex(item => item.raceId === id);
    if(index >= 0){
      localKits.splice(index, 1, value);
    } else {
      localKits.push(value)
    }
    wx.setStorageSync(config.storageKey.kits, localKits)
  },

  async fetchdetail(id){
    const detail = await getRaceDetail(id);
    const { mandatoryEquips, optionalEquips } = detail;
    this.setData({
      detail, mandatoryEquips, optionalEquips
    }, ()=>{
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  onChange(event) {
    const { type } = event.currentTarget.dataset;
    if(type === 'm'){
      this.setData({
        mandatoryKits: event.detail
      });
    }else{
      this.setData({
        optionalKits: event.detail
      });
    }

    this.saveStorage();
  },

  toggle(event) {
    const { index, type } = event.currentTarget.dataset;
    const checkbox = this.selectComponent(`.checkboxes-${type}${index}`);
    checkbox.toggle();
  },

  noop() {}
})