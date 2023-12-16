export const APIURL = {
  BASE_URL: "http://localhost:8080/bookshop",
  ACCOUNT_SIGNUP: "/api/account/register",
  ACCOUNT_SIGNIN: "/api/account/auth",
  ACCOUNT_BASE: "/api/account",
  MAIL_CONFIRMATION: "/api/confirm",
  SACH_RANDOM: "/api/sach/random",
  SACH_BASE: "/api/sach",
  CART_BASE: "/api/cart",
  LOAI_BASE: "/api/loai",
  SACH_ALL: "/api/sach/all",
  ORDER_BASE: "/api/order",
  ORDER_CREATE: "/api/order/new",
  STATS_BASE: "/api/statistics",
  PAYMENT_BASE: "/api/stripe",
};

export const ServerErrorStatusCode = [
  "INTERNAL_SERVER_ERROR",
  "SERVICE_UNAVAILABLE",
];

export const NavigationLink = {
  SIGN_IN: "/account/sign-in",
  SIGN_UP: "/account/sign-up",
  ACCOUNT_CONFIRM: "/account/sign-up/confirmation",
  FORGOT_PASSWORD: "/forgot",
  HOME_USER: "/",
  NOT_FOUND: "/not-found",
  UNAUTHORIZED: "/unauthorized",
  SACH_BASE: "/sach",
  ACCOUNT_USER_INFO: "/account/info",
  ACCOUNT_USER_CART: "/account/cart",
  ACCOUNT_USER_ORDER: "/account/order",
  ACCOUNT_USER_PAYMENT: "/account/payment",
  ACCOUNT_ADMIN_INFO: "/admin/info",
  HOME_ADMIN: "/admin/sach",
  ADMIN_NEW_SACH: "/admin/sach/new",
  ADMIN_ORDER: "/admin/order",
  ADMIN_STATS: "/admin/statistics",
  ADMIN_LOAI: "/admin/loai",
};

export const CookieKey = {
  JWT: "bs-jwt",
  ACCOUNT_ID: "bs-account-id",
  AUTHORITY: "bs-authority",
};

export const Authority = {
  USER: "ROLE_USER",
  ADMIN: "ROLE_ADMIN",
};
