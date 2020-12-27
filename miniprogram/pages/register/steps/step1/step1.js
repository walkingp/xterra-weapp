const {
  getRaceCatesList, getRaceCateTeamList
} = require("../../../../api/race");
const { raceGroups } = require("../../../../config/const");

const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: {
      type: String,
      value: 'individual'
    },
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
        this.fetchTeams(raceId);
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
    familyTeamTitle: null,
    groupUserType: 'owner',
    actions: [],
    showTeams: false,
    teamTitle: '请选择',
    focus: true,
    relayCate: null,
    familyCate: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onShowTeam(){
      this.setData({
        showTeams: true
      })
    },
    onHideTeam(){
      this.setData({
        showTeams: false
      })
    },
    onSelectTeam(e){
      const { name } = e.detail;
      
      this.setData({
        teamTitle: name
      })
      
      const agreed = this.data.checked && name !== null;
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: agreed });
    },
    onGroupTypeChange(event) {
      const name = event.detail;
      this.setData({
        groupUserType: name,
        focus: groupUserType === 'owner'
      });
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: false });
    },
    onGroupTypeClick(event) {
      const { name } = event.currentTarget.dataset;
      this.setData({
        groupUserType: name,
        teamTitle: '请选择'
      });
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: false });
    },
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
      const { selectedCateId, selectedGroupType, relayTeamTitle, familyTeamTitle, groupUserType,teamTitle } = this.data;
      this.setData({
        checked
      });
      let valid = checked;
      switch(selectedGroupType){
        case 'individual':
          valid = valid && selectedCateId !== null;
          break;
        case 'relay':
          valid = valid && (groupUserType === 'owner' ? !!relayTeamTitle : teamTitle !== '请选择');
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
      if(!value){
        return;
      }
      const { group } = e.currentTarget.dataset;
      const { allCates, checked, groupUserType } = this.data;
      const relayCate = allCates.find(item=>item.type === group);
      if(group === 'relay'){ // 团队
        // 此处区分团队负责和或者加入团队
        if(groupUserType === 'owner'){
          this.saveOrderData(relayCate, value);
        }else if(groupUserType === 'member'){

        }
        this.setData({
          relayTeamTitle: value
        });
      }else{ // 家庭
        this.saveOrderData(relayCate, value);
        this.setData({
          familyTeamTitle: value
        });
      }
      const agreed = checked && !!value;
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: agreed });
    },
    saveOrderData(relayCate, value){
      app.globalData.order = {
        type: this.properties.raceDetail.type,
        price: relayCate.price,
        raceId: this.properties.raceId,
        raceTitle: this.properties.raceDetail.title,
        racePic: this.properties.raceDetail.picUrls,
        raceType: this.properties.raceDetail.type,
        raceDate: this.properties.raceDetail.raceDate,
        cateId: relayCate._id,
        cateTitle: relayCate.title,
        teamTitle: value,
        groupType: this.data.selectedGroupType,
        groupText: this.data.selectedGroupText
      };
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
        raceType: this.properties.raceDetail.type,
        raceDate: this.properties.raceDetail.raceDate,
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
    async fetchTeams(raceId){
      const teams = await getRaceCateTeamList(raceId);
      const actions = teams.map(item => {
        return {
          name: item.teamTitle,
          subname: `已报${item.profiles.length}人`,
          id: item._id
        }
      });
      this.setData({
        actions
      })
    },
    async fetch() {
      wx.showLoading({
        title: '加载中……'
      });
      const {
        raceId
      } = this.properties;
      let cates = await getRaceCatesList(raceId);

      const hasRelay = cates.filter(item=>item.type === 'relay').length > 0;
      const hasFamily = cates.filter(item=>item.type === 'family').length > 0; 
      const hasIndividual = cates.filter(item=>item.type === 'individual').length > 0;

      const that = this;
      console.log(cates);
      const { type } = this.properties;
      const selectedGroupText = raceGroups[type].groupText;

      const relayCates = cates.slice().find(item=>item.type === 'relay');
      const familyCates = cates.slice().find(item=>item.type === 'family');
      
      cates = cates.filter(item=>item.type === 'individual');
      this.setData({
        selectedGroupType: type,
        selectedGroupText,
        focus: type === 'relay',
        allCates: cates,
        hasIndividual,
        hasRelay,
        hasFamily,
        cates: cates.filter(item=>item.type === 'individual'),
        relayCates,
        familyCates
      }, () => {
        const { cateId } = that.data;
        if(cateId){
          that.selectCate(cateId);
        }
        wx.hideLoading({
          success: (res) => {},
        })
      });
    }
  }
})