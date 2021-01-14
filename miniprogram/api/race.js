import { orderStatus } from "../config/const";
import { getPaginations, getCollectionById, getCollectionByWhere, getSingleCollectionByWhere, hideCollectionById } from "../utils/cloud"
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
      cate: '赛事',
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

export const getRaceCatesList = async ( raceId, size = 500) => {
  const cates = await getPaginations({
    dbName: 'race-cates',
    filter: {
      raceId,
      isActive: true
    },
    orderBy: {
      order: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
     
  cates.map(cate=>{
    const now = dayjs(new Date());
    if(now.isBefore(cate.regEndTime)){
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
  return cates;
}

export const getAllRaces = async ( size = 100) => {
  const data = await getPaginations({
    dbName: 'race',
    orderBy: {
      raceDate: 'desc'
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}

export const getRaceIndexList = async ( size = 40) => {
  const data = await getPaginations({
    dbName: 'race',
    filter: {
      isActive: true
    },
    orderBy: {
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
  const profile = await getCollectionById({ dbName: 'profile', id: profileId });
  const { trueName, phoneNum, wechatId, cardNo, cardType, certPic, club } = profile;
  const hasBasicInfo = trueName && phoneNum && cardNo && cardType;
  const isCertValid = !cate.isCheckCert || (cate.isCheckCert && !!certPic);

  if(Date.parse(profile.birthDate)){
    const age = new Date().getFullYear() - profile.birthDate.getFullYear();
    const isAgeValid = !cate.minAge || cate.minAge <= age;
    return { isValid: hasBasicInfo && isCertValid, isAgeValid };
  }
  wx.showToast({
    title: '出生日期格式不正确',
    icon: 'none'
  })
  return { isValid: hasBasicInfo && isCertValid, isAgeValid: false };
};

export const removeRegistration = async id => {
  const data = await hideCollectionById({ dbName: 'registration', id })
  return data;
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
  })
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
export const getRegistrationByOrderNum = async orderNum => {
  const data = await getCollectionByWhere({ dbName: 'registration', filter: { orderNum } });
  return data.length ? data[0] : null;
}

export const getRegistrationByCardNo = async (filter) => {
  const data = await getSingleCollectionByWhere({ dbName: 'start-list', filter});
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