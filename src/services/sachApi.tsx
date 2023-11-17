import axios from "axios";
import { SachType } from "../types/SachType";
import { APIURL } from "../utils/Constants";
import { axiosPublic } from "./axios";
import {
  ApiResponseFieldError,
  ApiResponseSuccess,
} from "../types/ResponseType";

export const retrieveRandomSach = async () => {
  try {
    const response = await axiosPublic.get<ApiResponseSuccess<SachType>>(
      APIURL.SACH_RANDOM
    );
    return response.data;
  } catch (error) {
    console.log(error);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as ApiResponseFieldError<SachType>;
    }
  }
};

export const retrieveLoaiByParent = async () => {
  try {
    const response = await axiosPublic.get(`${APIURL.LOAI_BASE}/all`);
    return response.data;
  } catch (error) {
    console.log(`Lỗi truy vấn loại theo parent: ${error}`);
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
  }
};
