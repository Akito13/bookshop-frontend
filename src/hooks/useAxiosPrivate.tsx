import { useEffect } from "react";
import { axiosPrivate } from "../services/axios";
import { CookieKey } from "../utils/Constants";
import useCookie from "./useCookie";

const useAxiosPrivate = () => {
  const [jwt] = useCookie(CookieKey.JWT);
  useEffect(() => {
    const requestInterceptor = axiosPrivate.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${jwt}`;
        }
        console.log(config);
        return config;
      },
      (error) => Promise.reject(error)
    );
    return () => {
      axiosPrivate.interceptors.request.eject(requestInterceptor);
    };
  }, [jwt]);

  return axiosPrivate;
};
export default useAxiosPrivate;
