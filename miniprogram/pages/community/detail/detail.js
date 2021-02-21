const dayjs = require("dayjs");
const { addComment } = require("../../../api/comment");
const { giveKudos } = require("../../../api/feed");
const { updatePoint } = require("../../../api/points");
const { pointRuleEnum } = require("../../../config/const");
const { getCollectionById, getCollectionByWhere } = require("../../../utils/cloud");
const app = getApp();
// miniprogram/pages/community/detail/detail.js
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
    value: ''
  },

  preview(e){
    const { src } = e.currentTarget.dataset;
    const urls = this.data.detail.picUrls;
    wx.previewImage({
      urls,
      current: src
    });
  },
  async giveKudos(e){
    const { userInfo, userId, isLogined } = this.data;
    if(!isLogined){
      wx.showToast({
        title: '请先登录',
        success() {
          setTimeout(function () {
            wx.switchTab({
              url: `/pages/my/my`,
            })
          }, 1000)
        }
      })
      return false;
    }
    wx.showLoading()
    const {id} = e.currentTarget.dataset;
    console.log(id)
    const res = await giveKudos({ userId, userInfo, type: 'feed', id});
    debugger
    this.fetchKudos(id);
    wx.hideLoading();
  },
  async fetchKudos(id){
    const detail = await getCollectionById({ dbName: 'feed', id });
    if(!detail){
      wx.showToast({
        title: '数据不存在',
      })
      return;
    }

    // 是否已经点赞
    const { userId } = this.data;
    detail.kudosed = detail.kudos_list ? detail.kudos_list.filter(item=>item.userId === userId).length > 0 : false;
    this.setData({
      detail
    })
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
    this.setData({
      value: '',
      comments,
      detail
    });
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

  confirm(e){
    const content = e.detail.value;
    this.addCommentFunc(content);
  },
  addComment(e){
    const { content } = e.detail.value;
    if(content){
      this.addCommentFunc(content);
    }
  },

  async addCommentFunc(content){
    const { id, isLogined, userId, userInfo } = this.data;
    if(!isLogined){
      wx.showToast({
        icon: 'none',
        title: '请先登录',
        success: function(){
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/my/my',
            })
          }, 1000);
        }
      });
      return;
    }
    const { nickname, avatarUrl } = userInfo;
    const res = await addComment({
      userId,
      avatarUrl,
      content,
      feedId: id,
      nickName: nickname
    });
    const that = this;
    if(res.result.code === 0){
      // 加分
      await updatePoint(userId, pointRuleEnum.Comment, {
        id: new Date().getTime(),
        title: '发表评论'
      });
      wx.showToast({
        icon: 'success',
        title: '评论成功',
        success: ()=>{
          that.fetch();
        }
      });
    }else{
      wx.showToast({
        icon: 'none',
        title: '评论失败，可能包含不合法字符',
      })
    }
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