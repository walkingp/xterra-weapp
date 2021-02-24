const dayjs = require("dayjs");
const {
  getRaceCatesList, getRaceCateTeamList, checkTeamExisted, getStartListCountByCateId
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
    },
    _teamTitle: {
      type: String
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
    },
    'raceDetail': function (detail) {
      if(detail){
        const isSameYear = new Date(detail.refundLastDate).getFullYear() === new Date().getFullYear();
        this.setData({
          refundRateStr: Math.floor(detail.refundRate * 100),
          lastRefundDate: dayjs(detail.refundLastDate).format(isSameYear ? "MM月DD日" : "YYYY年MM月DD")
        })
      }
    },
    '_teamTitle': function (_teamTitle) {
      if(_teamTitle){
        this.setData({
          teamTitle: _teamTitle,
          isInvited: true,
          groupUserType: 'member'
        })
      }
    },
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
      this.watchChanges();
     },
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
    lastRefundDate: '',
    refundRateStr: null,
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
    allTeams: [],
    showTeams: false,
    teamTitle: '请选择',
    focus: true,
    relayCate: null,
    familyCate: null,
    isInvited: false
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
      const { relayCate } = this.data;
      if(relayCate.limit > 0 && relayCate.users.length >= relayCate.limit){
        wx.showToast({
          title: '当前团队已报满',
          icon: 'none'
        });
        return;
      }
      app.globalData.order = {
        type: this.properties.raceDetail.type,
        price: 0, // 队员无需支付费用
        raceId: this.properties.raceId,
        raceTitle: this.properties.raceDetail.title,
        racePic: this.properties.raceDetail.picUrls,
        raceType: this.properties.raceDetail.type,
        raceDate: this.properties.raceDetail.raceDate,
        cateId: relayCate._id,
        cateTitle: relayCate.title,
        teamTitle: name,
        isTeamLeader: this.data.groupUserType === 'owner',
        groupType: this.data.selectedGroupType,
        groupText: this.data.selectedGroupText
      };
      
      const agreed = this.data.checked && name !== null;
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: agreed });
    },
    onGroupTypeChange(event) {
      const name = event.detail;
      const { groupUserType } = this.data;
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
        case 'family':
          valid = valid && !!familyTeamTitle;
          break;
      }
      
      const isFull = this.checkCateIsFull(selectedCateId);      
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: valid && isFull});
    },
    changeGroup(e){
      const { type, title } = e.currentTarget.dataset;
      const { allCates } = this.data;
      const cates = allCates.filter(item=> item.type === type);
      if(type === 'relay' || type === 'family'){
      }
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
    async saveTeamTitle(e){
      const { value } = e.detail;
      if(!value){
        return;
      }
      const { allCates, checked, groupUserType } = this.data;
      const { group } = e.currentTarget.dataset;
      const relayCate = allCates.find(item=>item.type === group);
      const existed = await checkTeamExisted({ cateId: relayCate._id, teamTitle: value });
      
      if(existed){
        wx.showToast({
          title: '此队员已经存在，请更换其他队名',
          icon: 'none'
        })
        return;
      }
      if(group === 'relay'){ // 团队
        // 此处区分团队负责和或者加入团队
        if(groupUserType === 'owner'){
          this.saveOrderData(relayCate, value);
        }else if(groupUserType === 'member'){
          this.saveOrderData(relayCate, value);
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
        isTeamLeader: this.data.groupUserType === 'owner',
        groupType: this.data.selectedGroupType,
        groupText: this.data.selectedGroupText
      };
    },
    async selectCate(value){
      const { allCates } = this.data;
      const selectedCateId = allCates.findIndex(item=>item._id === value);
      const selectedCate = allCates.find(item=>item._id === value);
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
        cateTitle: allCates[selectedCateId].title,
        groupType: this.data.selectedGroupType,
        groupText: this.data.selectedGroupText
      };
      
      const agreed = this.data.checked && selectedCateId !== null;      
      const isFull = this.checkCateIsFull(value);      
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: agreed && isFull});
    },
    async checkCateIsFull(cateId){
      let usersCount = await getStartListCountByCateId(cateId);
      const { allCates } = this.data;
      const selectedCate = allCates.find(item=>item._id === cateId);
      let isFull = false;
      if(selectedCate && selectedCate.limit && selectedCate.limit > 0 && selectedCate.users && selectedCate.users.length){
        isFull = Math.max(usersCount, selectedCate.users.length) >= selectedCate.limit;
        if(isFull){
          wx.showToast({
            icon: 'none',
            title: '该组别已经满额'
          })
        }
      }
      return isFull;
    },
    async fetchTeams(raceId){
      const teams = await getRaceCateTeamList(raceId);
      const actions = teams.slice().map(item => {
        return {
          name: item.teamTitle,
          subname: `已报${item.profiles.length}人`,
          id: item._id
        }
      });
      this.setData({
        teams,
        allTeams: teams,
        actions
      }, () =>{        
        wx.hideLoading({
          success: (res) => {},
        })
      })
    },
    
    watchChanges(){
      const { raceId } = this.properties;
      const db = wx.cloud.database()
      const that = this;
      db.collection('race').doc(raceId).watch({
        onChange: function(snapshot) {
          const { type } = snapshot;
          if(type !== 'init'){
            that.fetch();
          }
          console.log('snapshot', snapshot)
        },
        onError: function(err) {
          console.error('the watch closed because of error', err)
        }
      })
      db.collection('race-cates').where({ raceId }).watch({
        onChange: function(snapshot) {
          const { type } = snapshot;
          if(type !== 'init'){
            that.fetch();
          }
          console.log('snapshot', snapshot)
        },
        onError: function(err) {
          console.error('the watch closed because of error', err)
        }
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
      cates.map(cate=>{
        // 是否超出限制
        if(cate.limit && cate.limit > 0 && cate.users && cate.users.length){
          cate.isFull = cate.users.length >= cate.limit
        }

        return cate;
      });
      const hasRelay = cates.filter(item=>item.type === 'relay').length > 0;
      const hasFamily = cates.filter(item=>item.type === 'family').length > 0; 
      const hasIndividual = cates.filter(item=>item.type === 'individual').length > 0;

      const that = this;
      console.log(cates);
      const { type } = this.properties;
      const selectedGroupText = raceGroups[type].groupText;

      const relayCate = cates.slice().find(item=>item.type === 'relay');
      const familyCate = cates.slice().find(item=>item.type === 'family');
      
      const { selectedCateId } = this.data;
      if(!selectedCateId){
        let selectedCateId = null;
        if(type === 'relay'){
          selectedCateId = relayCate._id;
        }else if(type === 'family'){
          selectedCateId = familyCate._id;
        }
        this.setData({
          selectedCateId
        })
      }

      this.setData({
        selectedGroupType: type,
        selectedGroupText,
        focus: type === 'relay',
        allCates: cates,
        hasIndividual,
        hasRelay,
        hasFamily,
        cates: cates.filter(item=>item.type === 'individual'),
        relayCate,
        familyCate
      }, () => {
        const { cateId } = that.data;
        if(cateId){
          that.selectCate(cateId);
        }
      });
    }
  }
})