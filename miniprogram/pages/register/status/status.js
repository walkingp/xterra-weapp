const { getRegistrationDetail, updateOrderStatus, getRaceDetail } = require("../../../api/race");
const dayjs = require("dayjs");
const { orderStatus } = require("../../../config/const");
const { payNow } = require("../../../api/pay");
const { getUserListByTeam } = require("../../../api/result");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    refundEnabled: true,
    raceDetail: null,
    raceId: null,
    id: null,
    detail: null,
    showRefundBtn: false,
    showPayBtn: false,
    members: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { id } = options;
    this.setData({
      id
    });
    this.fetch(id);
  },
  copyText(e){
    const { text } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: text,
      success: function(){
        wx.showToast({
          icon: 'success',
          title: '已复制',
        })
      }
    })
  },
  async fetch( id ) {
    const detail = await getRegistrationDetail(id);
    const { raceId } = detail;
    const raceDetail = await getRaceDetail(raceId);
    detail.orderTime = dayjs(detail.addedDate).format("YYYY-MM-DD HH:mm:ss");
    const isBeforeRaceDate = dayjs(new Date()).isBefore(dayjs(raceDetail.raceDate));
    const isPlogging = raceDetail.type === 'X-Plogging';
    this.setData({
      detail,
      showRefundBtn: (isPlogging && detail.status === orderStatus.pending.status) || detail.status === orderStatus.paid.status,
      showPayBtn: detail.status === orderStatus.pending.status || detail.status === orderStatus.failed.status,
    });
    if(raceDetail){
      this.setData({
        raceDetail,
        raceId
      })
      // 可取消活动时间
      const isBeforeRefundDate = raceDetail.enabledRefund && dayjs(new Date()).isBefore(dayjs(raceDetail.refundLastDate));
      const enabled = (isPlogging || isBeforeRefundDate) && isBeforeRaceDate;
      if(!enabled){
        this.setData({
          refundEnabled: false
        });
      }
    }
    if(detail.teamTitle){
      this.fetchTeamList();
    }
    console.log(detail);
  },
  async fetchTeamList(){
    const { detail } = this.data;
    const { cateId, teamTitle } = detail;
    const members = await getUserListByTeam({ cateId, teamTitle });
    this.setData({
      members
    })
  },
  redirect(e){
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({
      url
    })
  },
  confirmOrder: function(e) {
    const { detail } = this.data;
    payNow(detail, () => {
      this.fetch(detail._id);
    });
  },
  onShareAppMessage: function( options ){
    const { detail } = this.data;
    if( options.from == 'button' ){
      const path = `/pages/register/register?id=${detail.raceId}&type=relay&teamTitle=${detail.teamTitle}`;
      console.log(path)
      return {
        title: `邀请你加入${detail.raceTitle}: ${detail.teamTitle}`,
        imageUrl: detail.racePic[0],
        path
      }
　　}
  }
})