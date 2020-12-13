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
    allCates: [],
    earlierPriceEndTime: '',
    earlyPriceEndTime: '',
    hasIndividual: false,
    hasRelay: false,
    hasFamily: false,
    selectedGroupType: 'individual',
    selectedGroupText: '个人组',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeGroup(e){
      const { type, title } = e.currentTarget.dataset;
      const { allCates } = this.data;
      const cates = allCates.filter(item=> item.type === type);  
      this.setData({
        cates,
        selectedGroupType: type,
        selectedGroupText: title
      })
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: false });
    },
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
        racePic: this.properties.raceDetail.picUrls,
        cateId: selectedCateId,
        cateTitle: this.data.cates[selectedCateId].title,
        groupType: this.data.selectedGroupType,
        groupText: this.data.selectedGroupText
      };
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: true });
    },
    async fetch() {
      const {
        raceId
      } = this.properties;
      let cates = await getRaceCatesList(raceId);
      const hasIndividual = cates.filter(item=>item.type === 'individual').length > 0;
      const hasRelay = cates.filter(item=>item.type === 'relay').length > 0;
      const hasFamily = cates.filter(item=>item.type === 'family').length > 0;    
      cates.map(cate=>{
        const now = dayjs(new Date());
        if(now.isBefore(cate.regEndTime)){if(cate.enableEarlierBirdPrice){
            if(now.isBefore(cate.earlierPriceEndTime)){
              cate.price = cate.earlierBirdPrice;
              cate.priceLabel = '早早鸟价';
            }else{
              cate.price = cate.earlyBirdPrice;
              cate.priceLabel = '早鸟价';
            }
          }else if(cate.enableEarlyBirdPrice){
            if(now.isBefore(cate.earlyPriceEndTime)){
              cate.price = cate.earlyBirdPrice;
              cate.priceLabel = '早鸟价';
            }else{
              cate.price = cate.regPrice;
              cate.priceLabel = '正常价';
            }
          } 
        }else{ // 已超报名截止时间
          cate.expired = true;
          cate.priceLabel = '报名已结束';
        }
        // 格式化
        if(cate.enableEarlierBirdPrice){
          cate.earlierPriceEndTime = dayjs(cate.earlierPriceEndTime).format("YYYY年MM月DD日");
        }
        if(cate.enableEarlyBirdPrice){
          cate.earlyPriceEndTime = dayjs(cate.earlyPriceEndTime).format("YYYY年MM月DD日");
        }

        //此处用于判断当前价格

        cate.price = cate.earlierBirdPrice;

        return cate;
      });

      
      console.log(cates);
      this.setData({
        allCates: cates,
        hasIndividual,
        hasRelay,
        hasFamily,
        cates
      });
    }
  }
})