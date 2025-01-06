import _logo from "@/assets/dashboard/logo.svg";
import { networks, type Network } from "bitcoinjs-lib";
import defaultAvatar from "@/assets/defaultAvatar.svg";
const TESTNET_CONTENT_HOST = "https://man-test.metaid.io";
const MAINNET_CONTENT_HOST = "https://man.metaid.io";

export const getHostByNet = (network: API.Network) => {
  if (network === "testnet") return TESTNET_CONTENT_HOST;
  return MAINNET_CONTENT_HOST;
};

export const curNetwork: API.Network = "mainnet";
// window.METAID_MARKET_NETWORK || "mainnet";

export const TYPED_NETWORK: Network =
  curNetwork === "testnet" ? networks.testnet : networks.bitcoin;

export const METASO_BASE_API =
  curNetwork === "testnet"
    ? "https://www.metaso.network/api-base-testnet"
    : "https://www.metaso.network/api-base";

// export const DASHBOARD_API = "https://www.show.now/api";
// export const DASHBOARD_API = "http://127.0.0.1:3000/api";
// export const DASHBOARD_API =
//   window.BUILD_ENV === "docker" ? "/api" : "https://www.show.now/api";
export const DASHBOARD_API = "/api";
export const DASHBOARD_TOKEN = "DASHBOARD_TOKEN";

export const DASHBOARD_SIGNATURE = "DASHBOARD_SIGNATURE";
export const DASHBOARD_ADMIN_PUBKEY = "DASHBOARD_ADMIN_PUBKEY";
// export const BASE_MAN_URL =
//   window.BUILD_ENV === "docker" ? "/man" : "https://www.show.now/man";
// export const BASE_MAN_URL = "http://127.0.0.1:3000/man";
// export const BASE_MAN_URL = "https://man-test.metaid.io";
export const BASE_MAN_URL = window.location.origin + "/man";

export const BASE_IDCOIN_URL = "https://api.metaid.market/api-market-testnet";
export const FLAG = "metaid";

export const IMAGESIZE = 300;

export const DEFAULT_AVATAR = defaultAvatar;
export const DefaultLogo =
  "data:image/png;base64,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";

export const FallbackImage =
  "data:image/png;base64,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";
