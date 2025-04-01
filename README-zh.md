# ShowNow 项目结构

```
shownow-frontend/
├── 配置文件
│   ├── .gitignore
│   ├── .npmrc
│   ├── .umirc.ts
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tailwind.config.js
│   ├── tailwind.css
│   ├── tsconfig.json
│   ├── typings.d.ts
│   └── yarn.lock
│
├── public/ - 公共资源
│   ├── favicon.ico
│
├── src/ - 源代码目录
│   ├── assets/ - 静态资源
│   │   ├── 图片资源 (.png, .svg)
│   │   └── dashboard/ - 仪表板相关资源
│   │
│   ├── Components/ - 公共组件
│   │   ├── Buzz/ - 推文相关组件
│   │   ├── Cards/ - 卡片组件
│   │   ├── Comment/ - 评论组件
│   │   ├── ConnectWallet/ - 钱包连接
│   │   ├── Follow/ - 关注相关
│   │   ├── HomeTabs/ - 首页标签
│   │   ├── ProfileCard/ - 个人资料卡片
│   │   ├── UserInfo/ - 用户信息
│   │   └── ...其他组件
│   │
│   ├── layouts/ - 布局组件
│   │   ├── dashboard.tsx - 仪表板布局
│   │   ├── showLayout.tsx - 展示布局
│   │   └── ...其他布局
│   │
│   ├── pages/ - 页面目录
│   │   ├── dashboard/ - 仪表板相关页面
│   │   │   ├── fees/ - 费用相关
│   │   │   ├── metaso/ - MetaSo相关
│   │   │   └── ...其他仪表板页面
│   │   ├── home/ - 首页
│   │   ├── profile/ - 个人资料
│   │   ├── tweet/ - 推文页
│   │   └── ...其他页面
│   │
│   ├── utils/ - 工具函数
│   │   ├── buzz.ts - 推文相关工具
│   │   ├── metaso.ts - MetaSo相关工具
│   │   └── ...其他工具
│   │
│   ├── models/ - 数据模型
│   ├── config/ - 配置
│   ├── request/ - API请求
│   ├── entities/ - 实体定义
│   ├── hooks/ - 自定义hooks
│   ├── wrappers/ - 高阶组件
│   ├── locales/ - 国际化
│   │   ├── en-US.ts - 英文语言包
│   │   └── zh-CN.ts - 中文语言包
│
└── patches/ - 补丁文件
```

## 主要功能模块

1. **Buzz组件** - 处理推文展示、转发、详情等功能
2. **Dashboard** - 仪表板相关功能，包括费用管理、MetaSo等
3. **用户系统** - 个人资料、关注、钱包连接等功能
4. **MetaSo集成** - 区块链相关功能集成
5. **国际化支持** - 多语言支持
