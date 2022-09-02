const {
  getPaginations, getCollectionCount
} = require("../../../utils/cloud")
const app = getApp();
const dayjs = require("dayjs");
const {
  getRaceDetail,
  getRaceCatesList,
  getAllRaces
} = require("../../../api/race");
const { updateStartListStatus, updateStartListStatusByUser } = require("../../../api/result");
const { raceResultStatus, pointRuleEnum } = require("../../../config/const");
const { exportReport, syncPlogging } = require("../../../api/user");
const i18n = require("./../../../utils/i18n");
const { updatePoints, updatePoint } = require("../../../api/points");

const _t = i18n.i18n.translate();
// miniprogram/pages/events/users/users.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startListId: null,
    city: null,
    raceId: null,
    cateId: null,
    detail: null,
    race: null,
    currentCate: null,
    allCates: [],
    raceValue: '',
    cateValue: '',
    users: [],
    races: [{
      text: '请选择',
      value: ''
    }],
    cates: [{
      text: '请选择',
      value: ''
    }],
    show: false,
    value: 20,
    stats: '',
    buttonText: '置为已完成',
    isPlogging: false,
    isDiscovery: false,
    pageIndex: 1,
    pageSize: 100
  },  
  copy(e) {
    const {
      text
    } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: text,
    })
  },
  async updateStatus(e){
    wx.showLoading({
      title: '操作中',
    })
    const { city, detail, raceId, isDiscovery, isPlogging } = this.data;
    let { finishedStatus, cardNo, cateId, userId } = detail;
    if(finishedStatus === raceResultStatus.done.value){
      finishedStatus = raceResultStatus.DNS.value;
    }else if(finishedStatus === raceResultStatus.notStart.value || finishedStatus === raceResultStatus.DNS.value){
      finishedStatus = raceResultStatus.done.value;
    }
    const data = await updateStartListStatusByUser({cateId, cardNo, city, finishedStatus});
    if(isDiscovery || isPlogging){
      const type = isDiscovery ? pointRuleEnum.XDiscovery : pointRuleEnum.XPlogging;
      const title = isDiscovery ? '参加X-Discovery' : '参加X-Plogging';
      await updatePoint(userId, type, {
        id: raceId,
        title
      })
    }
    this.fetchCates();
    wx.showToast({
      icon: 'success',
      title: '已修改',
      success: (res) => {
        this.setData({
          show: false
        })
      },
    })
  },
  setFinished() {
    const { city, cateId, raceId, users, isDiscovery, isPlogging } = this.data;
    const that = this;
    wx.showModal({
      title: '提示',
      content: '确定全部设为已完成状态？',
      success: async function (sm) {
        if (sm.confirm) {
          const res = await updateStartListStatus({
            city,
            cateId
          });

          if(isDiscovery || isPlogging){
            const _userIds = users.map(item=>item._id);
            const type = isDiscovery ? pointRuleEnum.XDiscovery : pointRuleEnum.XPlogging;
            const title = isDiscovery ? '参加X-Discovery' : '参加X-Plogging';
            await updatePoints(_userIds, type, {
              id: raceId,
              title
            })
          }          
          wx.showToast({
            title: '设置完成',
            success: function(){
              that.fetchCates();
            }
          })
          // 用户点击了确定 可以调用删除方法了
        } else if (sm.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    wx.showLoading({
      title: _t['加载中'],
    })
    app.checkLogin().then(async res => {
      const {
        userId
      } = res;
      const isSuperAdmin = res.userInfo.role === 'admin';
      this.setData({
        userId,
        isSuperAdmin
      });

      const {
        id
      } = options;
      await this.fetchAllRaces();
      this.setData({
        raceId: id,
        raceValue: id
      }, () => {
        this.fetchCates();
      });
    }).catch(err => {
      console.error(err);
      wx.showToast({
        title: '您没有权限',
      })
    });
  },
  async onChange(e) {
    const {
      type
    } = e.currentTarget.dataset;
    const value = e.detail;
    const {
      allCates
    } = this.data;
    switch (type) {
      case 'race':
        this.setData({
          stats: '',
          raceValue: value,
          raceId: value
        }, () => {
          this.fetchCates();
        })
        break;
      case 'cate':
        this.setData({
          stats: '',
          cateValue: value,
          cateId: value
        })
        await this.fetchCates();
        const currentCate = allCates.find(item => item._id === value);
        if(!currentCate){
          return;
        }
        const {
          users
        } = this.data;
        this.setData({
          currentCate,
          value: currentCate.limit === 0 ? 98 : Math.floor(users.length / currentCate.limit * 100),
          stats: `${users.length}/${currentCate.limit === 0 ? '不限制' : '限制' + currentCate.limit}`
        });
        break;
    }
  },
  onClose() {
    this.setData({
      show: false
    })
  },
  call(e) {
    const {
      phone
    } = e.currentTarget.dataset;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  async showDetail(e) {
    const {
      id
    } = e.currentTarget.dataset;
    const {
      users
    } = this.data;
    const detail = users.find(item => item._id === id);
    detail.statusText = raceResultStatus[detail.finishedStatus || "notStart"].title;
    const buttonText = detail.finishedStatus === raceResultStatus.notStart.value || detail.finishedStatus === undefined || detail.finishedStatus === raceResultStatus.DNS.value ? '置为已完成' : '置为未完成'
    this.setData({
      startListId: id,
      show: true,
      buttonText,
      detail
    })
  },

  async exportCSV() {
    wx.showLoading({
      title: '生成中……',
    })
    const that = this;
    const {
      raceId, cateId, isPlogging
    } = this.data;
    const res = await exportReport(cateId);
    const url = res.fileList[0].tempFileURL;
    const filePath =  wx.env.USER_DATA_PATH + url.substr(url.lastIndexOf('/'));
    wx.downloadFile({
      url,
      filePath,
      header: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      },
      success: function (res) {
        wx.openDocument({
          filePath,
          fileType: 'xlsx',
          showMenu: true,
          success: function (res) {
            wx.hideLoading({
              success: (res) => {},
            })
            console.log('打开文档成功')
          },
          fail: function (res) {    
            console.error(res)
            wx.showToast({title: '打开文档失败', icon: 'none', duration: 2000})    
          },
        })
      }
    })
  },
  async fetchAllRaces() {
    let races = await getAllRaces();
    races = races.map(race => {
      return {
        text: `${race.title}`,
        id: race._id,
        value: race._id,
      }
    })
    races.splice(0, 0, ...this.data.races);
    this.setData({
      races
    })
  },
  async fetchCates() {
    const {
      raceId,
      cateId, pageSize
    } = this.data;
    let race = null;
    let isPlogging = false;
    let isDiscovery = false;
    wx.showLoading({
      title: _t['加载中'],
    })

    let cates = [{
      text: _t['请选择'],
      value: ''
    }];
    let users = [];
    if(raceId){
      race = await getRaceDetail(raceId);
      isPlogging = race.type === 'X-Plogging';
      isDiscovery = race.type === 'X-Discovery';
      this.setData({
        city: race.city || race.title.replace(/.*Plogging\s+(.+?)站/,'$1'),
        isPlogging,
        isDiscovery
      });
      wx.setNavigationBarTitle({
        title: race.title,
      })
      let _cates = await getRaceCatesList(raceId);
      this.setData({
        allCates: _cates
      })
      _cates = _cates.map(cate => {
        return {
          text: `${cate.title}`,
          id: cate._id,
          value: cate._id,
        }
      })
      cates.push(..._cates);

      const filter = cateId ? { cateId } : null;
      if(cateId !==  null){
        const total = await getCollectionCount({ dbName: 'start-list', filter: { ...filter }});
        const pageCount = Math.ceil(total / pageSize);
        let promises = [];
        for(let i = 0; i < pageCount; i ++){
          promises.push(getPaginations({
            dbName: 'start-list',
            filter,
            orderBy: {
              createdAt: 'desc'
            },
            pageIndex: i+1,
            pageSize
          }))
        };
        const res = await Promise.all(promises);
        if(res && res.length){
          users = res.reduce((prev,cur)=> prev.concat(cur));
        }
        users = users.map(item => {
          item.birthDate = dayjs(new Date(item.birthDate)).format("YYYY-MM-DD");
          item.regDate = dayjs(new Date(item.createdAt)).format("YYYY-MM-DD HH:mm:ss");
          return item;
        })
        const cardNos = users.slice().map(item=>item.cardNo);
        if(isPlogging){
          await syncPlogging(cardNos);
        }
      }
      console.log(users)
    }

    this.setData({
      users,
      race,
      cates,
    }, () => {
      wx.hideLoading({
        success: (res) => {},
      })
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