const {
  getRaceCatesList
} = require("../../../../api/race");
const dayjs = require("dayjs");

// pages/register/steps/step1/step1.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    raceId: {
      type: String
    },
    raceDetail: {
      type: Object
    }
  },
  observers: {
    'raceId': function (raceId) {
      if (raceId) {
        this.fetch();
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectedCateId: null,
    cates: [],
    earlierPriceEndTime: '',
    earlyPriceEndTime: '',
    hasIndividual: false,
    hasRelay: false,
    hasFamily: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    radioChange(e){
      const { value } = e.detail;
      const selectedCateId = this.data.cates.findIndex(item=>item._id === value);
      this.setData({
        selectedCateId
      });
    },
    async fetch() {
      const {
        raceId
      } = this.properties;
      const cates = await getRaceCatesList(raceId);
      console.log(cates);
      const hasIndividual = cates.filter(item=>item.type === 'individual').length > 0;
      const hasRelay = cates.filter(item=>item.type === 'relay').length > 0;
      const hasFamily = cates.filter(item=>item.type === 'family').length > 0;
      this.setData({
        hasIndividual,
        hasRelay,
        hasFamily,
        cates
      });
    }
  }
})