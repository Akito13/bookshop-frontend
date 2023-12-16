import { GridColDef } from "@mui/x-data-grid/models/colDef";
import { GridValueGetterParams } from "@mui/x-data-grid/models/params";
import { Reducer, useEffect, useMemo, useReducer, useState } from "react";
import formatNumber from "../utils/numberFormatter";
import useCookie from "../hooks/useCookie";
import { OrderStatusType, OrderType } from "../types/OrderType";
import { APIURL, CookieKey, NavigationLink } from "../utils/Constants";
import Box from "@mui/material/Box";
import DropdownSelect from "../components/DropdownSelect";
import { ApiResponseSuccess } from "../types/ResponseType";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import Button from "@mui/material/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { CustomPagination as Pagination } from "../components/CustomPagination";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";

type ParamActionNumber = {
  type: "PAGE";
  payload: number;
};

type ParamActionString = {
  type: "TRANG_THAI" | "SORT_BY" | "DIRECTION";
  payload: string;
};

type ParamActionReset = {
  type: "RESET";
};

type ParamActions = ParamActionNumber | ParamActionString | ParamActionReset;

type ParamState = {
  page?: number | null;
  trangThai?: string | null;
  sortBy?: string | null;
  direction?: string | null;
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
    case "TRANG_THAI":
      return { ...state, page: 0, trangThai: action.payload };
    case "RESET":
      return {};
  }
};

function addQueryParams(queryParams: ParamState, queryValues: ParamState) {
  if (queryValues.trangThai !== null && queryValues.trangThai !== undefined) {
    queryParams.trangThai = queryValues.trangThai;
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
  return queryParams;
}

let initialParamState: ParamState;

function UserOrderPage() {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [statuses, setStatuses] = useState<OrderStatusType[]>([]);
  const [id] = useCookie(CookieKey.ACCOUNT_ID);
  const [params, setParams] = useSearchParams();
  const [selectedStatusId, setSelectedStatusId] = useState<string>("A");

  const paramPageString = params.get("page");
  const paramSortBy = params.get("sb");
  const paramsDirection = params.get("direction");
  const paramTrangThai = params.get("tt");

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
      trangThai: paramTrangThai,
      page: paramPage,
      sortBy: paramSortBy,
      direction: paramsDirection,
    }
  );

  const [state, dispatch] = useReducer<Reducer<ParamState, ParamActions>>(
    reducer,
    initialParamState
  );

  const { direction, page, sortBy, trangThai } = state;

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "donhangId",
        headerName: "Mã đơn",
        align: "center",
        headerAlign: "center",
        sortable: false,
        width: 95,
      },
      {
        field: "tenNguoiNhan",
        headerName: "Người nhận",
        headerAlign: "center",
        align: "center",
        width: 250,
        minWidth: 200,
      },
      {
        field: "tenTrangThai",
        headerName: "Trạng thái",
        hiddable: false,
        type: "number",
        align: "center",
        headerAlign: "center",
        width: 250,
        valueGetter: (params: GridValueGetterParams) =>
          params.row.trangThai.tenTrangThai,
      },
      {
        field: "tongTien",
        headerName: "Tổng tiền",
        sortable: false,
        align: "center",
        headerAlign: "center",
        width: 150,
        valueGetter: (params: GridValueGetterParams) => {
          return formatNumber(params.row.tongTien);
        },
      },
      {
        field: "btn",
        headerName: "Thao tác",
        sortable: false,
        align: "center",
        headerAlign: "center",
        width: 100,
        renderCell: (params) => {
          return (
            <>
              <Button
                variant="contained"
                // disabled={!activeRows?.includes(params?.id)}
                // disabled={!rowNums?.includes(params.id)}
                onClick={() =>
                  navigate(
                    `${NavigationLink.ACCOUNT_USER_ORDER}/${params.row.donhangId}`,
                    {
                      replace: true,
                    }
                  )
                }
              >
                Xem
              </Button>
            </>
          );
        },
      },
    ],
    []
  );

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    axiosPrivate
      .get<ApiResponseSuccess<OrderStatusType>>(`${APIURL.ORDER_BASE}/status`, {
        cancelToken: cancelToken.token,
      })
      .then((res) => {
        const data = res.data;
        const records = data.payload.records;
        if (records && !("id" in records)) {
          setStatuses(records);
        }
      });
    return () => {
      cancelToken.cancel();
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const cancelToken = axios.CancelToken.source();
    const params = addQueryParams({}, state);
    axiosPrivate
      .get<ApiResponseSuccess<OrderType>>(`${APIURL.ORDER_BASE}/user/${id}`, {
        cancelToken: cancelToken.token,
        params,
      })
      .then((res) => {
        const data = res.data;
        const records = data.payload.records;
        if (records && !("id" in records)) {
          setOrders(records);
          setTotalPages(data.payload.totalPages as number);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
        setParams(state as any);
      });
    return () => {
      cancelToken.cancel();
    };
  }, [direction, page, sortBy, trangThai]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    value--;
    dispatch({ type: "PAGE", payload: value });
  };

  const handleStatusChange = (selected: OrderStatusType) => {
    dispatch({ type: "TRANG_THAI", payload: selected.trangThaiId });
    setSelectedStatusId(selected.trangThaiId);
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

  return (
    <>
      {statuses.length > 0 && (
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
            labels={["Theo Trạng Thái", "Theo Tổng Tiền"]}
            values={["tt", "tong"]}
            sortBy={sortBy ? sortBy : "tt"}
          />
          <DropdownSelect
            handleSortByChange={handleDirectionChange}
            labels={["Cao đến thấp", "Thấp đến cao"]}
            values={["desc", "asc"]}
            sortBy={direction ? direction : "asc"}
          />
          <FormControl sx={{ minWidth: 260 }}>
            <InputLabel id="status-select-label">Trạng Thái Đơn</InputLabel>
            <Select
              id="status"
              labelId="status-select-label"
              label="Trạng Thái Đơn"
              size="small"
              value={selectedStatusId}
              onChange={(e) => {
                const selectedStatus = statuses.find(
                  (v, i) => v.trangThaiId === e.target.value
                );
                if (selectedStatus) {
                  handleStatusChange(selectedStatus);
                }
              }}
              style={{ marginBottom: 2 }}
            >
              {statuses &&
                statuses.length > 0 &&
                statuses.map((status) => (
                  <MenuItem
                    value={status.trangThaiId}
                    // value={l}
                    key={status.trangThaiId}
                  >
                    {status.tenTrangThai}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            size="medium"
            sx={{ height: 40, marginLeft: 2 }}
            onClick={handleParamsReset}
          >
            Tải lại
          </Button>
        </Box>
      )}
      {!isLoading && orders.length > 0 && (
        <>
          <DataGrid
            rows={orders}
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
            getRowId={(row) => row.donhangId}
            sx={{
              backgroundColor: "#fff",
              width: "100%",
              height: 400,
              margin: "auto",
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
        </>
      )}
      {!isLoading && orders.length <= 0 && (
        <Box
          sx={{
            display: "flex",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4" textAlign={"center"} color="error">
            Không Tìm Thấy
          </Typography>
        </Box>
      )}
    </>
  );
}

export default UserOrderPage;
