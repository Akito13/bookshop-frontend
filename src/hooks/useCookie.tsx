import React, { useCallback, useState } from "react";
import Cookies from "js-cookie";

export default function useCookie(
  key: string
): [
  any,
  (newValue: any, options: Cookies.CookieAttributes) => void,
  () => void
] {
  const [value, setValue] = useState(() => {
    const cookie = Cookies.get(key);
    return cookie ? cookie : null;
  });

  const setCookieValue = useCallback<
    (newValue: any, options: Cookies.CookieAttributes) => void
  >(
    (newValue: any, options: Cookies.CookieAttributes) => {
      Cookies.set(key, newValue, options);
      setValue(newValue);
    },
    [key]
  );

  const deleteCookie = useCallback(() => {
    Cookies.remove(key);
    setValue(null);
  }, [key]);
  return [value, setCookieValue, deleteCookie];
}
