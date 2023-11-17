import React from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import useCookie from "../hooks/useCookie";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { CookieKey, NavigationLink } from "../utils/Constants";

type RequireAuthProps = {
  allowedAuthority: "ROLE_ADMIN" | "ROLE_USER";
};

function RequireAuth({ allowedAuthority }: RequireAuthProps) {
  const [id] = useCookie(CookieKey.ACCOUNT_ID);
  const [jwt] = useCookie(CookieKey.JWT);
  const [authority] = useCookie(CookieKey.AUTHORITY);
  const location = useLocation();
  console.log(authority);
  return authority && authority === allowedAuthority ? (
    <Outlet />
  ) : id && jwt ? (
    <Navigate
      to={NavigationLink.UNAUTHORIZED}
      state={{ from: location }}
      replace
    />
  ) : (
    <Navigate to={NavigationLink.SIGN_IN} state={{ from: location }} replace />
  );
}

export default RequireAuth;
