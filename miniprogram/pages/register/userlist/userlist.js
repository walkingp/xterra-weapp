const {
  getMyProfiles
} = require("../../../api/race")
const app = getApp();
const i18n = require("./../../../utils/i18n");

const _t = i18n.i18n.translate();
// pages/register/userlist/userlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    profiles: {
      type: Array
    },
    action:{
      type: String,
      value: 'edit'
    }
  },

  lifetimes: {
    attached() {
      this.setData({        
        _t: i18n.i18n.translate()
      });
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    async fetch() {
      app.checkLogin().then(async res => {
        const { userId } = res;
        const profiles = await getMyProfiles(userId);
        this.setData({
          profiles
        });
      })
    },
  }
})