import resource from "zod-i18n-map/locales/zh-CN/zod.json";

const translation = {
  title: "React Router(v7) <0/> with Better Auth",
  description:
    "这是一个可以在CloudFlare Workers上部署的模板，该模板是由React Router V7(Remix)，Better Auth，Drizzle Orm和D1构建的。",
  common: {
    refresh: "刷新",
    submit: "提交",
    cancel: "取消",
    add: "添加",
    adding: "正在添加...",
    delete: "删除",
    deleting: "正在删除...",
    save: "保存",
    saving: "正在保存...",
  },
  user: {
    name: "昵称",
    token: "令牌",
    email: "邮箱",
    password: "密码",
    currentPassword: "当前密码",
    newPassword: "新密码",
    confirmPassword: "确认密码",
  },
  auth: {
    signIn: "登录",
    signingIn: "登录中...",
    signInTitle: "账户登录",
    signInWelcome: "欢迎回来！请继续登录",
    signInWith: "通过<0>{{name}}</0>登录",
    signUp: "注册",
    signingUp: "正在注册...",
    signUpContinue: "或者",
    signUpTitle: "账户注册",
    signUpWelcome: "欢迎！请填写详细信息",
    signingUpSuccess: "注册成功！请检查您的电子邮件以获取认证链接",
    enterPassword: "输入个性密码",
    signOut: "登出",
    signingOut: "正在登出...",
    forgotPasswordTitle: "忘记密码?",
    forgotPasswordDescription:
      "输入您的电子邮件地址，我们将向您发送密码重置链接",
    enterEmail: "输入您的电子邮件",
    sendResetLink: "发送密码重置链接",
    sendingResetLink: "正在发送密码重置链接...",
    sentLinkSuccess: "密码重置链接已发送到您的邮件中！",
    resetPasswordTitle: "重置您的密码",
    resetPasswordDescription: "在下面输入您的新密码，至少8个字符，最大32个字符",
    resetPassword: "重置密码",
    resettingPassword: "正在重置密码...",
    newPassword: "新密码",
    confirmPassword: "确认新密码",
    backSignIn: "返回登录",
    noAccount: "还没有账户?",
    haveAccount: "已有账户?",
    serviceAndPolicy: "单击继续，同意我们的 <0>服务条款</0> 与 <1>隐私政策</1>",
  },
  home: {
    title: "主页",
    start: "开始",
    star: "在Github上点赞",
  },
  todo: {
    title: "待办事项列表",
    today: "今天是",
    add: "添加待办事项",
    noFound: "没有待办事项",
  },
  dashboard: {
    title: "控制面板",
    welcome: "欢迎来到控制面板，您可以在这里管理您的待办事项和帐户设置。",
    todo: {
      label: "待办事项",
      description: "创建和管理您的待办事项",
    },
    account: {
      label: "帐户设置",
      description: "管理您的帐户设置",
    },
    admin: {
      label: "管理面板",
    },
  },
  account: {
    title: "帐户",
    description: "点击头像更改个人资料图片",
    deleted: "帐户已删除",
    avatar: "头像",
    noAvatar: "没有头像",
    avatarDeleted: "头像已删除",
    avatarUpdated: "头像已更新",
    nameEmail: "昵称 & 邮箱",
    currentSignIn: "当前登录",
    signInAs: "当前登录账户为",
    deleteAccount: "删除帐户",
    permanentlyDeleteAccount: "永久删除帐户",
    confirmation: "最终确认",
    confirmationWarn: "该动作不能撤消，请输入电子邮件地址以确认。",
  },
  appearance: {
    title: "外观",
    description: "自定义应用程序的外观。自动在白天和黑夜主题之间切换。",
  },
  connections: {
    title: "关联",
    description: "您可以将您的帐户关联到下面的第三方登录服务。",
  },
  sessions: {
    title: "会话",
    description:
      "如有必要，您可以登出其他所有浏览器会话。以下是您最近的会话，但此列表可能不完整。如果您认为您的帐户已被盗用，则应该更新密码。",
    noSessions: "没有会话",
    otherSignedOut: "其他会话登出成功",
  },
  password: {
    title: "密码",
    change: {
      title: "更改密码",
      description:
        "如果您已经设置了密码，则可以在此处进行更新。如果您忘记了密码，请在下面重置。",
      success: "密码成功更改了！其他会话已被撤销。",
      action: "在此处更改密码。您可以更改密码并设置新密码。",
    },
    reset: {
      title: "重置密码",
      description:
        "如果您忘记了密码，则可以在此处重置。另外，如果已经通过Github / Google注册，则可以在此处设置密码",
      success: "密码重置成功！请再次登录。",
    },
  },
  errors: {
    invalidData: "无效的表单数据",
    invalidIntent: "无效的意图",
    unexpected: "发生意外错误",
    loadingSessions: "加载会话错误",
    signInFailed: "{{provider}} 登录失败",
    invalidLoginMethod: "无效的登录方法",
    crashed: {
      title: "哇哦！应用崩溃了 💥",
      description: "请重新加载页面或稍后再试。",
    },
    notFound: {
      title: "哇哦！找不到此页面",
      description: "似乎您要访问的页面不存在或可能已被删除。",
    },
  },
};

const zod = {
  custom: {
    ...translation.user,
    isRequired: "{{field}}是必填的",
    passwordNotMatch: "新密码和确认密码不匹配",
  },
  ...resource,
};

export default {
  translation,
  zod,
};
