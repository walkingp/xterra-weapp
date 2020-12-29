const config = {
  env: 'xterra-c2969f',
  appId: 'wx491fb14c7948a753',
  appTitle: 'XTERRA',
  appDescription: 'XTERRA官方小程序',
  mapKey: 'YOWBZ-MK263-F7G3H-YWGGY-RGHKQ-ACFNH',
  storageKey: {
    kits: 'xterra.kits'
  },
  messageTemplates: {
    registration: {
      title: '赛事活动报名通知',
      templateId: 'FGiibaRONUAlefM3TA4s-enx4skhLNmFM-MY6yuEKLI',
      templateNo: 2150,
      fields: [
        {
          key: 'name1',
          name: '姓名'
        },
        {
          key: 'phone_number2',
          name: '手机'
        },
        {
          key: 'thing3',
          name: '赛事名称'
        },
        {
          key: 'amount4',
          name: '参赛金额'
        },
        {
          key: 'time5',
          name: '参赛时间'
        },
      ]
    },
    cancel: {
      title: '赛事活动取消通知',
      templateId: 'fMTad-wVB9hRh0bkvNdzB5FloL7QQTY_6U_iZLRqn84',
      templateNo: 19247,
      fields: [
        {
          key: '申请人',
          name: '姓名'
        },
        {
          key: 'time3',
          name: '参赛时间'
        },
        {
          key: 'thing4',
          name: '比赛场地'
        },
        {
          key: 'phrase5',
          name: '处理结果'
        }
      ]
    },
  }
};

module.exports = config;