import {
  getCollectionById,
  getPaginations,
  getSingleCollectionByWhere
} from "../utils/cloud";
import {
  getAllRegistrationsByRaceId
} from "./registration";
const dayjs = require("dayjs");

export const getUserDetail = async id => {
  const data = await getCollectionById({
    dbName: 'userlist',
    id
  });
  return data;
}

export const getStartListList = async (cateId, size = 1000) => {
  const data = await getPaginations({
    dbName: 'start-list',
    filter: {
      cateId
    },
    pageIndex: 1,
    pageSize: size
  })
  return data;
}

export const getStartListListByRaceId = async (raceId, pageIndex = 1, pageSize = 200) => {
  const data = await getPaginations({
    dbName: 'start-list',
    filter: {
      raceId
    },
    pageIndex,
    pageSize
  })
  return data;
}

export const updateStartListCert = async (id, certRecheckUrl) => {
  const db = wx.cloud.database()
  const usersTable = db.collection("start-list")
  return await usersTable.doc(id).update({
    data: {
      certRecheckUrl
    }
  });
};

export const syncPlogging = async (id) => {
  return new Promise((resolve, reject) => {
    try {
      wx.cloud.callFunction({
        name: 'syncPlogging',
        data: {
          id
        },
        success(res) {
          resolve(res.result)
        }
      });
    } catch (err) {
      reject(err)
    }
  })
}

export const exportReport = async cateId => {
  const db = wx.cloud.database()
  const cateTable = db.collection("race-cates");
  return new Promise(async (resolve, reject) => {
    const cate = await cateTable.doc(cateId).get();
    const {
      title
    } = cate.data;
    console.log(`开始读取${title}报名人数`);
    const res = await getStartListList(cateId);
    let users = [
      ['报名人', '姓名', '性别', '手机号', '微信号', '国籍', '证件类型', '证件号码', '出生日期', '邮箱', '所属俱乐部', '血型', '衣服尺码', '省份', '住址', '紧急联系人', '紧急联系人手机', '是否参加过X-Plogging']
    ];
    res.forEach(item => {
      let user = [];
      user.push(item.userName);
      user.push(item.trueName);
      user.push(item.gender);
      user.push(item.phoneNum);
      user.push(item.wechatid);
      user.push(item.nation);
      user.push(item.cardType);
      user.push(item.cardNo);
      user.push(dayjs(item.birthDate).format("YYYY-MM-DD"));
      user.push(item.email);
      user.push(item.club);
      user.push(item.bloodType);
      user.push(item.tSize);
      user.push(item.region);
      user.push(item.addr);
      user.push(item.contactUser);
      user.push(item.contactUserPhone);
      user.push(item.plogging);
      users.push(user);
    })

    console.log(`共有报名人数${users.length}`);

    const dateStr = dayjs().format("YYYY-MM-DD-HH-mm-ss");
    const fileName = `${title}-${dateStr}完整报名表.xlsx`;
    const sheetName = '完整报名表';
    try {
      wx.cloud.callFunction({
        name: 'exportCSV',
        data: {
          data: users,
          fileName,
          sheetName
        },
        success(res) {
          resolve(res.result)
        }
      });
    } catch (err) {
      reject(err)
    }
  })
}

export const exportRegReportByRaceId = async (raceId) => {
  return new Promise((resolve, reject) => {
    try {
      wx.cloud.callFunction({
        name: 'exportRegReport',
        data: {
          raceId
        },
        success(res) {
          resolve(res.result)
        }
      });
    } catch (err) {
      reject(err)
    }
  })
}

export const exportUsers = async () => {
  return new Promise((resolve, reject) => {
    try {
      wx.cloud.callFunction({
        name: 'exportUsers',
        success(res) {
          resolve(res.result)
        }
      });
    } catch (err) {
      reject(err)
    }
  })
}

export const exportFinanceReport = async (raceId) => {
  return new Promise((resolve, reject) => {
    try {
      wx.cloud.callFunction({
        name: 'exportFinanceReport',
        data: {
          raceId
        },
        success(res) {
          resolve(res.result)
        }
      });
    } catch (err) {
      reject(err)
    }
  })
}

export const checkInUser = async (userId) => {
  const db = wx.cloud.database();
  const _ = db.command;
  return await db.collection("userlist").doc(userId).update({
    data: {
      checkInTime: _.inc(1)
    }
  })
};

export const getUserMedals = async (userId) => {
  return new Promise((resolve, reject) => {
    try {
      wx.cloud.callFunction({
        name: 'getUserMedals',
        data: {
          userId
        },
        success(res) {
          resolve(res.result?.list)
        }
      });
    } catch (err) {
      reject(err)
    }
  })
}

export const getUserPlaces = async (userId) => {
  return new Promise((resolve, reject) => {
    try {
      wx.cloud.callFunction({
        name: 'getUserPlaces',
        data: {
          userId
        },
        success(res) {
          resolve(res.result?.list)
        }
      });
    } catch (err) {
      reject(err)
    }
  })
}

export const getUserFavs = async (userId) => {
  return new Promise((resolve, reject) => {
    try {
      wx.cloud.callFunction({
        name: 'getUserFavs',
        data: {
          userId
        },
        success(res) {
          resolve(res.result?.list)
        }
      });
    } catch (err) {
      reject(err)
    }
  })
}
