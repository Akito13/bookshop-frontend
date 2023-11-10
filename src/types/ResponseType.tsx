import { Cart } from "./CartType";

type ApiResponse = {
  statusCode: string;
  message: string;
  timestamp: string;
  apiPath: string;
  // payload?: ApiResponsePayload<T>;
  // errors?: E;
};

export type ApiResponsePayload<T> = {
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

export type ApiCartResponsePayload = {
  id: number;
  sachList: Cart[];
};
