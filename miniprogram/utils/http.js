function fun(url, method, data, header) {
  data = data || {};
  header = header || {
  	'Content-Type': 'application/json'
  };
  const access_token = getApp().globalData.access_token || wx.getStorageSync("token");
  if (access_token) {
    if (!header || !header["Authorization"]) {
      header["Authorization"] = access_token;
    }
  }
  wx.showNavigationBarLoading();
  let promise = new Promise(function (resolve, reject) {
    wx.request({
      url: apiUrl + url,
      header: header,
      data: data,
      method: method,
      success: function (res) {
        if (typeof res.data === "object") {
          if (res.data.code) {
            if (res.data.code === -200) {
              wx.showToast({
                title: "为确保能向您提供最准确的服务，请退出应用重新授权",
                icon: "none"
              });
              reject("请重新登录");
            } else if (res.data.code === 401) {
              wx.showToast({
                title: res.data.msg,
                icon: "none"
              });
              reject(res.data.msg);
            }
          }
        }
        if(res.statusCode === 200){
          const data = res.data.data ? (typeof res.data.data === 'string' && typeof JSON.parse(res.data.data) ==='object' ? JSON.parse(res.data.data) : res.data.data) : res.data;
          resolve(data);
        }
      },
      fail: function(err){
        reject(err)
      },
      complete: function () {
        wx.hideNavigationBarLoading();
      }
    });

  });
  return promise;
}

module.exports = {
  "get": function (url, data, header) {
    return fun(url, "GET", data, header);
  },
  "post": function (url, data, header) {
    return fun(url, "POST", data, header);
  }
};