import Box from "@mui/material/Box";
import Header from "../components/Header";
import Grid from "@mui/material/Grid";
import LeftSideList from "../components/LeftSideList";
import { useSearchParams } from "react-router-dom";
import React, {
  useEffect,
  useReducer,
  Reducer,
  useState,
  SyntheticEvent,
  BaseSyntheticEvent,
} from "react";
import { axiosPublic } from "../services/axios";
import { APIURL, CookieKey } from "../utils/Constants";
import axios from "axios";
import { ApiResponseSuccess } from "../types/ResponseType";
import { SachType } from "../types/SachType";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import formatNumber from "../utils/numberFormatter";
import Sach from "../components/Sach";
import CircularProgress from "@mui/material/CircularProgress";
import { CustomPagination as Pagination } from "../components/CustomPagination";
import { SelectChangeEvent } from "@mui/material/Select";
import DropdownSelect from "../components/DropdownSelect";
import Button from "@mui/material/Button";
import {
  SachFilterAction,
  SachFilterState,
  addSachQueryParam,
  sachFilterReducer,
} from "../utils/reducerCreateQueryParams";
import { giaMarks } from "./admin/AdminSach";
import useCookie from "../hooks/useCookie";
import { CartSach } from "../types/CartType";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

// type ParamActionNumber = {
//   type: "PAGE" | "PAGE_SIZE" | "GIA";
//   payload: number;
// };

// type ParamActionString = {
//   type: "TEN" | "LOAI" | "SORT_BY" | "DIRECTION";
//   payload: string;
// };

// type ParamActionReset = {
//   type: "RESET";
// };

// type ParamActions = ParamActionNumber | ParamActionString | ParamActionReset;

// type ParamState = {
//   page?: number | null;
//   gia?: number | null;
//   ten?: string | null;
//   loai?: string | null;
//   sortBy?: string | null;
//   direction?: string | null;
// };

// const reducer: Reducer<ParamState, ParamActions> = (state, action) => {
//   switch (action.type) {
//     case "GIA":
//       return { ...state, gia: action.payload, page: 0 };
//     case "LOAI":
//       return { ...state, loai: action.payload, page: 0 };
//     case "TEN":
//       return { ...state, page: 0, ten: action.payload };
//     case "PAGE":
//       if (action.payload < 0) return state;
//       return { ...state, page: action.payload };
//     case "SORT_BY":
//       return { ...state, page: 0, sortBy: action.payload };
//     case "DIRECTION":
//       return { ...state, page: 0, direction: action.payload };
//     case "RESET":
//       return {};
//   }
//   return state;
// };

let initialParamState: SachFilterState;

// function addQueryParams(queryParams: ParamState, queryValues: ParamState) {
//   if (queryValues.gia !== null && queryValues.gia !== undefined) {
//     queryParams.gia = queryValues.gia;
//   }
//   if (queryValues.loai !== null && queryValues.loai !== undefined) {
//     queryParams.loai = queryValues.loai;
//   }
//   if (queryValues.page !== null && queryValues.page !== undefined) {
//     console.log(`Type của page: ${typeof queryValues.gia}`);
//     queryParams.page = queryValues.page >= 0 ? queryValues.page : 0;
//   }
//   if (queryValues.ten !== null && queryValues.ten !== undefined) {
//     queryParams.ten = queryValues.ten;
//   }
//   if (queryValues.sortBy !== null && queryValues.sortBy !== undefined) {
//     queryParams.sortBy = queryValues.sortBy;
//   }
//   if (queryValues.direction !== null && queryValues.direction !== undefined) {
//     queryParams.direction = queryValues.direction;
//   }
//   return queryParams;
// }

function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [id] = useCookie(CookieKey.ACCOUNT_ID);
  const [params, setParams] = useSearchParams();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const paramPageString = params.get("page");
  const paramTen = params.get("ten");
  const paramLoai = params.get("loai");
  const paramGiaString = params.get("gia");
  const paramSortBy = params.get("sb");
  const paramsDirection = params.get("direction");

  const [totalPages, setTotalPages] = useState<number>(0);

  const paramGia =
    paramGiaString != null
      ? isNaN(+paramGiaString) || +paramGiaString < 0
        ? 1000000
        : +paramGiaString
      : null;
  const paramPage =
    paramPageString != null
      ? isNaN(+paramPageString) || +paramPageString < 0
        ? 0
        : +paramPageString
      : null;

  initialParamState = addSachQueryParam(
    {},
    {
      gia: paramGia,
      loai: paramLoai,
      page: paramPage,
      ten: paramTen,
      sortBy: paramSortBy,
      direction: paramsDirection,
    }
  );

  const [state, dispatch] = useReducer<
    Reducer<SachFilterState, SachFilterAction>
  >(sachFilterReducer, initialParamState);
  const [sachList, setSachList] = useState<SachType[]>([]);

  const { gia, loai, page, ten, sortBy, direction } = state;

  useEffect(() => {
    setIsLoading(true);
    const cancelToken = axios.CancelToken.source();
    const params = addSachQueryParam({}, state);
    axiosPublic
      .get<ApiResponseSuccess<SachType>>(`${APIURL.SACH_ALL}/user`, {
        cancelToken: cancelToken.token,
        params,
      })
      .then((res) => {
        console.log(res);
        if (res.data.payload.records && !("id" in res.data.payload.records)) {
          setSachList(res.data.payload.records);
          setTotalPages(res.data.payload.totalPages as number);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
        setParams(state as any);
      });

    return () => {
      cancelToken.cancel();
    };
  }, [gia, loai, page, ten, sortBy, direction]);

  const handleGiaChange = (
    e: Event | SyntheticEvent<Element, Event>,
    value: number | number[]
  ) => {
    if (typeof value === "number") {
      dispatch({ type: "GIA", payload: value });
    }
  };

  const hanleLoaiChange = (maLoai: string) => {
    dispatch({ type: "LOAI", payload: maLoai });
  };

  const handleSearchForm = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      dispatch({ type: "TEN", payload: (e.target as HTMLInputElement).value });
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    value--;
    dispatch({ type: "PAGE", payload: value });
  };

  const handleSortByChange = (event: SelectChangeEvent<string>) => {
    dispatch({ type: "SORT_BY", payload: event.target.value });
  };

  const handleDirectionChange = (event: SelectChangeEvent<string>) => {
    dispatch({ type: "DIRECTION", payload: event.target.value });
  };

  const handleParamsReset = () => {
    dispatch({ type: "RESET" });
  };

  const onSubmit = async (
    data: CartSach,
    e: BaseSyntheticEvent<object, any, any> | undefined
  ) => {
    e?.preventDefault();
    console.log(data);
    if (data.soLuong <= 0) {
      toast.error("Sách tạm hết hàng", { duration: 2.5 * 1000 });
      return;
    }
    const validData = { ...data, soLuong: 1 };
    axiosPrivate
      .post(`${APIURL.CART_BASE}/${id}`, validData)
      .then((res) => {
        const data = res.data;
        console.log(data);
        queryClient.invalidateQueries({ queryKey: ["cartAmount"] });
      })
      .catch((error) => {
        console.log(error);
        let message: string;
        if (error.response.status === 401 || error.response.status === 403) {
          message = "Bạn chưa đăng nhập";
        } else {
          message = "Có lỗi xảy ra";
        }
        setIsLoading(false);
        toast.error(message, { duration: 2 * 1000 });
      });
  };

  return (
    <>
      <Box
        sx={{
          mb: 20,
        }}
      >
        <Header handleSearchForm={handleSearchForm} />
      </Box>
      <Box sx={{ backgroundColor: "#f8f6f0", paddingY: 8 }}>
        <Grid
          sx={{ mb: 20 }}
          container
          style={{
            maxWidth: 1180,
            margin: "auto",
          }}
          spacing={3}
          // paddingLeft={60}
          // paddingRight={45}
        >
          <Grid item xs={3}>
            <Box mb={2}>
              <LeftSideList loaiChangeHandler={hanleLoaiChange} />
            </Box>
            <Box
              sx={{
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid #1976d2",
                maxWidth: "360px",
              }}
            >
              <Box sx={{ width: "100%" }}>
                <Typography
                  sx={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#fff",
                    background: "#1976d2",
                    padding: "10px 16px",
                  }}
                >
                  Giá sách
                </Typography>
              </Box>
              <Box
                paddingRight={6}
                paddingY={2}
                paddingLeft={2}
                sx={{ backgroundColor: "#fff" }}
              >
                <Slider
                  aria-label="Giá sách"
                  defaultValue={1000000}
                  getAriaValueText={(n) => `${n} đồng`}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(n) => `${formatNumber(n)} VNĐ`}
                  step={50000}
                  min={0}
                  max={1000000}
                  marks={giaMarks}
                  onChangeCommitted={handleGiaChange}
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={9}>
            <Box
              sx={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #1976d2",
                overflow: "hidden",
                paddingY: 4,
                width: "100%",
              }}
            >
              <Box
                display={"flex"}
                sx={{
                  justifyContent: "end",
                  paddingX: 5,
                  minWidth: 30,
                  alignItems: "center",
                }}
              >
                <DropdownSelect
                  handleSortByChange={handleSortByChange}
                  labels={["Theo Tên", "Theo Giá", "Theo Số Lượng"]}
                  values={["ten", "gia", "soLuong"]}
                  sortBy={sortBy ? sortBy : "ten"}
                />
                <DropdownSelect
                  handleSortByChange={handleDirectionChange}
                  labels={["Cao đến thấp", "Thấp đến cao"]}
                  values={["desc", "asc"]}
                  sortBy={direction ? direction : "asc"}
                />
                <Button
                  variant="contained"
                  size="medium"
                  sx={{ height: 40, marginLeft: 2 }}
                  onClick={handleParamsReset}
                >
                  Tải lại
                </Button>
              </Box>
              <Grid
                container
                spacing={2}
                rowSpacing={2}
                mt={0}
                ml={0}
                sx={{ height: "100%", padding: "0 30px 80px 0", width: "100%" }}
                columns={{ xs: 6, md: 9, lg: 12 }}
              >
                {isLoading && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  </Grid>
                )}
                {sachList &&
                  sachList.length > 0 &&
                  !isLoading &&
                  sachList.map((sach) => (
                    <Grid item xs={3} md={3} lg={3} key={`${sach.id}-grid`}>
                      <Sach sach={sach} key={sach.id} onAddToCart={onSubmit} />
                    </Grid>
                  ))}
                {(sachList == null || sachList.length <= 0) && !isLoading && (
                  <Grid item xs={12} height={"100%"}>
                    <Box
                      sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="h3" textAlign={"center"}>
                        Không tìm thấy sách phù hợp
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
              {totalPages > 1 && (
                <Pagination
                  totalPages={totalPages}
                  page={page != null ? page + 1 : 1}
                  handlePageChange={handlePageChange}
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default ProductsPage;
