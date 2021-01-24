export const updatePoint = (userId, type, extraData) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'updatePoints',
      data: {
        userId,
        type,
        extraData
      },
      success: res => {
        // 清除缓存
        resolve(res.result)
      },
      fail: err=> reject(err)
    });
  });
}