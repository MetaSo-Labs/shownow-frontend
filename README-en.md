# ShowNow Project Structure

```
shownow-frontend/
├── Configuration Files
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
├── public/ - Public resources
│   ├── favicon.ico
│
├── src/ - Source code
│   ├── assets/ - Static assets
│   │   ├── Images (.png, .svg)
│   │   └── dashboard/ - Dashboard related assets
│   │
│   ├── Components/ - Common components
│   │   ├── Buzz/ - Tweet related components
│   │   ├── Cards/ - Card components
│   │   ├── Comment/ - Comment components
│   │   ├── ConnectWallet/ - Wallet connection
│   │   ├── Follow/ - Follow related
│   │   ├── HomeTabs/ - Home tabs
│   │   ├── ProfileCard/ - Profile card
│   │   ├── UserInfo/ - User information
│   │   └── ...Other components
│   │
│   ├── layouts/ - Layout components
│   │   ├── dashboard.tsx - Dashboard layout
│   │   ├── showLayout.tsx - Show layout
│   │   └── ...Other layouts
│   │
│   ├── pages/ - Pages
│   │   ├── dashboard/ - Dashboard pages
│   │   │   ├── fees/ - Fee related
│   │   │   ├── metaso/ - MetaSo related
│   │   │   └── ...Other dashboard pages
│   │   ├── home/ - Home page
│   │   ├── profile/ - Profile page
│   │   ├── tweet/ - Tweet page
│   │   └── ...Other pages
│   │
│   ├── utils/ - Utility functions
│   │   ├── buzz.ts - Tweet utilities
│   │   ├── metaso.ts - MetaSo utilities
│   │   └── ...Other utilities
│   │
│   ├── models/ - Data models
│   ├── config/ - Configuration
│   ├── request/ - API requests
│   ├── entities/ - Entity definitions
│   ├── hooks/ - Custom hooks
│   ├── wrappers/ - Higher-order components
│   ├── locales/ - Internationalization
│   │   ├── en-US.ts - English language pack
│   │   └── zh-CN.ts - Chinese language pack
│
└── patches/ - Patch files
```

## Main Features

1. **Buzz Components** - Handle tweet display, repost, details etc.
2. **Dashboard** - Dashboard related features including fee management, MetaSo etc.
3. **User System** - Profile, follow, wallet connection etc.
4. **MetaSo Integration** - Blockchain related features
5. **Internationalization** - Multi-language support
