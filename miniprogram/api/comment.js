export const addComment = ({ userId, avatarUrl, content, feedId, nickName }) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'comment',
      data: { userId, avatarUrl, content, feedId, nickName },
      success: res => {
        resolve(res)
      },
      fail: err => reject(err)
    });
  });
}