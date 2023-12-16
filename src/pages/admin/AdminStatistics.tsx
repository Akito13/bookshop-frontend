import { GridColDef, GridValueGetterParams } from "@mui/x-data-grid/models";
import formatNumber from "../../utils/numberFormatter";
import { Reducer, useCallback, useEffect, useReducer, useState } from "react";
import { RevenueType } from "../../types/RevenueType";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import CircularProgress from "@mui/material/CircularProgress";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { ApiResponseSuccess } from "../../types/ResponseType";
import { APIURL } from "../../utils/Constants";
import { useSearchParams } from "react-router-dom";
import axios, { CancelToken } from "axios";
import { CustomPagination as Pagination } from "../../components/CustomPagination";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Typography from "@mui/material/Typography";
import DropdownSelect from "../../components/DropdownSelect";
import { SelectChangeEvent } from "@mui/material/Select";
import { Paper, SxProps, Theme } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

type ParamActionNumber = {
  type: "PAGE";
  payload: number;
};

type ParamActionString = {
  type: "SORT_BY" | "DIRECTION" | "DATE";
  payload: string;
};

type ParamActionReset = {
  type: "RESET";
};

type ParamActions = ParamActionNumber | ParamActionString | ParamActionReset;

type ParamState = {
  page?: number | null;
  // trangThai?: string | null;
  sortBy?: string | null;
  direction?: string | null;
  date?: string | null;
};
const reducer: Reducer<ParamState, ParamActions> = (state, action) => {
  switch (action.type) {
    case "PAGE":
      if (action.payload < 0) return state;
      return { ...state, page: action.payload };
    case "SORT_BY":
      return { ...state, page: 0, sortBy: action.payload };
    case "DIRECTION":
      return { ...state, page: 0, direction: action.payload };
    case "DATE":
      return { ...state, page: 0, date: action.payload };
    // case "TRANG_THAI":
    //   return { ...state, page: 0, trangThai: action.payload };
    // case "TEN_NGUOI_NHAN":
    //   return { ...state, page: 0, tenNguoiNhan: action.payload };
    case "RESET":
      return {};
  }
};

function addQueryParams(queryParams: ParamState, queryValues: ParamState) {
  // if (queryValues.trangThai !== null && queryValues.trangThai !== undefined) {
  //   queryParams.trangThai = queryValues.trangThai;
  // }
  if (queryValues.date !== null && queryValues.page !== undefined) {
    queryParams.date = queryValues.date;
  }
  if (queryValues.page !== null && queryValues.page !== undefined) {
    queryParams.page = queryValues.page >= 0 ? queryValues.page : 0;
  }
  if (queryValues.sortBy !== null && queryValues.sortBy !== undefined) {
    queryParams.sortBy = queryValues.sortBy;
  }
  if (queryValues.direction !== null && queryValues.direction !== undefined) {
    queryParams.direction = queryValues.direction;
  }
  // if (
  //   queryValues.tenNguoiNhan !== null &&
  //   queryValues.tenNguoiNhan !== undefined
  // ) {
  //   queryParams.tenNguoiNhan = queryValues.tenNguoiNhan;
  // }
  return queryParams;
}
let initialParamState: ParamState;

const revenuePaper: SxProps<Theme> = {
  height: 120,
  width: 250,
  borderRadius: 3,
  padding: 2,
};

function AdminStatistics() {
  const axiosPrivate = useAxiosPrivate();
  const [revenues, setRevenues] = useState<RevenueType[]>([]);
  const [totalRevenues, setTotalRevenues] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [params, setParams] = useSearchParams();

  const paramPageString = params.get("page");
  const paramSortBy = params.get("sb");
  const paramsDirection = params.get("direction");
  const paramsDate = params.get("date");

  const [totalPages, setTotalPages] = useState<number>(0);

  const paramPage =
    paramPageString != null
      ? isNaN(+paramPageString) || +paramPageString < 0
        ? 0
        : +paramPageString
      : null;

  initialParamState = addQueryParams(
    {},
    {
      date: paramsDate ? paramsDate : new Date().toISOString().slice(0, -14),
      page: paramPage,
      sortBy: paramSortBy,
      direction: paramsDirection,
    }
  );

  const [state, dispatch] = useReducer<Reducer<ParamState, ParamActions>>(
    reducer,
    initialParamState
  );

  const { direction, page, sortBy, date } = state;
  const fetchOrders = useCallback(
    (cancelToken: CancelToken) => {
      setIsLoading(true);
      const params = addQueryParams({}, state);
      axiosPrivate
        .get<ApiResponseSuccess<RevenueType>>(`${APIURL.STATS_BASE}/day`, {
          cancelToken: cancelToken,
          params,
        })
        .then((res) => {
          const data = res.data;
          const records = data.payload.records;
          if (records && !("id" in records)) {
            console.log("Stats: ", records);
            setRevenues(records);
            setTotalPages(res.data.payload.totalPages as number);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
          setParams(state as any);
        });
    },
    [state]
  );
  const fetchTotalRevenues = useCallback(
    (cancelToken: CancelToken) => {
      const params = addQueryParams({}, state);
      axiosPrivate
        .get<[number[]]>(`${APIURL.STATS_BASE}/day/total`, {
          cancelToken: cancelToken,
          params: { date: params.date },
        })
        .then((res) => {
          console.log("Revenue data: ", res);
          setTotalRevenues(res.data[0]);
          // const data = res.data;
          // const records = data.payload.records;
          // if (records && !("id" in records)) {
          //   console.log("Stats: ", records);
          //   setRevenues(records);
          //   setTotalPages(res.data.payload.totalPages as number);
          // }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    [date]
  );
  useEffect(() => {
    setIsLoading(true);
    const cancelToken = axios.CancelToken.source();
    fetchOrders(cancelToken.token);
    return () => {
      cancelToken.cancel();
    };
  }, [direction, page, sortBy, date]);
  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    fetchTotalRevenues(cancelToken.token);
    return () => {
      cancelToken.cancel();
    };
  }, [date]);
  const columns: GridColDef[] = [
    {
      field: "tenSach",
      headerName: "Tên sách",
      headerAlign: "center",
      width: 280,
      minWidth: 200,
    },
    {
      field: "soLuongBan",
      headerName: "Số Lượng Bán",
      align: "center",
      headerAlign: "center",
      sortable: false,
      width: 150,
    },
    {
      field: "tongTien",
      headerName: "Tổng Tiền",
      type: "number",
      align: "center",
      headerAlign: "center",
      width: 140,
      valueGetter: (params: GridValueGetterParams) => {
        return formatNumber(params.value);
      },
    },
    {
      field: "soDon",
      headerName: "Số Đơn Bán",
      align: "center",
      headerAlign: "center",
      type: "number",
      width: 150,
    },
    {
      field: "donDaHuy",
      headerName: "Số Đơn Hủy",
      align: "center",
      headerAlign: "center",
      type: "number",
      width: 150,
    },
  ];

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

  const handleDateChange = (value: dayjs.Dayjs | null) => {
    if (value) {
      dispatch({ type: "DATE", payload: value.format("YYYY-MM-DD") });
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f8f6f0", paddingY: 6, paddingX: 3 }}>
      <Box
        display={"flex"}
        sx={{
          justifyContent: "end",
          paddingX: 5,
          paddingY: 2,
          marginBottom: 3,
          borderRadius: 3,
          border: "1px solid #aaa",
          minWidth: 30,
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <DropdownSelect
          handleSortByChange={handleSortByChange}
          labels={["Theo Tên", "Theo Số Lượng", "Theo Tổng Tiền"]}
          values={["tenSach", "soLuong", "tongTien"]}
          sortBy={sortBy ? sortBy : "tenSach"}
        />
        <DropdownSelect
          handleSortByChange={handleDirectionChange}
          labels={["Cao đến thấp", "Thấp đến cao"]}
          values={["desc", "asc"]}
          sortBy={direction ? direction : "asc"}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Chọn Thời Gian"
            value={dayjs(date)}
            onChange={(newValue) => handleDateChange(newValue)}
          />
        </LocalizationProvider>
      </Box>
      <Box>
        {!isLoading && revenues.length <= 0 && (
          <Box
            sx={{
              display: "flex",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="h4" textAlign={"center"} color="error">
              Không Tìm Thấy Thông Tin
            </Typography>
          </Box>
        )}
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {!isLoading && revenues.length > 0 && (
          <Box
            sx={{
              display: "flex",
              height: 650,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              width="100%"
              marginBottom={5}
            >
              <Paper variant="outlined" sx={revenuePaper}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="100%"
                  alignItems="center"
                >
                  <Box paddingTop={1}>
                    <Typography
                      color="#fd5722"
                      fontSize="20px"
                      fontWeight="bolder"
                      marginBottom="5px"
                    >
                      {totalRevenues[0] ? totalRevenues[0] : 0}
                    </Typography>
                    <Typography>Tổng Đơn</Typography>
                  </Box>
                  <Box paddingTop={1}>
                    <ReceiptLongIcon sx={{ color: "#fd5722", fontSize: 36 }} />
                  </Box>
                </Box>
              </Paper>
              <Paper variant="outlined" sx={revenuePaper}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="100%"
                  alignItems="center"
                >
                  <Box paddingTop={1}>
                    <Typography
                      color="#009688"
                      fontSize="20px"
                      fontWeight="bolder"
                      marginBottom="5px"
                    >
                      {totalRevenues[1] ? formatNumber(totalRevenues[1]) : 0}
                    </Typography>
                    <Typography>Doanh Thu</Typography>
                  </Box>
                  <Box paddingTop={1}>
                    <TrendingUpIcon sx={{ color: "#009688", fontSize: 36 }} />
                  </Box>
                </Box>
              </Paper>
              <Paper variant="outlined" sx={revenuePaper}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="100%"
                  alignItems="center"
                >
                  <Box paddingTop={1}>
                    <Typography
                      color="#00bbd5"
                      fontSize="20px"
                      fontWeight="bolder"
                      marginBottom="5px"
                    >
                      {totalRevenues[2] ? totalRevenues[2] : 0}
                    </Typography>
                    <Typography>Sách Đã Bán</Typography>
                  </Box>
                  <Box paddingTop={1}>
                    <LibraryBooksIcon sx={{ color: "#00bbd5", fontSize: 36 }} />
                  </Box>
                </Box>
              </Paper>
            </Box>
            <DataGrid
              rows={revenues}
              columns={columns}
              hideFooterSelectedRowCount
              showCellVerticalBorder
              showColumnVerticalBorder
              hideFooter
              disableColumnFilter
              disableColumnMenu
              disableColumnSelector
              disableRowSelectionOnClick
              rowSelection={false}
              getRowId={(row) => row.tenSach}
              sx={{
                backgroundColor: "#fff",
                width: "100%",
                height: 500,
                margin: "auto",
                marginBottom: 3,
                "& .MuiDataGrid-row, & .MuiDataGrid-cell": {
                  maxHeight: "80px !important",
                  minHeight: "80px !important",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  width: "100% !important",
                  fontWeight: "bold !important",
                  fontSize: "18px",
                  // justifyContent: "center !important",
                },
                "& .MuiDataGrid-cell:not([role])": {
                  // width: "0 !important",
                  maxHeight: "80px !important",
                  minHeight: "80px !important",
                },
                "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
                  display: "none !important",
                },
                "& .MuiDataGrid-cellContent": {
                  textWrap: "balance",
                },
              }}
            />
            {totalPages > 1 && (
              <Pagination
                totalPages={totalPages}
                page={page != null ? page + 1 : 1}
                handlePageChange={handlePageChange}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AdminStatistics;
