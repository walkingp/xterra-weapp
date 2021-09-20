// pages/community/video/video.js
const { getCollectionById, getCollectionByWhere } = require("../../../utils/cloud");
const dayjs = require("dayjs");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    detail: null,
    comments: null,
    isLogined: false,
    userId: null,
    userInfo: null,
    list: []

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    
    app.checkLogin().then(res=>{    
      const { isLogined, userId, userInfo } = res;
      this.setData({
        isLogined,
        userId,
        userInfo
      });
    });
    this.setData({
      id
    },()=>{
      this.fetch();
      this.watchChanges();
    })
  },
  async fetch(){
    const { id } = this.data;
    const detail = await getCollectionById({dbName: 'feed', id});
    detail.dateStr = dayjs(detail.addedDate).format("YYYY-MM-DD HH:mm:ss");
    const comments = await getCollectionByWhere({ dbName: 'reply', filter: { feedId: id }});
    comments.map(item=>{
      item.dateStr = dayjs(item.createdAt).format("MM-DD HH:mm:ss");
      return item;
    });
    console.log(detail)
    this.setData({
      value: '',
      comments,
      detail,
      list: [detail]
    }, () => {
      this.fetchKudos(id);
    });
  },
  
  async fetchKudos(id){
    const detail = await getCollectionById({ dbName: 'feed', id });
    if(!detail){
      wx.showToast({
        title: '数据不存在',
      })
      return;
    }

    detail.dateStr = dayjs(detail.addedDate).format("YYYY-MM-DD HH:mm:ss");
    // 是否已经点赞
    const { userId } = this.data;
    detail.kudosed = detail.kudos_list ? detail.kudos_list.filter(item=>item.userId === userId).length > 0 : false;
    this.setData({
      detail
    })
  },
  watchChanges(){
    const db = wx.cloud.database()
    const that = this;
    const { id } = this.data;
    db.collection('reply').where({ feedId: id }).watch({
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})