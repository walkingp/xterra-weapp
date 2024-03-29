import { orderStatus } from "../config/const";
import { getPaginations, getCollectionById, getCollectionByWhere, getSingleCollectionByWhere, removeCollectionByWhere, getCollectionCount } from "../utils/cloud"
const dayjs = require("dayjs");

export const getBannerList = async ( position = 'index', size = 5) => {
  const data = await getPaginations({
    dbName: 'banner',
    filter: {
      position,
      isActive: true
    },
    orderBy: {
      order: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}

export const checkIsRegistered = async (cateId, cardNo ) => {
  const existed = await getSingleCollectionByWhere({ dbName: 'start-list', filter: { cateId, cardNo }});
  return existed ? true : false;
}

export const getRaceNewsList = async ( raceId, pageIndex = 1, size = 5) => {
  const data = await getPaginations({
    dbName: 'news',
    filter: {
      raceId,
      isActive: true
    },
    orderBy: {
      order: 'desc'
    },
    pageIndex,
    pageSize: size
  })
  return data;
}

export const getRaceCateTeamList = async ( raceId, size = 100) => {
  const teams = await getPaginations({
    dbName: 'registration',
    filter: {
      raceId,
      groupType: 'relay',
      status: orderStatus.paid.status,
      isTeamLeader: true
    },
    orderBy: {
      addedDate: 'asc'
    },
    pageIndex: 1,
    pageSize: size
  });
  return teams;
};
export const checkTeamExisted = async ({cateId, teamTitle}) => {
  const teams = await getCollectionByWhere({
    dbName: 'registration',
    filter: {
      cateId,
      groupType: 'relay',
      status: orderStatus.paid.status,
      teamTitle
    }
  });
  if(teams.length){
    return true;
  }
  return false;
};

export const getRegisteredUsersCount = async (cateId) => {
  return getCollectionCount({ dbName: 'start-list', filter: { cateId }})
}

export const getRaceCatesList = async ( raceId, size = 500) => {  
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getRaceCatesList',
      data: { raceId },
      success: res => {
        const cates = res.result.list;
        cates.map(async cate=>{
          const now = dayjs(new Date());
          cate.isStartReg = cate.regStartTime ? now.isAfter(cate.regStartTime, 'second') : true;
          if(now.isBefore(cate.regEndTime, 'second')){
            if(cate.enableEarlierBirdPrice){
              if(now.isBefore(cate.earlierPriceEndTime)){
                cate.price = cate.earlierBirdPrice;
                cate.priceLabel = '早早鸟价';
              }else{
                if(cate.enableEarlyBirdPrice){
                  if(now.isBefore(cate.earlyPriceEndTime)){
                    cate.price = cate.earlyBirdPrice;
                    cate.priceLabel = '早鸟价';
                  }else{
                    cate.price = cate.regPrice;
                    cate.priceLabel = '正常价';
                  }
                }else{
                  cate.price = cate.regPrice;
                  cate.priceLabel = '正常价';
                }
              }
            }else if(cate.enableEarlyBirdPrice){
              if(now.isBefore(cate.earlyPriceEndTime)){
                cate.price = cate.earlyBirdPrice;
                cate.priceLabel = '早鸟价';
              }else{
                cate.price = cate.regPrice;
                cate.priceLabel = '正常价';
              }
            } else{
              cate.price = cate.regPrice;
              cate.priceLabel = '正常价';
            }
          }else{ // 已超报名截止时间
            cate.expired = true;
            cate.priceLabel = '报名已结束';
          }
          // 格式化
          if(cate.enableEarlierBirdPrice){
            cate.earlierPriceEndTime = dayjs(cate.earlierPriceEndTime).format("YYYY年MM月DD日");
          }
          if(cate.enableEarlyBirdPrice){
            cate.earlyPriceEndTime = dayjs(cate.earlyPriceEndTime).format("YYYY年MM月DD日");
          }
          // 是否超出限制
          if(cate.limit && cate.limit > 0 && cate.users && cate.users.length){
            cate.isFull = cate.users.length >= cate.limit
          }
      
          return cate;
        });
        resolve(cates);
      },
      fail: err => reject(err)
    });
  });
}

export const getStartListCountByCateId = async cateId => {
  const db = wx.cloud.database();
  const res = await db.collection("start-list").where({ cateId }).count();
  return res.total;
};

export const getAllRaces = async () => {
  wx.cloud.init();
  const db = wx.cloud.database()
  const _ = db.command;
  
  const total = await getCollectionCount({ dbName: 'race'});
  const pageSize = 20;
  const pageCount = Math.ceil(total / pageSize);
  let allRaces = [];
  const raceTable = db.collection("race");
  
  for (let i = 1; i <= pageCount; i++) {    
    const res = await raceTable.orderBy('raceDate', 'desc').skip((i - 1) * pageSize).limit(pageSize).get();
    allRaces.push(...res.data);
  }
  return allRaces;
}

export const getRaceIndexList = async ( size = 50) => {
  const data = await getPaginations({
    dbName: 'race',
    filter: {
      isActive: true
    },
    orderBy: {
      order: 'desc',
      raceDate: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}

export const getMyProfiles = async (userId, size = 20) => {
  const data = await getPaginations({
    dbName: 'profile',
    filter: {
      userId,
    },
    orderBy: {
      createdAt: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}

export const getMyProfilesWithCate = async (userId, cateId, size = 20) => {
  const data = await getPaginations({
    dbName: 'profile',
    filter: {
      userId,
    },
    orderBy: {
      createdAt: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  await Promise.all(
    data.map(async item => {
      const registered = await checkIsRegistered(cateId, item.cardNo)
      item.registered = registered;
      const { isValid, isAgeValid } = await checkIsValid(cateId, item._id);
    
      item.isValid = isValid;
      item.isAgeValid = isAgeValid;
      return item;
    })
  ) 
  return data;
}

export const checkIsValid = async (cateId, profileId) => {
  const cate = await getCollectionById({ dbName: 'race-cates', id: cateId });
  const race = await getRaceDetail(cate.raceId);
  const profile = await getCollectionById({ dbName: 'profile', id: profileId });
  const { trueName, phoneNum, wechatId, cardNo, cardType, certPic, club } = profile;
  const hasBasicInfo = trueName && phoneNum && cardNo && cardType;
  const isCertValid = !cate.isCheckCert || (cate.isCheckCert && !!certPic);

  if(Date.parse(profile.birthDate)){
    // const age = getAge(dayjs(new Date(2017,5, 15) || profile.birthDate).format("YYYY-M-D").split('-'), race.raceDate)[0]; 
    const months = dayjs(race.raceDate).diff(dayjs(profile.birthDate), 'months', true);
    const age = Math.floor(months / 12);
    const isMinAgeValid = !cate.minAge || cate.minAge <= age;
    const isMaxAgeValid = !cate.maxAge || cate.maxAge >= age;
    const isAgeValid = isMinAgeValid && isMaxAgeValid;
    return { isValid: hasBasicInfo && isCertValid, isAgeValid };
  }
  wx.showToast({
    title: '出生日期格式不正确',
    icon: 'none'
  })
  return { isValid: hasBasicInfo && isCertValid, isAgeValid: false };
};

export const removeRegistration = async id => {
  const regDetail = await getCollectionById ({ dbName: 'registration', id });
  const { profiles, cateId } = regDetail;
  let promises = [];
  profiles?.forEach(async p => {
    const promise = new Promise(async (resolve, reject) => {
      const { cardNo } = p;
      const res = await removeCollectionByWhere({ dbName: 'start-list', filter: { cateId, cardNo } });
      resolve(res);
    });
    promises.push(promise);
  })
  Promise.all(promises).then(async res=>{
    const data = await updateRaceCateUsers(cateId);
    // delete record from start-list
    return data;
  }).catch(err=>{
    console.error(err);
  })  
}

export const updateStartList = async (id, data) => {
  const db = wx.cloud.database();  
  return await db.collection("start-list").doc(id).update({
    data
  });
};

export const updateGpxJsonFile = async (id, gpxFileUrl) => {
  return updateStartList(id, { gpxFileUrl });
};

export const updateRaceCateUsers = async cateId => {
  const db = wx.cloud.database();
  const cateTable = db.collection("race-cates");
  const startListTable = db.collection("start-list");
  const result = await startListTable.where({ cateId }).limit(1000).get();
  const users = result.data.map(item => {
    const { userId, userName, trueName, gender, userInfo } = item;
    return {
      userId, userName, trueName, gender, userInfo
    }
  });

  const res = await cateTable.doc(cateId).update({
    data: {
      users
    }
  })
  return res;
}

export const getMyCoupons = async (userId, size = 100) => {
  const data = await getPaginations({
    dbName: 'coupon',
    filter: {
      assignedUserId: userId,
    },
    orderBy: {
      _createTime: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}

export const fetchNotFreeRaces = async (size = 50) => {
  const data = await getPaginations({
    dbName: 'race',
    filter: {
      feeType: '收费',
      //isActive: true
    },
    orderBy: {
      addedDate: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
};

export const fetchNotFreeCates = async (raceId, size = 50) => {
  const db = wx.cloud.database();
  const _ = db.command;
  const data = await getPaginations({
    dbName: 'race-cates',
    filter: {
      raceId,
      regPrice: _.gt(0),
      isActive: true
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
};

export const getMyRegistrations = async (userId, size = 100) => {
  const data = await getPaginations({
    dbName: 'registration',
    filter: {
      userId,
      isActive: true
    },
    orderBy: {
      addedDate: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  });
  
  return data;
}

export const getFieldsByCateId = async (cateId, size = 100) => {
  let data = await getPaginations({
    dbName: 'fields',
    orderBy: {
      order: 'desc',
      _createTime: 'asc'
    },
    pageIndex: 1,
    pageSize: size
  })
  const cateDetail = await getRaceCateDetail(cateId);
  data = data.filter(item=> cateDetail.fields.indexOf(item._id) >= 0);
  data.map(item => {
    item.value = item.defaultValue;
    return item;
  })
  return data;
}

export const getProfileDetail = async id => {
  const data = await getCollectionById({ dbName: 'profile', id });
  return data;
}

export const getProfileDetailByIdOrUserId = async uid => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getProfileByUid',
      data: { uid }
    }).then(res => {
      resolve(res.result?.list[0]);
    }).catch(reject)
  })
}

export const getProfileDetailByUserId = async userId => {
  const data = await getCollectionByWhere({ dbName: 'profile', filter: { userId } });
  return data;
}

export const getRaceCateDetail = async id => {
  const data = await getCollectionById({ dbName: 'race-cates', id });
  return data;
}

export const getRegistrationDetail = async id => {
  const data = await getCollectionById({ dbName: 'registration', id });
  return data;
}

export const getStartUserDetail = async id => {
  const data = await getCollectionById({ dbName: 'start-list', id });
  return data;
}

export const getStartUserDetailByOrderNum = async orderNum => {
  const data = await getSingleCollectionByWhere({ dbName: 'start-list', filter: { orderNum  }});
  return data;
}

export const getRegistrationByOrderNum = async orderNum => {
  const data = await getCollectionByWhere({ dbName: 'registration', filter: { orderNum } });
  return data.length ? data[0] : null;
}

export const getRegistrationByCardNo = async (filter) => {
  const data = await getSingleCollectionByWhere({ dbName: 'start-list', filter});
  return data;
}

export const getStartListByRaceIdUserId = async ({raceId, userId}) => {
  const data = await getSingleCollectionByWhere({ dbName: 'start-list', filter: {raceId, userId}});
  return data;
}

export const getStartedUsersByRaceId = async raceId => {
  const data = await getCollectionByWhere({ dbName: 'start-list', filter: { raceId } });
  return data;
}

export const getRaceDetail = async id => {
  const data = await getCollectionById({ dbName: 'race', id });
  return data;
}

export const getCouponDetail = async coupon => {
  const data = await getSingleCollectionByWhere({ dbName: 'coupon', filter: { coupon }});
  return data;
}

export const updateCoupon = async param => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'updateCoupon',
      data: param
    }).then(res => {
      resolve(res.result);
    }).catch(reject)
  })
}

export const getPinyin = async word => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getPinyin',
      data: { word }
    }).then(res => {
      resolve(res.result);
    }).catch(reject)
  })
}

export const checkIsJoinedPlogging = async cardNo => {
  const data = await getSingleCollectionByWhere({ dbName: 'start-list', filter: { cardNo, finishedStatus: "done", raceType: 'X-Plogging' }});
  return data;
};

export const updatePloggingStatus = async cardNo => {
  const db = wx.cloud.database();
  await db.collection("profile").where({
    cardNo
  }).update({
    data: {
      plogging: '是'
    }
  });
};

export const updateOrderStatus = async param => {
  const { id, status, statusText, out_trade_no, refundTime, discountFee, paidFee, refundFee } = param;
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'updateOrder',
      data: {
        id,
        status,
        statusText,
        out_trade_no,
        refundTime,
        refundFee,
        discountFee,
        paidFee
      }
    }).then(res => {
      resolve(res.result);
    }).catch(reject)
  })
}

export const getUnsavedStartList = async raceId => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getUnsavedStartList',
      data: { raceId }
    }).then(res => {
      resolve(res);
    }).catch(reject)
  })
}

export const updateBibNum = async (raceId, userId) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'generateBibNum',
      data: { raceId, userId }
    }).then(res => {
      resolve(res);
    }).catch(reject)
  })
}