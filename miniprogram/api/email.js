import {
  emailTemplateType
} from "../config/const";
import {
  getCollectionByWhere, sendEmail
} from "../utils/cloud"

export const getTemplateDetail = async type => {
  const data = await getCollectionByWhere({
    dbName: 'email',
    filter: {
      type
    }
  });
  return data;
}

export const sendRegEmail = async order => {
  const {
    raceId,
    raceTitle,
    trueName,
    orderNum,
    orderDate,
    cateTitle,
    catePrice,
    cateNum,
    totalFee,
    paidFee,
    email
  } = order;
  const dataSource = {
    raceTitle,
    trueName,
    orderNum,
    orderDate,
    cateTitle,
    catePrice,
    cateNum,
    totalFee,
    paidFee
  };
  const values = Object.keys(dataSource).map(item => {
    return {
      key: `{{${item}}}`,
      value: order[item]
    }
  });
  getTemplateDetail(emailTemplateType.registration.value).then(res => {
    if (res.length > 0) {
      console.log(res);
      const template = res[0];
      let {
        tempFileUrl,
        title
      } = template;
      wx.cloud.getTempFileURL({
        fileList: [tempFileUrl]
      }).then(res => {
        // get temp file URL
        console.log(res.fileList)
        const fileUrl = res.fileList[0].tempFileURL;

        wx.request({
          url: fileUrl,
          success: async function (e) {
            let html = e.data;
            values.forEach(item => {
              html = html.replace(item.key, item.value)
              html = html.replace(item.key, item.value)
            });
            title = title.replace("{{raceTitle}}", raceTitle);
            const data = await sendEmail({
              from: 'XTERRA<1289657692@qq.com>', // 发件地址
              to: email, // 收件列表
              subject: title, // 标题
              html: html
            })
            await saveSentEmail({
              title,
              email,
              trueName,
              content: html,
              raceId,
              sentTime: new Date()
            })
            console.log(data);
          },
          fail: function (res) {
            console.log(res)
          }
        });
      }).catch(error => {
        // handle error
      })
    }
  })
};

export const saveSentEmail = async param => {
  const db = wx.cloud.database();
  const result = await db.collection("sentEmail").add({
    data: { ...param }
  });
  return result;
}