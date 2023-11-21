export const APIURL = {
  BASE_URL: "http://localhost:8080/bookshop",
  ACCOUNT_SIGNUP: "/api/account/register",
  ACCOUNT_SIGNIN: "/api/account/auth",
  ACCOUNT_BASE: "/api/account",
  MAIL_CONFIRMATION: "/api/confirm/account-register",
  SACH_RANDOM: "/api/sach/random",
  SACH_BASE: "/api/sach",
  CART_BASE: "/api/cart",
  LOAI_BASE: "/api/loai",
  SACH_ALL: "/api/sach/all",
};

export const ServerErrorStatusCode = [
  "INTERNAL_SERVER_ERROR",
  "SERVICE_UNAVAILABLE",
];

export const NavigationLink = {
  SIGN_IN: "/account/sign-in",
  SIGN_UP: "/account/sign-up",
  ACCOUNT_CONFIRM: "/account/sign-up/confirmation",
  HOME_ADMIN: "/admin",
  FORGOT_PASSWORD: "#",
  HOME_USER: "/",
  NOT_FOUND: "/not-found",
  UNAUTHORIZED: "/unauthorized",
  SACH_BASE: "/sach",
  ACCOUNT_USER_INFO: "/account/info",
  ACCOUNT_USER_CART: "/account/cart",
  ACCOUNT_USER_ORDER: "/account/order",
  ACCOUNT_ADMIN_INFO: "/admin/info",
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
