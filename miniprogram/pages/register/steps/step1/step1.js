const {
  getRaceCatesList
} = require("../../../../api/race");
const dayjs = require("dayjs");

const app = getApp();
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
      const selectedCate = this.data.cates.find(item=>item._id === value);
      this.setData({
        selectedCateId
      });
      app.globalData.order = {
        price: selectedCate.price,
        raceId: this.properties.raceId,
        raceTitle: this.properties.raceDetail.title,
        cateId: selectedCateId,
        cateTitle: this.data.cates[selectedCateId].title
      };
    },
    async fetch() {
      const {
        raceId
      } = this.properties;
      const cates = await getRaceCatesList(raceId);
      cates.map(cate=>{
        cate.earlierPriceEndTime = dayjs(cate.earlierPriceEndTime).format("YYYY年MM月DD日");
        cate.earlyPriceEndTime = dayjs(cate.earlyPriceEndTime).format("YYYY年MM月DD日");

        //此处用于判断当前价格
        cate.price = cate.earlierBirdPrice;

        return cate;
      });
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