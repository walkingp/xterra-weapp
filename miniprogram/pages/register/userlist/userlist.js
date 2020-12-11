const {
  getMyProfiles
} = require("../../../api/race")
const app = getApp();
// pages/register/userlist/userlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    profiles: {
      type: Array
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