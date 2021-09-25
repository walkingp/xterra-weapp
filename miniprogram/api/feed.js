import { getCollectionById, getPaginations } from "../utils/cloud";

export const getCommentList = async (
  pageIndex = 1,
  pageSize = 10,
  placeId,
  order = "latest"
) => {
  const orderBy =
    order === "latest" ? { addedDate: "desc" } : { kudos: "desc" };
  const data = await getPaginations({
    dbName: "feed",
    filter: {
      isActive: true,
      type: "place",
      placeId,
    },
    orderBy,
    pageIndex,
    pageSize,
  });
  return data;
};

export const getVideoList = async (
  pageIndex = 1,
  pageSize = 10
) => {
  const db = wx.cloud.database();
  const _ = db.command;
  const res = await db
    .collection("feed")
    .where({
      coverUrls: _.neq(null)
    })
    .skip((pageIndex - 1) * pageSize)
    .limit(pageSize)
    .get();
  return res.data;
};

export const getFeedIndexList = async (
  pageIndex = 1,
  pageSize = 10,
  type = "feed"
) => {
  const data = await getPaginations({
    dbName: "feed",
    filter: {
      isActive: true,
      type,
    },
    orderBy: {
      addedDate: "desc",
    },
    pageIndex,
    pageSize,
  });
  return data;
};

export const getRecommendedFeedIndexList = async (
  pageIndex = 1,
  pageSize = 10
) => {
  const data = await getPaginations({
    dbName: "feed",
    filter: {
      status: "3",
      isActive: true,
    },
    orderBy: {
      addedDate: "desc",
    },
    pageIndex,
    pageSize,
  });
  return data;
};

export const searchFeed = async (keyword) => {
  const db = wx.cloud.database();
  const res = await db
    .collection("feed")
    .where({
      content: {
        $regex: ".*" + keyword + ".*",
        $options: "1",
      },
    })
    .limit(20)
    .get();
  return res;
};

export const getFeedsByUserId = async (
  userId,
  pageIndex = 1,
  pageSize = 10
) => {
  const data = await getPaginations({
    dbName: "feed",
    filter: {
      userId,
      isActive: true,
    },
    orderBy: {
      addedDate: "desc",
    },
    pageIndex,
    pageSize,
  });
  return data;
};

export const getKudosFeedsByUserId = async (
  userId,
  pageIndex = 1,
  pageSize = 10
) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: "getKudosedFeeds",
      data: { userId },
      success: (res) => {
        resolve(res);
      },
      fail: (err) => reject(err),
    });
  });
};
export const addFeed = ({
  userId,
  avatarUrl,
  content,
  picUrls,
  coverUrls,
  nickName,
  type,
  placeId,
  location,
}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: "postIng",
      data: {
        userId,
        avatarUrl,
        content,
        picUrls,
        nickName,
        type,
        placeId,
        location,
        coverUrls,
      },
      success: (res) => {
        resolve(res);
      },
      fail: (err) => reject(err),
    });
  });
};

export const checkTextSec = ({ content }) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: "checkTextSec",
      data: { content },
      success: (res) => {
        resolve(res);
      },
      fail: (err) => reject(err),
    });
  });
};

export const giveKudos = ({ userId, userInfo, id, type = "feed" }) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: "giveKudos",
      data: {
        data: {
          userInfo,
          updatedAt: new Date(),
          createdAt: new Date(),
          userId,
        },
        type,
        id,
      },
      success: (res) => {
        resolve(res);
      },
      fail: (err) => reject(err),
    });
  });
};
