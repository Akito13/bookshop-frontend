import axios from "axios";
import { AccountEmailConfirmation } from "../types/ConfirmationType";
import { APIURL } from "../utils/Constants";
import {
  ApiResponseSuccess,
  ApiResponseFieldError,
} from "../types/ResponseType";

export async function sendEmailConfirmationCode(
  confirmData: AccountEmailConfirmation
) {
  try {
    const response = await axios.post<ApiResponseSuccess<null>>(
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
