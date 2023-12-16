import { Reducer } from "react";

export type SachFilterState = {
  page?: number | null;
  gia?: number | null;
  ten?: string | null;
  loai?: string | null;
  sortBy?: string | null;
  direction?: string | null;
  trangThai?: boolean | null;
};

type SachFilterActionNumber = {
  type: "PAGE" | "PAGE_SIZE" | "GIA";
  payload: number;
};

type SachFilterActionString = {
  type: "TEN" | "LOAI" | "SORT_BY" | "DIRECTION";
  payload: string;
};

type SachFilterActionBoolean = {
  type: "TRANG_THAI";
  payload: boolean;
};

type SachFilterActionReset = {
  type: "RESET";
};

export type SachFilterAction =
  | SachFilterActionNumber
  | SachFilterActionString
  | SachFilterActionReset
  | SachFilterActionBoolean;

export function addSachQueryParam(
  queryParams: SachFilterState,
  queryValues: SachFilterState
) {
  if (queryValues.gia !== null && queryValues.gia !== undefined) {
    queryParams.gia = queryValues.gia;
  }
  if (queryValues.loai !== null && queryValues.loai !== undefined) {
    queryParams.loai = queryValues.loai;
  }
  if (queryValues.page !== null && queryValues.page !== undefined) {
    console.log(`Type của page: ${typeof queryValues.gia}`);
    queryParams.page = queryValues.page >= 0 ? queryValues.page : 0;
  }
  if (queryValues.ten !== null && queryValues.ten !== undefined) {
    queryParams.ten = queryValues.ten;
  }
  if (queryValues.sortBy !== null && queryValues.sortBy !== undefined) {
    queryParams.sortBy = queryValues.sortBy;
  }
  if (queryValues.direction !== null && queryValues.direction !== undefined) {
    queryParams.direction = queryValues.direction;
  }
  return queryParams;
}

const sachFilterReducer: Reducer<SachFilterState, SachFilterAction> = (
  state,
  action
) => {
  switch (action.type) {
    case "GIA":
      return { ...state, gia: action.payload, page: 0 };
    case "LOAI":
      return { ...state, loai: action.payload, page: 0 };
    case "TEN":
      return { ...state, page: 0, ten: action.payload };
    case "PAGE":
      if (action.payload < 0) return state;
      return { ...state, page: action.payload };
    case "SORT_BY":
      return { ...state, page: 0, sortBy: action.payload };
    case "DIRECTION":
      return { ...state, page: 0, direction: action.payload };
    case "TRANG_THAI":
      return { ...state, page: 0, trangThai: action.payload };
    case "RESET":
      return {};
  }
  return state;
};

export { sachFilterReducer };
