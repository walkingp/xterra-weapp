// 云函数入口文件
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: 'qq',
  port: 465, // SMTP 端口
  secure: true, // 使用 SSL
  auth: {
    user: '1289657692@qq.com', // 发送邮件的邮箱
    pass: 'beqjhhpiuegbhgha' // 邮箱密码
  }
});
const mailOptions = {
  from: '1289657692@qq.com', // 发件地址
  to: 'walkingp@126.com', // 收件列表
  subject: '测试云函数', // 标题
  text: '测试云函数'
};
// 云函数入口函数
exports.main = async (event, context) => {
  console.log("Start to sendemail")
  //开始发送邮件
  const info = await transporter.sendMail(mailOptions);
  console.log('Message sent: ' + info.response);
  return info
}