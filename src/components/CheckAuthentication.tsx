import React, { PropsWithChildren } from "react";
import useCookie from "../hooks/useCookie";
import { CookieKey } from "../utils/Constants";
import { Outlet } from "react-router-dom";

interface CheckAuthenticationProps extends PropsWithChildren {
  isShowedWhen: boolean;
}

function CheckAuthentication({
  isShowedWhen,
  children,
}: CheckAuthenticationProps) {
  return isShowedWhen && children;
}

export default CheckAuthentication;
