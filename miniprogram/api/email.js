import {
  emailTemplateType
} from "../config/const";
import {
  getCollectionByWhere, sendTencentEmail
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

export const sendRegEmail = async (type, order) => {
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
    discountFee,
    paidFee,
    email
  } = order;
  return new Promise((resolve, reject) => {

    const dataSource = {
      raceTitle,
      trueName,
      orderNum,
      orderDate,
      cateTitle,
      catePrice: catePrice.toString(),
      cateNum: cateNum.toString(),
      totalFee: totalFee.toString(),
      discountFee: discountFee.toString(),
      paidFee: paidFee.toString()
    };
    const values = Object.keys(dataSource).map(item => {
      return {
        key: `{{${item}}}`,
        value: order[item].toString()
      }
    });
    getTemplateDetail(type).then(res => {
      if (res.length > 0) {
        console.log(res);
        const template = res[0];
        let {
          templateId,
          tempFileUrl,
          title
        } = template;
        wx.cloud.getTempFileURL({
          fileList: [tempFileUrl]
        }).then(res => {
          // get temp file URL
          console.log(res.fileList)
          const fileUrl = res.fileList[0].tempFileURL;
          console.log('email', fileUrl);
  
          wx.request({
            url: fileUrl,
            success: async function (e) {
              let html = e.data;
              values.forEach(item => {
                html = html.replace(item.key, item.value)
                html = html.replace(item.key, item.value)
              });
              title = title.replace("{{raceTitle}}", raceTitle);
              const data = await sendTencentEmail({
                templateId: +templateId,
                data: dataSource,
                to: email, // 收件列表
                subject: title, // 标题
              })
              console.log('邮件发送：', data)
              await saveSentEmail({
                title,
                email,
                trueName,
                content: html,
                raceId,
                sentTime: new Date()
              })
              console.log(data);
              resolve(data);
            },
            fail: function (err) {
              console.log(err)
              reject(err);
            }
          });
        }).catch(err => {
          reject(err);
        })
      }
    })
  })
};

export const saveSentEmail = async param => {
  const db = wx.cloud.database();
  const result = await db.collection("sentEmail").add({
    data: { ...param }
  });
  return result;
}