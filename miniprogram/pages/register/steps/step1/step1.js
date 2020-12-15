const {
  getRaceCatesList
} = require("../../../../api/race");

const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    raceId: {
      type: String
    },
    cateId: {
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
    },
    'cateId': function (cateId) {
      if (cateId) {
        this.setData({
          selectedCateId: cateId
        })
        this.triggerEvent('onComplete', { prevEnabled: false, nextEnabled: true });
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
    show: false,
    checked: false,
    relayTeamTitle: null,
    familyTeamTitle: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClose(){
      this.setData({
        show: false
      })
    },
    showDisclaimer(){
      this.setData({
        show: true
      })
    },
    checkAgreement(e){
      const checked = e.detail.value.length > 0;
      const { selectedCateId, selectedGroupType, relayTeamTitle, familyTeamTitle } = this.data;
      this.setData({
        checked
      });
      let valid = checked;
      switch(selectedGroupType){
        case 'individual':
          valid = valid && selectedCateId !== null;
          break;
        case 'relay':
          valid = valid && !!relayTeamTitle;
          break;
        case 'individual':
          valid = valid && !!familyTeamTitle;
          break;
      }
      
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: valid });
    },
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
      this.selectCate(value);
    },
    // 团队报名
    saveTeamTitle(e){
      const { value } = e.detail;
      const { group } = e.currentTarget.dataset;
      const { allCates, checked } = this.data;
      const relayCate = allCates.find(item=>item.type === group);
      if(group === 'relay'){
        this.setData({
          relayTeamTitle: value
        });
      }else{
        this.setData({
          familyTeamTitle: value
        });
      }
      app.globalData.order = {
        price: relayCate.price,
        raceId: this.properties.raceId,
        raceTitle: this.properties.raceDetail.title,
        racePic: this.properties.raceDetail.picUrls,
        cateId: relayCate._id,
        cateTitle: relayCate.title,
        teamTitle: value,
        groupType: this.data.selectedGroupType,
        groupText: this.data.selectedGroupText
      };
      const agreed = checked && !!value;
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: agreed });
    },
    selectCate(value){
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
        cateIndex: selectedCateId,
        cateId: value,
        cateTitle: this.data.cates[selectedCateId].title,
        groupType: this.data.selectedGroupType,
        groupText: this.data.selectedGroupText
      };
      
      const agreed = this.data.checked && selectedCateId !== null;
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: agreed });
    },
    async fetch() {
      const {
        raceId
      } = this.properties;
      let cates = await getRaceCatesList(raceId);
      const hasIndividual = cates.filter(item=>item.type === 'individual').length > 0;
      const hasRelay = cates.filter(item=>item.type === 'relay').length > 0;
      const hasFamily = cates.filter(item=>item.type === 'family').length > 0; 

      const that = this;
      console.log(cates);
      this.setData({
        allCates: cates,
        hasIndividual,
        hasRelay,
        hasFamily,
        cates: cates.filter(item=>item.type === 'individual')
      }, () => {
        const { cateId } = this.data;
        if(cateId){
          that.selectCate(cateId);
        }
      });
    }
  }
})