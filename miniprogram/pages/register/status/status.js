const { getRegistrationDetail, updateOrderStatus, getRaceDetail, getStartUserDetailByOrderNum } = require("../../../api/race");
const dayjs = require("dayjs");
const { orderStatus } = require("../../../config/const");
const { payNow } = require("../../../api/pay");
const { getUserListByTeam } = require("../../../api/result");
const { updateStartListCert } = require("../../../api/user");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    refundEnabled: true,
    raceDetail: null,
    orderDetail: null,
    raceId: null,
    id: null,
    detail: null,
    showRefundBtn: false,
    showPayBtn: false,
    members: [],
    certPic: null,
    btnUploadCert: true
  },

  preview(e){
    const { url } = e.currentTarget.dataset;
    wx.previewImage({
      urls: [ url ],
      current: url
    });
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
  upload(event) {
    const that = this;
    const { orderDetail } = this.data;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;        
        wx.cloud.init();
        if (tempFilePaths.length === 0) {
          wx.showToast({
            title: '请选择图片',
            icon: 'none'
          });
        } else {
          wx.showLoading({
            title: '上传中...',
          })
          const suffix = /\.\w+$/.exec(tempFilePaths[0])[0];
          wx.cloud.uploadFile({
            cloudPath: `upload/certs/${new Date().getTime()}${suffix}`,
            filePath: tempFilePaths[0], 
            success: async (result) => {
              that.setData({
                certPic: result.fileID,
              });
              const res = await updateStartListCert(orderDetail._id, result.fileID);     
              wx.hideLoading({
                success: (res) => {},
              })
            },
            fail: err => {
              console.error(err);
            }
          });
        }
      }
    })
  },
  async fetch( id ) {
    wx.showLoading({
      title: '加载中……',
    })
    const detail = await getRegistrationDetail(id);
    const { raceId } = detail;
    const raceDetail = await getRaceDetail(raceId);
    detail.orderTime = dayjs(detail.addedDate).format("YYYY-MM-DD HH:mm:ss");
    raceDetail.appStartDate = dayjs(raceDetail.appStartDate).format("YYYY-MM-DD");
    raceDetail.appEndDate = dayjs(raceDetail.appEndDate).format("YYYY-MM-DD");
    const isBeforeRaceDate = dayjs().isBefore(dayjs(raceDetail.raceDate));
    const isPlogging = raceDetail.type === 'X-Plogging';
    
    this.setData({
      detail,
      showRefundBtn: (isPlogging && detail.status === orderStatus.pending.status) || detail.status === orderStatus.paid.status,
      showPayBtn: detail.status === orderStatus.pending.status || detail.status === orderStatus.failed.status,
    });
    if(raceDetail){
      const orderDetail = await getStartUserDetailByOrderNum(detail.orderNum);
      if(orderDetail){
        const { certPic, certRecheckUrl, virtualStatus } = orderDetail;
        const btnEnabled = virtualStatus === undefined || ['未上传', '审核不通过'].includes(virtualStatus);
        const isDateValid = dayjs().isBefore(dayjs(raceDetail.appEndDate)) && dayjs().isAfter(dayjs(raceDetail.appStartDate));
        this.setData({
          certPic: certRecheckUrl ? certRecheckUrl: certPic,
          btnUploadCert: !(btnEnabled && isDateValid)
        });
      }
      this.setData({
        raceDetail,
        orderDetail,
        raceId
      }, () => {
        this.watchChanges();
      })
      // 可取消活动时间
      const isBeforeRefundDate = raceDetail.enabledRefund && dayjs().isBefore(dayjs(raceDetail.refundLastDate));
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
    wx.hideLoading({
      success: (res) => {},
    })
  },
  
  watchChanges(){
    const db = wx.cloud.database()
    const that = this;
    const { orderDetail, id } = this.data;
    if(orderDetail){
      const { orderNum } = orderDetail;
      if(!orderNum){
        return;
      }
      db.collection('start-list').where({ orderNum }).watch({
        onChange: function(snapshot) {
          const { type } = snapshot;
          if(type !== 'init'){
            that.fetch(id);
          }
          console.log('snapshot', snapshot)
        },
        onError: function(err) {
          console.error('the watch closed because of error', err)
        }
      });
    }
    db.collection('registration').doc(id).watch({
      onChange: function(snapshot) {
        const { type } = snapshot;
        if(type !== 'init'){
          that.fetch(id);
        }
        console.log('snapshot', snapshot)
      },
      onError: function(err) {
        console.error('the watch closed because of error', err)
      }
    });
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
    console.log(detail);
    console.table(app.globalData.order);
    const that = this;
    payNow(detail, () => {
      wx.showToast({
        icon: 'success',
        title: '支付成功',
        success(){
          setTimeout(() => {
            that.fetch(detail._id);            
          }, 2000);
        }
      })
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