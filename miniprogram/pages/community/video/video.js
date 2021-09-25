// pages/community/video/video.js
const { getCollectionById, getCollectionByWhere } = require("../../../utils/cloud");
const dayjs = require("dayjs");
const { getVideoList } = require("../../../api/feed");
const { giveKudos } = require("../../../api/feed");
const { addComment } = require("../../../api/comment");
const { updatePoint } = require("../../../api/points");
const { pointRuleEnum } = require("../../../config/const");
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
    list: [],
    page: 1,
    pageSize: 10,
    show: false
  },
  showComments(){
    this.setData({
      show: true
    })
  },
  onClose(){
    this.setData({
      show: false
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
    this.setData({
      btnDisabled: true
    });
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
    const db = wx.cloud.database();
    const replyTable = db.collection("reply");
    const feedTable = db.collection("feed");
    const count = await replyTable.where({ feedId: id, isActive: true }).count();
    await feedTable.doc(id).update({
      data: {
        comments: count.total
      }
    });
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
      that.fetch();
    }
    this.setData({
      btnDisabled: false
    })
  },
  async giveKudos(e){
    const { userInfo, userId, isLogined, detail } = this.data;
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
    
    // 加分
    if(!detail.kudosed){
      await updatePoint(userId, pointRuleEnum.Kudos, {
        id: [id, userId].join(','),
        title: '点赞'
      });
    }else{
      await updatePoint(userId, pointRuleEnum.CancelKudos, {
        id: [id, userId].join(','),
        title: '取消点赞'
      });
    }
    this.fetchKudos(id);
    wx.hideLoading();
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
  async onVideoLoaded(){
    console.log('1')
  },
  async bindplay(){
    console('2');
  },
  async onSwiperChange(e){
    const { current } = e.detail;
    const { list, page, pageSize } = this.data;
    if(current === list.length - 1) {
      let res = await getVideoList(page + 1, pageSize);
      if(res.length === 0) {
        setTimeout(() => {
          wx.showToast({
            icon: 'none',
            title: '已加载完全部视频',
          });          
        }, 1000);
        return;
      }
      this.setData({
        list: [...list, ...res],
        page: page + 1
      })
    }

  },
  async fetch(){
    const { id } = this.data;
    const detail = await getCollectionById({dbName: 'feed', id});
    detail.dateStr = dayjs(detail.addedDate).format("YYYY-MM-DD HH:mm:ss");
    detail.content = detail.content.trim();
    detail.kudosed = detail.kudos_list ? detail.kudos_list.filter(item=>item.userId === userId).length > 0 : false;
    const comments = await getCollectionByWhere({ dbName: 'reply', filter: { feedId: id }});
    comments.map(item=>{
      item.dateStr = dayjs(item.createdAt).format("MM-DD HH:mm:ss");
      return item;
    });
    let res = await getVideoList();
    console.log(res);
    res = res.filter(item => item._id !== id);
    this.setData({
      value: '',
      comments,
      detail,
      list: [detail, ...res]
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