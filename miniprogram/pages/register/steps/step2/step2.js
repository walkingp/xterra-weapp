const {
  getMyProfilesWithCate, getRaceCatesList
} = require("../../../../api/race")
const app = getApp();
const dayjs = require("dayjs");
// pages/register/userlist/userlist.js
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


  /**
   * 组件的初始数据
   */
  data: {
    profiles: [],
    selectedProfiles: [],
    selectedSports: [],
    currentProfileId: null,
    currentIndex: null,
    cates: [],
    cate: null,
    show: false,
    showRelay: false,
    sports: ['游泳','自行车','跑步'],
    actions: [
      { name: '游泳' },
      { name: '自行车' },
      { name: '跑步' }
    ]
  },
  lifetimes: {
    attached: function () {
      this.fetch();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showPicker(e){
      const { selectedProfiles } = this.data;
      if(selectedProfiles.length < 3){
        return false;
      }
      const { id } = e.currentTarget.dataset;
      this.setData({
        currentProfileId: id,
        show: true
      })
    },
    onClose() {
      this.setData({ show: false });
    },
    check(e){
      const { index } = e.currentTarget.dataset;
      this.setData({
        profileIndex: index
      })
    },
    noop() {},
    onChange(event) {
      const { main } = event.currentTarget.dataset;
      const items = event.detail;
      const {result}  = this.data;
      if(result && result[main] && result[main].length === 2 && items.length === 3){
        wx.showToast({
          icon: 'none',
          title: '每人最多只可报2个项目',
        })
        return;
      }
      if(result && result[1-main]){
        const allItems = [...result[1-main],...items];
        const mergedItems = [...new Set([...result[1-main],...items])];
        if(allItems.length > mergedItems.length){
          wx.showToast({
            icon: 'none',
            title: '每个项目仅限1人报名',
          })
          return;
        }
      }
      this.setData({
        [`result[${main}]`]: event.detail
      });
      this.checkNextStepEnabled();
    },
    noop() {},
    toggle(event) {
      const { index } = event.currentTarget.dataset;
      const checkbox = this.selectComponent(`.checkboxes-${index}`);
      const willChecked = checkbox.data.value === false;
      const profileIndex = +index.substr(0,1);
      if(this.data.result){
        if(this.data.result[profileIndex] && this.data.result[profileIndex].length === 2 && willChecked){
          wx.showToast({
            icon: 'none',
            title: '每人最多只可报2个项目',
          })
          return;
        }
        if(this.data.result[1-profileIndex] && willChecked){
          if(this.data.result[1-profileIndex].indexOf(checkbox.data.name) >= 0){
            wx.showToast({
              icon: 'none',
              title: '每个项目仅限1人报名',
            })
            return;
          }
        }
      } 
      this.setData({
        profileIndex
      });
      
      checkbox.toggle();
      this.checkNextStepEnabled();
    },
    checkNextStepEnabled(){
      let totalSelected = 0;
      const { result } = this.data;
      if(this.data.result[0]){
        totalSelected += result[0].length;
      }
      if(this.data.result[1]){
        totalSelected += result[1].length;
      }
      const { selectedProfiles } = this.data;
      selectedProfiles.map((item, index) => {
        item.sportItems = result[index] && result[index].length ? result[index].join() : '';
        return item;
      })
      this.setData({
        selectedProfiles
      });
      const nextEnabled = totalSelected === 3;
      if(nextEnabled){          
        app.globalData.order.profiles = selectedProfiles;
        app.globalData.order.profileCount = selectedProfiles.length;
      }
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled, isRelay: true, isFinished: true });
    },
    onSelect(event) {
      const { name } = event.detail;
      let { selectedProfiles, currentProfileId, actions } = this.data;
      const found = selectedProfiles.find(item=>item.sportItems === name);
      if(found){
        selectedProfiles.map(item=>{
          if(item.sportItems === name){
            item.sportItems = '';
          }
        });
      }
      selectedProfiles.map(item=>{
        if(item._id ===currentProfileId){
          item.sportItems = name;
        }
        return item;
      });
      this.setData({
        actions,
        selectedProfiles
      });
      const nextEnabled = selectedProfiles.filter(item=>item.sportItems).length === 3;
      if(nextEnabled){          
        app.globalData.order.profiles = selectedProfiles;
        app.globalData.order.profileCount = selectedProfiles.length;
      }
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled, isRelay: true, isFinished: true });
    },
    async fetch() {
      wx.showLoading({
        title: '加载中……',
      })
      app.checkLogin().then(async res => {
        const { userId } = res;
        const { cateId } = app.globalData.order;
        let profiles = await getMyProfilesWithCate(userId, cateId);
        console.log(profiles)
        
        const {
          raceId, raceDetail
        } = this.properties;
        const cates = await getRaceCatesList(raceId);
        const cate = cates.find(item => item._id === cateId);
        this.setData({
          cateId,
          cates,
          isRelay: cate.type  === 'relay' && raceDetail.type === '铁人三项',
          cate,
          profiles
        }, () => {
          wx.hideLoading({
            success: (res) => {},
          })
        });
      })
    },
    showRelayOption(){
      this.setData({
        showRelay: true
      })
      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: false });
    },
    checkboxChanged(e){
      const profileIds = e.detail.value;
      let { profiles, cate, isRelay } = this.data;
      profiles = profiles.filter(item => {
        return profileIds.includes(item._id);
      });
      profiles.map(item=>{
        item.sportItems = '';
        return item;
      });
      this.setData({
        selectedProfiles: profiles
      });
      if(cate.type !== 'individual'){
        if(profiles.length > cate.teamSizeLimit && cate.teamSizeLimit > 0){
          wx.showToast({
            icon: 'none',
            title: `已经超出报名人数限制`,
          });
          
          this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: false }); 
          return;
        }
        // 必须有儿童和成人
        let isValid = false;
        if(cate.type === 'family'){
          const hasChild = profiles.some(item=>{
            const age = new Date().getFullYear() - new Date(item.birthDate).getFullYear();
            return age < 18;
          });
          const hasParent = profiles.some(item=>{
            const age = new Date().getFullYear() - new Date(item.birthDate).getFullYear();
            return age > 18;
          });
          isValid = hasChild && hasParent;
          if(!isValid){
            this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled: isValid }); 
            return;
          }
        }
      }
      app.globalData.order.profiles = profiles;
      app.globalData.order.profileCount = profiles.length;
      let totalFee = 0;
      const { groupType, isTeamLeader } = app.globalData.order;
      let minProfiles = 1;
      if(groupType === 'individual'){
        totalFee = app.globalData.order.price * profiles.length;
      }else if(groupType === 'relay'){
        totalFee = isTeamLeader ? app.globalData.order.price : 0;
      }else{
        minProfiles = 2;
        totalFee = app.globalData.order.price;
      }
      
      app.globalData.order.totalFee = +totalFee.toFixed(2);
      app.globalData.order.paidFee = +totalFee.toFixed(2);
      app.globalData.order.discountFee = 0;
      let nextEnabled = profileIds.length >= minProfiles;
      if(isRelay){
        nextEnabled = nextEnabled && profileIds.length >= 2;
      }

      this.triggerEvent('onComplete', { prevEnabled: true, nextEnabled, isRelay, isFinished: false });
    },
    gotoAdd(e){
      const { url } = e.currentTarget.dataset;
      wx.navigateTo({
        url
      })
    }
  }
})
