import { CartSach } from "./CartType";

type ApiResponse = {
  statusCode: string;
  message: string;
  timestamp: string;
  apiPath: string;
  status?: number;
  // payload?: ApiResponsePayload<T>;
  // errors?: E;
};

type ApiResponsePayload<T> = {
  recordCounts?: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  currentPageSize?: number;
  records?: T[] | ApiCartResponsePayload;
};

type Payload<T> = {
  payload: ApiResponsePayload<T>;
};

type FieldError<T> = {
  errors: T;
};

export type ApiResponseFieldError<T> = ApiResponse & FieldError<T>;

export type ApiResponseSuccess<T> = ApiResponse & Payload<T>;

export type ApiResponseCartSuccess = ApiResponse & ApiCartResponsePayload;

export type ApiResponseWithHeaders<T> = {
  response: ApiResponseSuccess<T> | null;
  headers: any;
};

export type ApiCartResponsePayload = {
  id: number;
  sachList: CartSach[];
};

export type ApiAccountJwtPayload = {
  authority: "ROLE_USER" | "ROLE_ADMIN";
  exp: number;
  iat: number;
  id: number;
  iss: string;
  sub: string;
};
