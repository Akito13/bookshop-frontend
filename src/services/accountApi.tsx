import { axiosPublic } from "./axios";
import {
  Account,
  AccountRegistration,
  AccountSignIn,
} from "../types/AccountType";
import {
  ApiResponseFieldError,
  ApiResponseSuccess,
  ApiResponseWithHeaders,
} from "../types/ResponseType";
import { APIURL } from "../utils/Constants";
import axios from "axios";

export async function createAccount(newAccount: AccountRegistration) {
  //   const cancelToken = axios.CancelToken.source();
  try {
    const response = await axiosPublic.post<ApiResponseSuccess<Account>>(
      APIURL.ACCOUNT_SIGNUP,
      newAccount
    );
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return err.response.data as ApiResponseFieldError<AccountRegistration>;
    }
  }
}

export async function loginAccount(
  account: AccountSignIn
): Promise<ApiResponseWithHeaders<Account>> {
  try {
    const response = await axiosPublic.post<ApiResponseSuccess<Account>>(
      APIURL.ACCOUNT_SIGNIN,
      account
    );
    // console.log(response.headers["jwttoken"]);
    console.log(response.headers["accountid"]);
    console.log(response.headers["authority"]);
    // console.log(response.headers);
    return { response: response.data, headers: response.headers };
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const response = err.response.data as ApiResponseSuccess<Account>;
      return {
        response,
        headers: null,
      };
    }
    return { response: null, headers: null };
  }
}
