import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    {
      path: "/login",
      component: "@/layouts/LoginLayout",
      layout: false,
      routes: [
        {
          path: "",
          component: "@/pages/index",
        },
      ],
    },
    {
      path: "/",
      component: "@/layouts/index",
      wrappers: ["@/wrappers/auth"],
      layout: false,
      routes: [
        { path: "", component: "@/pages/home" },
        { path: "home", component: "@/pages/home" },
        { path: "home/new", component: "@/pages/home" },
        { path: "home/following", component: "@/pages/follow" },
        { path: "home/hot", component: "@/pages/hot" },
        { path: "search", component: "@/pages/search" },
        { path: "follow", component: "@/pages/followInfo" },
        { path: "follow/:address", component: "@/pages/followInfo" },
        { path: "profile", component: "@/pages/profile" },
        { path: "profile/:address", component: "@/pages/profile" },
        { path: "tweet/:id", component: "@/pages/tweet" },
        { path: "buzz/:id", component: "@/pages/tweet" },
        { path: "setting", component: "@/pages/setting" },
        { path: "about", component: "@/pages/about" },
        { path: "rank", component: "@/pages/rank" },
      ],
    },
    {
      path: "/dashboardLogin",
      component: "@/pages/dashboard/login",
      layout: false,
    },
    {
      path: "/dashboard",
      component: "@/layouts/dashboard",
      layout: false,
      wrappers: ["@/wrappers/dashboardAuth"],
      routes: [
        { path: "/dashboard/styles", component: "@/pages/dashboard/styles" },
        { path: "/dashboard/fees", component: "@/pages/dashboard/fees" },
        { path: "/dashboard/metaso", component: "@/pages/dashboard/metaso" },
      ],
    },
  ],

  plugins: [
    "@umijs/plugins/dist/model",
    "@umijs/plugins/dist/request",
    "@umijs/plugins/dist/locale",
  ],
  locale: {
    default: "en-US",
    baseSeparator: "-",
    antd: true,
    baseNavigator: false,
  },
  model: {},
  request: {},
  npmClient: "pnpm",
  outputPath: "../shownow-backend/public",
  // process.env.BUILD_ENV === "docker" ? "../server-shownow/public" : "dist",
  esbuildMinifyIIFE: true,
  jsMinifier: "none",
  favicons: [
    "/ico/favicon.ico",
    "/favicon.ico"],
  title: "ShowNow",
  define: {
    "process.env.BUILD_ENV": process.env.BUILD_ENV,
  },
});
