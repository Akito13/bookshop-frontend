import axios from "axios";
import { Account, AccountRegistration } from "../types/AccountType";
import {
  ApiResponseFieldError,
  ApiResponseSuccess,
} from "../types/ResponseType";
import { APIURL } from "../utils/Constants";

export async function createAccount(newAccount: AccountRegistration) {
  //   const cancelToken = axios.CancelToken.source();
  try {
    const response = await axios.post<ApiResponseSuccess<Account>>(
      APIURL.ACCOUNT_SIGNUP,
      newAccount
    );
    const apiResponse = response.data;
    return apiResponse;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      //   console.log(
      //     err.response.data as ApiResponseFieldError<AccountRegistration>
      //   );
      return err.response.data as ApiResponseFieldError<AccountRegistration>;
    }
  }
}
