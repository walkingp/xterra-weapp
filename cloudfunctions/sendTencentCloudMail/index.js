const tencentcloud = require("tencentcloud-sdk-nodejs");

const SesClient = tencentcloud.ses.v20201002.Client;

const clientConfig = {
  credential: {
    secretId: "AKID7ycASUdl7IQL3WqiSwAJCD7xsdApZa2s",
    secretKey: "lJiuHk1XfZHjvtd7UFl35rU6YZWSCh18",
  },
  region: "ap-hongkong",
  profile: {
    httpProfile: {
      endpoint: "ses.tencentcloudapi.com",
    },
  },
};

// 云函数入口函数
exports.main = async (event, context) => {
  const { templateId, to, subject, data } = event;
  console.log("Start to sendemail", event)
  //开始发送邮件
  const client = new SesClient(clientConfig);
  const params = {
      "Destination": [
        to
      ],
      "Template": {
          "TemplateID": templateId || 12688,
          "TemplateData": JSON.stringify(data)
      },
      "FromEmailAddress": "noreply@xterra.club",
      "Subject": subject,
      "ReplyToAddresses": "noreply@xterra.club"
  };
  client.SendEmail(params).then(
    (data) => {
      console.log(data);
      return data;
    },
    (err) => {
      console.error("error", err);
      return err;
    }
  );  
}


