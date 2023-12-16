import React, { ChangeEvent, useCallback } from "react";
import { GridColDef } from "@mui/x-data-grid/models/colDef";
import {
  GridRowEditStopReasons,
  GridValueGetterParams,
} from "@mui/x-data-grid/models/params";
import { Reducer, useEffect, useReducer, useState } from "react";
import formatNumber from "../../utils/numberFormatter";
// import useCookie from "../../hooks/useCookie";
import { OrderStatusType, OrderType } from "../../types/OrderType";
import { APIURL, NavigationLink } from "../../utils/Constants";
import Box from "@mui/material/Box";
import DropdownSelect from "../../components/DropdownSelect";
import { ApiResponseSuccess } from "../../types/ResponseType";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import Button from "@mui/material/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios, { CancelToken } from "axios";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { CustomPagination as Pagination } from "../../components/CustomPagination";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import CustomBackDrop from "../../components/CustomBackdrop";
import {
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowModes,
  GridRowModesModel,
} from "@mui/x-data-grid";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/BorderColor";
import toast from "react-hot-toast";

type ParamActionNumber = {
  type: "PAGE";
  payload: number;
};

type ParamActionString = {
  type: "TRANG_THAI" | "SORT_BY" | "DIRECTION" | "TEN_NGUOI_NHAN";
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
  tenNguoiNhan?: string | null;
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
    case "TEN_NGUOI_NHAN":
      return { ...state, page: 0, tenNguoiNhan: action.payload };
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
  if (
    queryValues.tenNguoiNhan !== null &&
    queryValues.tenNguoiNhan !== undefined
  ) {
    queryParams.tenNguoiNhan = queryValues.tenNguoiNhan;
  }
  return queryParams;
}

let initialParamState: ParamState;

function AdminOrder() {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [statuses, setStatuses] = useState<OrderStatusType[]>([]);
  // const [id] = useCookie(CookieKey.ACCOUNT_ID);
  const [params, setParams] = useSearchParams();
  const [selectedStatusId, setSelectedStatusId] = useState<string>("A");

  const paramPageString = params.get("page");
  const paramSortBy = params.get("sb");
  const paramsDirection = params.get("direction");
  const paramTrangThai = params.get("tt");
  const paramTenNguoiNhan = params.get("nn");

  const [totalPages, setTotalPages] = useState<number>(0);

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

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
      tenNguoiNhan: paramTenNguoiNhan,
    }
  );

  const [state, dispatch] = useReducer<Reducer<ParamState, ParamActions>>(
    reducer,
    initialParamState
  );

  const { direction, page, sortBy, trangThai, tenNguoiNhan } = state;

  const handleEditClick = (id: GridRowId) => {
    setRowModesModel((prev) => {
      return { ...prev, [id]: { mode: GridRowModes.Edit } };
    });
  };

  const handleSaveClick = (id: GridRowId) => {
    setRowModesModel((prev) => {
      return { ...prev, [id]: { mode: GridRowModes.View } };
    });
  };

  const handleCancelClick = (id: GridRowId) => {
    setRowModesModel((prev) => {
      return {
        ...prev,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      };
    });
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    editParams,
    event
  ) => {
    if (editParams.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = useCallback(
    async (newRow: GridRowModel, oldRow: GridRowModel) => {
      const updatedRow = { ...newRow };
      // console.log(oldRow);
      if (newRow.trangThaiId !== newRow.trangThai.trangThaiId) {
        const res = await axiosPrivate.put<ApiResponseSuccess<OrderType>>(
          `${APIURL.ORDER_BASE}/admin/${newRow.donhangId}`,
          null,
          { params: { trangThaiId: newRow.trangThaiId } }
        );
        const updatedOrders = res.data.payload.records;
        if (updatedOrders && !("id" in updatedOrders)) {
          setOrders((prev) => {
            const newOrders = prev.filter(
              (o) => o.donhangId !== updatedOrders[0].donhangId
            );
            newOrders.push(updatedOrders[0]);
            return newOrders;
          });
          toast.success("Cập nhật thành công", { duration: 1 * 1000 });
          return updatedOrders[0];
        }
      }
      return updatedRow;
    },
    []
  );

  const handleProcessRowUpdateError = (err: Error) => {
    if (axios.isAxiosError(err)) {
      const errorData = err.response?.data;
      if (errorData && "message" in errorData) {
        toast.error(errorData.message, { duration: 2 * 1000 });
      } else {
        toast.error("Xảy ra lỗi");
      }
    }
    console.log(err);
  };

  const columns: GridColDef[] = [
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
      field: "trangThaiId",
      headerName: "Trạng thái",
      editable: true,
      type: "singleSelect",
      align: "center",
      headerAlign: "center",
      width: 250,
      getOptionValue: (value: any) => value.trangThaiId,
      getOptionLabel: (value: any) => value.tenTrangThai,
      // getOptionValue: (value: OrderStatusType) => value?.trangThaiId,
      // getOptionLabel: (value: OrderStatusType) => value?.tenTrangThai,
      valueOptions: ({ row }) => {
        if (row) {
          return statuses?.filter(
            (status) =>
              status.trangThaiId >= row.trangThai.trangThaiId &&
              status.trangThaiId !== "G"
          );
        }
        return statuses;
      },
      valueGetter: (params: GridValueGetterParams) => {
        if (params.row.trangThai.trangThaiId === "G")
          return params.row.trangThai.tenTrangThai;
        return params.row.trangThai.trangThaiId;
      },
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
      type: "actions",
      width: 210,
      colSpan: 2,
      cellClassName: "actions",
      getActions: ({ id, row }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        const isCanceled = row.trangThai?.trangThaiId === "G";
        if (isInEditMode && !isCanceled) {
          return [
            <GridActionsCellItem
              label="Lưu"
              icon={<SaveIcon />}
              onClick={() => handleSaveClick(id)}
              sx={{ color: "inherit" }}
            />,
            <GridActionsCellItem
              label="Hủy"
              icon={<CancelIcon />}
              onClick={() => handleCancelClick(id)}
              sx={{ color: "inherit" }}
            />,
          ];
        }
        const gridActionsCellItems = !isCanceled
          ? [
              <GridActionsCellItem
                label="Sửa"
                icon={<EditIcon fontSize="inherit" />}
                onClick={() => handleEditClick(id)}
                size="large"
                sx={{ color: "inherit" }}
              />,
              <GridActionsCellItem
                label="Xem"
                icon={<InfoIcon fontSize="inherit" />}
                sx={{ color: "inherit", fontSize: "28px !important" }}
                onClick={() =>
                  navigate(`${NavigationLink.ADMIN_ORDER}/${row.donhangId}`, {
                    replace: true,
                  })
                }
              />,
            ]
          : [
              <GridActionsCellItem
                label="Xem"
                icon={<InfoIcon fontSize="inherit" />}
                sx={{ color: "inherit", fontSize: "28px !important" }}
                onClick={() =>
                  navigate(`${NavigationLink.ADMIN_ORDER}/${row.donhangId}`, {
                    replace: true,
                  })
                }
              />,
            ];
        return gridActionsCellItems;
      },
    },
  ];

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

  const fetchOrders = useCallback(
    (cancelToken: CancelToken) => {
      setIsLoading(true);
      const params = addQueryParams({}, state);
      axiosPrivate
        .get<ApiResponseSuccess<OrderType>>(`${APIURL.ORDER_BASE}/admin`, {
          cancelToken: cancelToken,
          params,
        })
        .then((res) => {
          const data = res.data;
          const records = data.payload.records;
          if (records && !("id" in records)) {
            setOrders(records);
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

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    fetchOrders(cancelToken.token);
    return () => {
      cancelToken.cancel();
    };
  }, [direction, page, sortBy, trangThai]);

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    const timeoutKey = setTimeout(() => fetchOrders(cancelToken.token), 800);
    return () => {
      cancelToken.cancel();
      clearTimeout(timeoutKey);
    };
  }, [tenNguoiNhan]);

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

  const handleTenChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // if (event.key === "Enter") {
    dispatch({
      type: "TEN_NGUOI_NHAN",
      payload: (event.target as HTMLInputElement).value,
    });
    // }
  };

  const handleParamsReset = () => {
    dispatch({ type: "RESET" });
    setSelectedStatusId("A");
  };
  console.log(tenNguoiNhan);

  return (
    <Box sx={{ backgroundColor: "#f8f6f0", paddingY: 6, paddingX: 3 }}>
      {isLoading && <CustomBackDrop isLoading={isLoading} />}
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
          <TextField
            id="search-recipient"
            type="text"
            label="Tìm tên người nhận"
            variant="outlined"
            name="ten"
            value={state.tenNguoiNhan}
            // defaultValue={tenNguoiNhan}
            // onKeyDown={handleTenChange}
            onChange={handleTenChange}
            size="small"
          />
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
      <Box
        sx={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!isLoading && orders.length <= 0 && (
          <Typography variant="h4" textAlign={"center"} color="error">
            Không Tìm Thấy
          </Typography>
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
              editMode="row"
              rowModesModel={rowModesModel}
              onRowEditStop={handleRowEditStop}
              onRowModesModelChange={handleRowModesModelChange}
              processRowUpdate={processRowUpdate}
              onProcessRowUpdateError={handleProcessRowUpdateError}
              rowSelection={false}
              getRowId={(row) => row.donhangId}
              sx={{
                backgroundColor: "#fff",
                width: "100%",
                height: 400,
                margin: "auto",
                marginBottom: 3,
                // "& .MuiDataGrid-row, & .MuiDataGrid-cell": {
                //   maxHeight: "80px !important",
                //   minHeight: "80px !important",
                // },
                "& .MuiDataGrid-columnHeaderTitle": {
                  width: "100% !important",
                  fontWeight: "bold !important",
                  fontSize: "18px",
                  // justifyContent: "center !important",
                },
                // "& .MuiDataGrid-cell:not([role])": {
                //   // width: "0 !important",
                //   maxHeight: "80px !important",
                //   minHeight: "80px !important",
                // },
                "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
                  display: "none !important",
                },
                "& .MuiDataGrid-cellContent": {
                  textWrap: "balance",
                },
                "& .actions": {
                  color: "#1976d2",
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
      </Box>
    </Box>
  );
}

export default AdminOrder;
