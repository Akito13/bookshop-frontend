import axios from "axios";
import { APIURL } from "../utils/Constants";

export const axiosPrivate = axios.create({
  baseURL: APIURL.BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const axiosPublic = axios.create({
  baseURL: APIURL.BASE_URL,
  headers: { "Content-Type": "application/json" },
});
