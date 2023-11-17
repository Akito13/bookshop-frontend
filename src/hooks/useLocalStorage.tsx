import { useState } from "react";

const useLocalStorage = (key: string, defaultValue: any) => {
  const [storageValue, setStorageValue] = useState(() => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        return JSON.parse(value);
      }
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    } catch (err) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
  });
  const setStorageStateValue = (valueOrFunc: any) => {
    let newValue;
    if (typeof valueOrFunc === "function") {
      newValue = valueOrFunc(storageValue);
    } else {
      newValue = valueOrFunc;
    }
    localStorage.setItem(key, JSON.stringify(newValue));
    setStorageValue(newValue);
  };
  return [storageValue, setStorageStateValue];
};
export default useLocalStorage;
