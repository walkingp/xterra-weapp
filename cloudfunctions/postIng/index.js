// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const feedTable = db.collection("feed")

// 云函数入口函数
exports.main = async (event, context) => {
<<<<<<< HEAD
  const {
    userId,
    avatarUrl,
    content,
    picUrls,
    nickName,
    type = 'feed',
    placeId = null,
    location,
    coverUrls
  } = event;
=======
  const { userId, avatarUrl, content, picUrls, nickName, type = 'feed', placeId = null } = event;
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4

  try {
    const secRes = await cloud.openapi.security.msgSecCheck({
      content
    })
    console.log(secRes);
    if (secRes.errCode !== 0) {
      return {
        code: -1,
        msg: secRes.errMsg
      }
    }
    let data = {
      userId,
      avatarUrl,
      addedDate: new Date(),
      content,
      picUrls,
      kudos: 0,
      comments: 0,
      status: '1',
      isActive: true,
      nickName,
      type,
      placeId,
      location
    };
    if (location) {
      data.location = location;
    }
    if (coverUrls) {
      data.coverUrls = coverUrls;
    }
    const res = await feedTable.add({
<<<<<<< HEAD
      data
=======
      data: {
        userId,
        avatarUrl,
        addedDate: new Date(),
        content,
        picUrls,
        kudos: 0,
        comments: 0,
        status: '1',
        isActive: true,
        nickName,
        type,
        placeId
      }
>>>>>>> b9e7367006069f33940f96daa9502cad52ea4cb4
    });
    return {
      code: 0,
      ...res
    };
  } catch (err) {
    return {
      code: -1,
      msg: '包含敏感字符'
    }
  }
}