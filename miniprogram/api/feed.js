import { getCollectionById, getPaginations } from "../utils/cloud"

export const getFeedIndexList = async (pageIndex = 1, pageSize = 10) => {
  const data = await getPaginations({
    dbName: 'feed',
    filter: {
      isActive: true
    },
    orderBy: {
      addedDate: 'desc'
    },
    pageIndex,
    pageSize
  })
  return data;
}

export const getRecommendedFeedIndexList = async (pageIndex = 1, pageSize = 10) => {
  const data = await getPaginations({
    dbName: 'feed',
    filter: {
      status: '3',
      isActive: true
    },
    orderBy: {
      addedDate: 'desc'
    },
    pageIndex,
    pageSize
  })
  return data;
}

export const searchFeed = async keyword => {
  const db = wx.cloud.database();
  const res = await db.collection('feed').where({
    content: {
      $regex: '.*' + keyword + '.*',
      $options: '1'
    }
  }).limit(20).get();
  return res;
};

export const getFeedsByUserId = async (userId, pageIndex = 1, pageSize = 10) => {
  const data = await getPaginations({
    dbName: 'feed',
    filter: {
      userId,
      isActive: true
    },
    orderBy: {
      addedDate: 'desc'
    },
    pageIndex,
    pageSize
  })
  return data;
}

export const getKudosFeedsByUserId = async (userId, pageIndex = 1, pageSize = 10) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getKudosedFeeds',
      data: { userId },
      success: res => {
        resolve(res)
      },
      fail: err => reject(err)
    });
  });
}
export const addFeed = ({ userId, avatarUrl, content, picUrls, nickName }) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'postIng',
      data: { userId, avatarUrl, content, picUrls, nickName },
      success: res => {
        resolve(res)
      },
      fail: err => reject(err)
    });
  });
}

export const checkTextSec = ({ content }) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'checkTextSec',
      data: { content },
      success: res => {
        resolve(res)
      },
      fail: err => reject(err)
    });
  });
}

export const giveKudos = ({userId, userInfo, id, type = 'feed'}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'giveKudos',
      data: { 
        data: {
          userInfo,
          updatedAt: new Date(),
          createdAt: new Date(),
          userId,
        },
        type,
        id
       },
      success: res => {
        resolve(res)
      },
      fail: err => reject(err)
    });
  });
}