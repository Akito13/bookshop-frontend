import axios from "axios";
import { AccountEmailConfirmation } from "../types/ConfirmationType";
import { APIURL } from "../utils/Constants";
import {
  ApiResponseSuccess,
  ApiResponseFieldError,
} from "../types/ResponseType";
import { axiosPublic } from "./axios";

export async function sendEmailConfirmationCode(
  confirmData: AccountEmailConfirmation
) {
  try {
    const response = await axiosPublic.post<ApiResponseSuccess<null>>(
      APIURL.MAIL_CONFIRMATION,
      confirmData
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return err.response
        .data as ApiResponseFieldError<AccountEmailConfirmation>;
    }
  }
}
