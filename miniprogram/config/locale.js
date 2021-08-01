const locale = [
  {
    lang: 'zh_CN',
    isChinese: true,
    tabs: ['首页', '活动', '社区', '媒体中心', '我的']
  },  
  {
    lang: 'en_US',
    isChinese: false,
    tabs: ['Home', 'Events', 'Community', 'News', 'My']
  }
];

const locales = {
  '所属城市': 'City',
  'X-Discovery': 'X-Discovery',
  'X-Plogging': 'X-Plogging',
  '我的报名人资料': 'My profiles',
  '注意事项：': 'Cautions:',
  '确定要删除吗？': 'Are you sure to delete it?',
  '没有登录': 'You are not logged in',
  '右滑可选择删除，注意一经删除无法恢复，请谨慎操作。': 'Note the deletion cannot be restored. Exercise caution when performing this operation.',
  '提示': 'Caution',
  '一经删除无法恢复，是否确定要删除吗？': 'Once deleted, it cannot be restored. Are you sure to delete it?',
  '您当前位置距离目标$0为$1米，可以打卡': 'Your current position is $1 meters from location $0, you can tick now.',
  '您当前位置距离目标$0为$1米，超出打卡距离，不可打卡': 'Your current position is $1 meters from location $0, you cannot tick now.',
  '您当前位置在$0附近$1米': 'Your current position is $1 meters from location $0',
  '精选活动': 'Featured events',
  '成绩查询': 'Results',
  '暂无组别': 'No group',
  '活动详情': 'Introduction',
  '领队': 'Leader',
  '队员': 'Member',
  '发现': 'Discovery',
  '我的主页': 'My page',
  '我的收藏': 'My Favs',
  '拥有打卡点：': 'Check points: ',
  '切换城市': 'Switch city',
  '精选地点': 'Featured sites',
  '查看详情': 'Details',
  '新闻动态': 'News',
  '地区': 'Location',
  '江浙沪': 'Jiangsu-Zhejiang-Shanghai',
  '京津冀': 'Beijing-Tianjin-Hebei',
  '珠三角': 'Pearl River Delta',
  '西南地区': 'Southwestern China',
  '其他地区': 'Other regions',
  '海外': 'Overseas',
  '志愿者': 'Volunteer',
  '比赛检录': 'Check in',
  '我的检录': 'My check',
  '管理员专用': 'Admin only',
  '报名状态': 'Reg. Status',
  '未开始报名': 'Reg. not open',
  '报名中': 'Reg. now',
  '名额已满': 'Full',
  '报名已截止': 'Reg. closed',
  '比赛已结束': 'Race finished',
  '活动类型': 'Event Type',
  '报名优惠费用': 'Discount fee',
  '铁人三项': 'Triathlon',
  '退改规则': 'Refund rules',
  '越野跑': 'Trail run',
  '山地车': 'MTB',
  'X-Plogging': 'X-Plogging',
  '训练营': 'Training camp',
  '比赛': 'Event',
  '活动': 'Event',
  '类型': 'Type',
  '组别': 'Group',
  '地点': 'Venue',
  '时间': 'Date',
  '费用': 'Fee',
  '发布成功': 'Sent Successfully',
  '上传中': 'Uploading',
  '请先登录': 'Please login',
  '比赛地点': 'Event Venue',
  '比赛新闻': 'Event News',
  '活动地点': 'Event Venue',
  '活动组别': 'Event Group',
  '活动新闻': 'Event News',
  '暂无新闻': 'No news',
  '查看更多': 'Load more',
  '活动时间': 'Event time',
  '活动地点': 'Event venue',
  '活动类型': 'Event type',
  '比赛时间': 'Event time',
  '比赛地点': 'Event venue',
  '比赛类型': 'Event type',
  '比赛组别': 'Event Group',
  '报名查询': 'Registration query',
  '证书下载': 'Certificate',
  '装备要求': 'Kits requirement',
  '交通住宿': 'Transportation & Hotel',
  '报名名单': 'Start list',
  '活动新闻': 'Event News',
  '活动组别': 'Event Group',
  '线路图': 'Route',
  '比赛规程': 'Competition rules',
  '报名须知': 'Reg Guide',
  '比赛流程': 'Event schedule',
  '活动流程': 'Event schedule',
  '查询报名和成绩': 'Registration & Results',
  '请选择分站': 'Select branch',
  '请选择查询者': 'Select participant',
  '或者直接输入证件号': 'Or input your Passport No.',
  '查询': 'Query',
  '已检录': 'Checked in',
  '未检录': 'Unchecked in',
  '号码': 'Bib number',
  '完赛成绩': 'Finish time',
  '游泳时间': 'Swim time',
  'T1换项': 'T1 time',
  '骑行时间': 'Bike time',
  'T2换项': 'T2 time',
  '跑步时间': 'Run time',
  '组内排名': 'Division rank',
  '总排名': 'Overall rank',
  '净时间': 'Net time',
  '活动状态': 'Event status',
  '完赛状态': 'Event status',
  '证书': 'Certificate',
  '成绩': 'Result',
  '下载证书': 'Download certificate',
  '没有查询到证书': 'No certificate found',
  '没有查询到成绩': 'No results found',
  '没有查询到报名': 'No registration info found',
  '报名': 'Registration',
  '证书': 'Certificate',
  '请选择': 'Please select',
  '立即报名': 'Register now',
  '一键报名': 'Register now',
  '保存到本地': 'Save to album',
  '查看百万森林证书': 'View Million Forrest Cert',
  '返回XTERRA证书': 'Back to XTERRA Cert',
  '搜索历史': 'History',
  '请输入搜索关键词': 'Please input keywords',
  '搜索': 'Search',
  '搜索结果': 'Results',
  '未搜索到结果': 'No results found',
  '免费': 'Free',
  '选择组别': 'Category',
  '选择报名人': 'Participant',
  '确认付款': 'Payment',
  '完成报名': 'Finished',
  '团队信息': 'Team info',
  '第一步': 'First step',
  '第二步': 'Second step',
  '不可报名': 'Cannot register',
  '家庭信息': 'Family info',
  '请填写家庭队名': 'Input family name',
  '选择已有团队': 'Select existed team',
  '您的被邀请团队': 'Your invited team',
  '我是团队负责人': 'I am a team leader',
  '我是团队成员': 'I am a team member',
  '请选择组别': 'Please select category',
  '我已认真阅读并且同意': 'I have read it carefully and agree',
  '《免责协议》': ' Waiver & Release Agreement',
  '注意事项': 'Notes',
  '每次只能选择一个组别进行报名，如需多人报名多个组别，请依次完成每个组别的报名；': 'Each time one can only choose one category to register. If register for others or for other more categories, please complete one by one;',
  '各组别优惠价格及退改政策，请点击选择组别后查看报名优惠价格。': 'Preferential prices and refund policies, please click on the selected event or category for details.',
  '下一步': 'Next',
  '请选择报名人': 'Select participant',
  '编辑': 'Edit',
  '返回上一步': 'Go back',
  '查看报名': 'View registration',
  '返回主页': 'Go back to home page',
  '添加新报名人': 'Add a new applicant',
  '添加联系人': 'Add a contact',
  '修改联系人': 'Edit a contact',
  '基本信息': 'Basic info',
  '与本人关系': 'Relationship with me',
  '其他': 'Other',
  '如': 'e.g.',
  '家人': 'Family',
  '同事': 'Colleagues',
  '朋友': 'Friends',
  '姓名': 'Real name',
  '请输入真实姓名': 'Please input real name',
  '国籍': 'Nationality',
  '请输入国籍': 'Your nationality',
  '拼音姓': 'Last Name',
  '拼音名': 'First Name',
  '中国': 'China',
  '微信号': 'Wechat ID',
  '可以被添加的微信号': 'Wechat ID can be invited',
  '证件类型': 'ID Type',
  '身份证': 'ID Card',
  '护照': 'Passport',
  '军官证': 'military ID',
  '证件号码': 'ID No.',
  '请输入证件号': 'Please input ID No.',
  '性别': 'Gender',
  '男': 'Male',
  '女': 'Female',
  '返回': 'Back',
  '手机号': 'Cell phone number',
  '请输入手机号': 'Please input cell phone number',
  '出生日期': 'Birth date',
  '邮箱': 'Email',
  '请输入邮箱，用于接收报名邮件': 'Please enter your email address for registration notifications',
  '其他信息': 'Other info',
  '血型': 'Blood type',
  '衣服尺码': 'T-shirt size',
  '住址所属地区': 'Region',
  '未选择': 'Not selected',
  '家庭住址': 'Address',
  '所属俱乐部': 'Club',
  '完赛资质': 'Qulification certificate',
  '成绩证书': 'Finisher\'s certificate',
  '仅限图片': 'Pictures only',
  '自定义项': 'Customized options',
  '请输入俱乐部名称': 'Club name',
  '如：xx路xx号xx室': 'E.G.: No. xxx, xx Road',
  '使用微信地址': 'Use Wechat address',
  '紧急联系人信息': 'Emergency contact information',
  '紧急联系人手机': 'Emergency contact phone number',
  '紧急联系人': 'Emergency contact',
  '请输入11位手机号': 'Please input cell phone number',
  '相关信息': 'Related info',
  '是否参加过X-Plogging': 'Whether you have participated X-Plogging before',
  '是': 'Yes',
  '否': 'No',
  '添加': 'Add',
  '保存': 'Save',
  '保存成功': 'Save successfully',
  '请填写完整资料': 'Please fill in all required fields',
  '个人组': 'Individual',
  '团队组': 'Team',
  '亲子组': 'Family',
  '报名信息': 'Registration info.',
  '活动名称': 'Event name',
  '比赛名称': 'Event name',
  '报名类别': 'Event type',
  '总费用': 'Total fee',
  '选择优惠券': 'Select coupon',
  '优惠券': 'Coupon',
  '优惠金额': 'Discount fee',
  '订单状态': 'Order status',
  '最终费用': 'Final cost',
  '暂无': 'None',
  '待支付': 'Wait for payment',
  '报名人资料': 'Applicant information',
  '确认支付': 'Confirm to pay',
  '处理中': 'Processing',
  '发送短信中': 'Sending SMS',
  '发送邮件中': 'Sending email',
  '恭喜你完成报名': 'Congratulations on completing your registration',
  '请登录以下邮箱检查报名确认邮件：': 'Please check your registration email at the following email:',
  '如有任何报名问题，请与客服人员及时联系': 'If you have any registration questions, please contact customer service staff in a timely manner',
  '返回我的报名': 'Return to my registration',
  '邀请报名': 'Invite',
  '加载中': 'Loading',
  '加载中…': 'Loading',
  '加载中……': 'Loading',
  '团队': 'Team',
  '团队名': 'Team name',
  '微信名': 'Wechat ID',
  '全部报名': 'All',
  '已完成': 'Completed',
  '待付款': 'Pending',
  '付款方式': 'Wechat pay',
  '已取消': 'Canceled',
  '已支付': 'Paid',
  '实付费用': 'Actual fee',
  '删除': 'Delete',
  '订单编号': 'Order No.',
  '订单时间': 'Order time',
  '复制': 'Copy',
  '付款方式': 'Payment type',
  '报名组别': 'Category',
  '报名费用': 'Paid fee',
  '报名审核': 'Registration review',
  '已审核通过': 'Approved',
  '未审核通过': 'Rejected',
  '申请退款': 'Refund',
  '取消活动': 'Cancel event',
  '我的报名': 'My registration',
  '取消理由': 'Reason for cancellation',
  '退款中': 'Refunding',
  '取消成功': 'Cancelled successfully',
  '退款成功': 'Refunded successfully',
  'X-Plogging为免费活动，取消前请提前与负责人联系，多次取消后可能会影响您的后续报名。': 'This event is free of charge, please contact the leader in advance before cancellation, too many cancellations may affect your subsequent registration.',
  '退款申请将在后台审核完成后才能退款，退款在审核完成后大约一周内退还到原支付账户。': 'Refund requests will not be refunded until XTERRA approves it and the refund will be returned to the original payment account in about one week after the approval.',
  '填错信息': 'Wrong info',
  '重复报名': 'Duplicated registration',
  '行程冲突': 'Conflicted trip',
  '其他原因': 'Other reason',
  '取消': 'Cancel',
  '再想一想': 'Think again',
  '已退款': 'Refunded',
  '拒绝原因': 'Reject reason',
  '点击查看': 'View detail',
  '重新上传': 'Re-upload',
  '立即支付': 'Pay now',
  '最新': 'Latest',
  '推荐': 'Recommended',
  '点击地图开始导航': 'Tap the map to start navigation',
  '精选照片': 'Featured photos',
  '加载更多': 'Load more',
  '最热': 'Hottest',
  '勋章领取成功': 'Receive a Medal successfully',
  '打卡后即可领取此勋章': 'You can receive this medal by uploading your discovery photos',
  '我知道了': 'OK',
  '请输入搜索关键词': 'Keywords',
  '和大家分享你的动态吧': 'Share your discoveries with us',
  '1、营造良好社区氛围，请发表积极向上与运动相关的内容；': '1. To create a good community atmosphere, post positive sports-related content',
  '2、请勿发表带有敏感隐私信息的图片，谨防上当受骗；': '2. Do not post images with sensitive private information and beware of being deceived',
  '3、请遵守国家法律法规。': '3. please comply with national laws and regulations.',
  '发布动态': 'Post',
  '动态': 'Feed',
  '打卡': 'Tick',
  '收藏': 'Favs',
  '勋章': 'Medals',
  '点赞': 'Like',
  '语言设置': 'Language',
  '语言': 'Language',
  '强制装备': 'Mandatory kits',
  '推荐装备': 'Recommended kits',
  '组委会暂未添加强制装备': 'The organizing committee has not added mandatory kits at this time',
  '组委会暂未添加推荐装备': 'The organizing committee has not added recommended kits at this time',
  '所有评论': 'All comments',
  '暂无评论': 'No comments',
  '评论内容': 'Content',
  '发表评论': 'Post',
  '人觉得很赞': ' liked',
  '分类': 'Category',
  '按时间倒序': 'Reverse order',
  '按时间正序': 'Positive order',
  '赛事': 'Race',
  '人物': 'People',
  '新闻': ' News',
  '积分': 'Points',
  '我的信息': 'My profile',
  '我的帖子': 'My post',
  '我的报名': 'My regs',
  '报名资料': 'Participants',
  '联系我们': 'Contact us',
  '帮助中心': 'Help center',
  '关于XTERRA': 'About us',
  '个人资料': 'Profile',
  '加载中……': 'Loading',
  '现在点赞': 'Like',
  '已支付': 'Paid',
  '已退款': 'Refunded',
  '收藏成功': 'Favorited',
  '取消成功': 'Cancelled',
  '点赞用户': 'Liked users',
  '资料不完整': 'Incomplete',
  '年龄不符合': 'Invalid age',
  '你还没有添加过任何报名资料': 'You haven\'t added any registration information yet',
  '请设置接力成员': 'Please set up the relay members',
  '3人团队，每人仅限一个单独项目；2人团队，每人最多可报2个项目。铁三团队组仅限队长统一报名。': '3-person team, each limited to one individual project, 2-person team, each can join up to 2 projects. Tri team registration shall be signed by the team leader.',
  '优惠券代码': 'Coupon code',
  '请输入12位优惠券代码': 'Please enter a 12-digit coupon code',
  '更多城市解锁，敬请期待……': 'More cities to come, stay tuned',
  'XTERRA推出的户外体验活动，精选全球最好玩的地方': 'X-Discovery is here.... it\’s time to play your part',
  '报名开始时间': 'Registration start time',
  '报名截止时间': 'Registration end time',
  '暂无数据，请检查数据或者更改过滤条件': 'No data, check the data or change the filter',
  '铁三比赛中接力报名由队长一人完成，须由2-3位成员完成；': 'The Tri-relay registration shall be signed in with team leader. The game shall be completed by 2-3 members of the team',
  '团队人数上限': 'The maximum number of teams is',
  '人': ' people',
  '团队负责人报名时可选择一次录入多名团员资料，也可在创建团队后分享给其他成员填写资料；': 'Team leader can choose to enter more than one group member information at a time, or after the creation of the team to share with other members to fill in the information;',
  '费用由团队负责人支付；': 'The registration fee is paid by the team leader;',
  '团队成员报名时请注意选择正确团队。': 'When team members sign up, be careful to select the right team.',
  '必须一次完成报名，人数不可少于2人；': 'Registration must be completed at once and the number of persons must not be less than 2;'
};

module.exports = { locale, locales };