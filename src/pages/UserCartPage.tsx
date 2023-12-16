import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CartAmountParam } from "../components/Header";
import { APIURL, NavigationLink } from "../utils/Constants";
import { NavLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import DialogTitle from "@mui/material/DialogTitle";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import {
  QueryFunctionContext,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import axios from "axios";
import {
  ApiResponseFieldError,
  ApiResponseSuccess,
} from "../types/ResponseType";
import { CartSach } from "../types/CartType";
import {
  GridCallbackDetails,
  GridColDef,
  GridRowId,
  GridRowSelectionModel,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import formatNumber from "../utils/numberFormatter";
import Image from "mui-image";
import toast from "react-hot-toast";
import { Account } from "../types/AccountType";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { OrderDetailsType, OrderType } from "../types/OrderType";
import CustomBackDrop from "../components/CustomBackdrop";

type CartMutationVariablesType = {
  id: number;
  cartSach: CartSach;
};

type UserCartPageProps = {
  account: Partial<Account>;
};

type CartRecipientType = {
  ten: string | undefined;
  sdt: string | undefined;
  diaChi: string | undefined;
};

function UserCartPage({ account }: UserCartPageProps) {
  const [rowNums, setRowNums] = useState<GridRowSelectionModel>([]);

  const navigate = useNavigate();
  // const [id] = useCookie(CookieKey.ACCOUNT_ID);
  const axiosPrivate = useAxiosPrivate();
  const [sachList, setSachList] = useState<CartSach[]>([]);
  const [error, setError] = useState<string | null>();
  const queryCLient = useQueryClient();
  const [isOrdering, setIsOrdering] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const { control, handleSubmit, formState, getValues, reset } =
    useForm<CartRecipientType>({
      defaultValues: {
        ten: ((account.hoLot as string) + " " + account.ten) as string,
        sdt: account.sdt ? account.sdt : "",
        diaChi: account.diaChi ? account.diaChi : "",
      },
      values: {
        ten: ((account.hoLot as string) + " " + account.ten) as string,
        sdt: account.sdt ? account.sdt : "",
        diaChi: account.diaChi ? account.diaChi : "",
      },
    });

  const { diaChi, sdt, ten } = getValues();
  const resetRecipientForm = () => reset();
  const getFullCart = async (param: QueryFunctionContext<CartAmountParam>) => {
    const [_, id] = param.queryKey;
    if (id == null || isNaN(+id) || id === 0) return null;
    try {
      const response = await axiosPrivate.get<ApiResponseSuccess<unknown>>(
        `${APIURL.CART_BASE}/${id}`
      );
      console.log(response);
      return response.data;
    } catch (err) {
      // console.log(`Error: ${err}`);
      if (axios.isAxiosError(err) && err.response) {
        return err.response.data as ApiResponseFieldError<unknown>;
      }
      return err;
    }
  };

  const updateCart = useCallback(
    async ({ id, cartSach }: CartMutationVariablesType) => {
      if (id == null || isNaN(+id) || id === 0) return null;
      try {
        const response = await axiosPrivate.post<ApiResponseSuccess<unknown>>(
          `${APIURL.CART_BASE}/${id}`,
          cartSach
        );
        console.log(response);
        return response.data;
      } catch (err) {
        // console.log(`Error: ${err}`);
        if (axios.isAxiosError(err) && err.response) {
          return err.response.data as ApiResponseFieldError<unknown>;
        }
        return err;
      }
    },
    []
  );

  const { data, isLoading } = useQuery({
    queryKey: ["getFullCart", +(account.accountId as number)],
    queryFn: getFullCart,
  });

  const { mutateAsync } = useMutation({
    mutationFn: updateCart,
  });

  const handleActionClick = (sachId: number) => {
    const foundSach = sachList.filter((sach) => sach.id == sachId);
    if (foundSach && foundSach.length > 0) {
      const sach = foundSach[0];
      sach.soLuong = -1;
      mutateAsync({ id: +(account.accountId as number), cartSach: sach })
        .then((res) => {
          queryCLient.invalidateQueries({ queryKey: ["getFullCart"] });
          queryCLient.invalidateQueries({ queryKey: ["cartAmount"] });
          console.log("Res là");
          console.log(res);
          toast.success("Xóa thành công", { duration: 1000 });
        })
        .catch((err) => {
          console.log("Error on cart mutation");
          console.log(err);
        });
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "id",
        headerName: "Mã sách",
        align: "center",
        headerAlign: "center",
        sortable: false,
        width: 100,
        colSpan: ({ row }) => {
          if (row.id === "TONGTIEN") {
            return 3;
          }
          return undefined;
        },
        valueGetter: ({ value, row }) => {
          if (row.id === "TONGTIEN") {
            return row.label;
          }
          return value;
        },
      },
      {
        field: "anh",
        headerName: "Ảnh",
        align: "center",
        headerAlign: "center",
        sortable: false,
        width: 90,
        renderCell: (params) => {
          return (
            <>
              <Image
                src={params.value}
                duration={0}
                style={{ objectFit: "contain", height: "60px" }}
              />
            </>
          );
        },
      },
      {
        field: "ten",
        headerName: "Tên sách",
        headerAlign: "center",
        width: 230,
        minWidth: 200,
      },
      {
        field: "gia",
        headerName: "Đơn giá",
        hiddable: false,
        type: "number",
        align: "center",
        headerAlign: "center",
        width: 110,
      },
      {
        field: "soLuong",
        headerName: "Số lượng",
        hiddable: false,
        align: "center",
        headerAlign: "center",
        type: "number",
        width: 100,
      },
      {
        field: "sum",
        headerName: "Tổng tiền",
        sortable: false,
        align: "center",
        headerAlign: "center",
        width: 150,
        valueGetter: (params: GridValueGetterParams) => {
          if (params.row.id === "TONGTIEN") {
            return formatNumber(params.row.sum);
          }
          return formatNumber(params.row.gia * params.row.soLuong);
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
          if (params.row.id === "TONGTIEN") {
            return undefined;
          }
          return (
            <>
              <Button
                variant="contained"
                // disabled={!activeRows?.includes(params?.id)}
                disabled={!rowNums?.includes(params.id)}
                onClick={() => handleActionClick(params.id as number)}
              >
                Xóa
              </Button>
            </>
          );
        },
      },
    ],
    [rowNums]
  );

  useEffect(() => {
    console.log("Data just changed: ");
    console.log(data);
    if (data != null && !("errors" in data)) {
      const records = data?.payload?.records;
      if (records && "id" in records && records.sachList?.length > 0) {
        const tongTien = {
          id: "TONGTIEN",
          label: "Tổng số tiền",
          sum: records.sachList.reduce(
            (acc: any, current: any) => acc + current.gia * current.soLuong,
            0
          ),
        };
        const sachList = [...records.sachList, tongTien];
        setSachList(sachList);
        setError(null);
      }
    } else if (data != null && data?.payload === null && "errors" in data) {
      setError(data.message);
    } else if (data != null && "errors" in data && data.errors == null) {
      setError(null);
      setSachList([]);
    }
  }, [data]);

  const handleDialogClose = () => setIsOrdering(false);

  const handleRowClick = (
    rowSelectionModel: GridRowSelectionModel,
    details: GridCallbackDetails<any>
  ) => {
    const [id] = [...rowSelectionModel];
    if (rowNums?.includes(id as any)) {
      setRowNums((prev) => {
        const newRowNums = prev?.slice();
        const index = rowNums?.indexOf(id as any);
        if (index !== undefined) newRowNums?.splice(index, 1);
        return [...(newRowNums as GridRowId[])];
      });
    } else {
      setRowNums((prev) => {
        let newRowNums = prev?.slice();
        newRowNums?.push(id as unknown as GridRowId);
        return [...(newRowNums as GridRowId[])];
      });
    }
  };

  const onSubmit: SubmitHandler<CartRecipientType> = (data, e) => {
    e?.preventDefault();
    setOpenBackdrop(true);
    handleDialogClose();
    const orderDetails: OrderDetailsType[] = sachList.map((s) => {
      return {
        donGia: s.gia,
        phanTramGiam: s.phanTramGiam,
        sachId: s.id,
        soLuong: s.soLuong,
        tenSach: s.ten,
        tongTien: s.soLuong * s.gia,
      };
    });
    orderDetails.pop();
    const order: Partial<OrderType> = {
      diaChi: data.diaChi,
      tenNguoiNhan: data.ten,
      nguoiDungId: account.accountId,
      sdt: data.sdt,
      thoiGianDat: new Date().toISOString().slice(0, -1),
      // trangThai: "A",
      tongTien: orderDetails.reduce((sum, curr) => sum + curr.tongTien, 0),
      orderDetails: orderDetails,
    };
    navigate(`${NavigationLink.ACCOUNT_USER_PAYMENT}`, {
      replace: true,
      state: { order: order },
    });
    // axiosPrivate
    //   .post<number>(APIURL.ORDER_CREATE, order)
    //   .then((res) => {
    //     toast.success("Đặt hàng thành công");
    //     const orderId = res.data;
    //     axiosPrivate
    //       .delete(`${APIURL.CART_BASE}/${account.accountId}`)
    //       .then((res) => {
    //         queryCLient.invalidateQueries({ queryKey: ["cartAmount"] });
    //         navigate(`${NavigationLink.ACCOUNT_USER_ORDER}/${orderId}`, {
    //           replace: true,
    //         });
    //       })
    //       .catch((err) => console.log(err));
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     if (err.response && err.response.data) {
    //       const data = err.response.data;
    //       toast.error(data.message ? data.message : "Có lỗi xảy ra", {
    //         duration: 2 * 1000,
    //       });
    //     }
    //   })
    //   .finally(() => setOpenBackdrop(false));
  };

  return (
    <>
      {/* <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#f8f6f0",
          minWidth: 500,
          maxWidth: 2880,
          paddingY: 20,
          paddingX: 5,
        }}
      > */}
      {error != null && !isLoading && (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h3" textAlign={"center"}>
            {error}
          </Typography>
        </Box>
      )}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {sachList.length <= 0 && !isLoading && error == null && (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 5,
          }}
        >
          <Typography
            variant="h3"
            textAlign={"center"}
            style={{ marginBottom: 20 }}
          >
            Giỏ hàng rỗng
          </Typography>
          <NavLink
            to={NavigationLink.SACH_BASE}
            replace
            style={{ textDecoration: "none", color: "#fff" }}
          >
            <Button variant="contained">Đặt hàng thôi!</Button>
          </NavLink>
        </Box>
      )}
      {sachList.length > 0 && (
        <Box
          sx={
            {
              // height: "400px",
            }
          }
        >
          <DataGrid
            rows={sachList}
            columns={columns}
            hideFooterSelectedRowCount
            showCellVerticalBorder
            showColumnVerticalBorder
            hideFooter
            disableColumnFilter
            disableColumnMenu
            disableColumnSelector
            // onRowClick={handleRowClick}
            onRowSelectionModelChange={handleRowClick}
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
          <Box display={"flex"} justifyContent={"flex-end"} mt={3}>
            <Button variant="contained" onClick={() => setIsOrdering(true)}>
              Đặt hàng
            </Button>
          </Box>
          <Dialog open={isOrdering}>
            <DialogTitle>Thông Tin Người Nhận</DialogTitle>
            <DialogContent>
              <DialogContentText mb={3}>
                Vui lòng xác nhận thông tin người nhận bên dưới
              </DialogContentText>
              <Controller
                name="ten"
                control={control}
                defaultValue={ten}
                rules={{
                  minLength: { value: 2, message: "Tối thiểu 2 ký tự" },
                  required: { value: true, message: "Tối thiểu 2 ký tự" },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    id="ten"
                    label="Họ và Tên"
                    type="text"
                    fullWidth
                    variant="standard"
                    InputLabelProps={{ shrink: true }}
                    error={error ? true : false}
                    helperText={error ? error.message : " "}
                  />
                )}
              />
              <Controller
                name="sdt"
                control={control}
                defaultValue={sdt}
                rules={{
                  required: {
                    value: true,
                    message: "Chưa điền SĐT",
                  },
                  pattern: {
                    value: /^0(\d){9,10}$/g,
                    message: "Số không hợp lệ",
                  },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    id="sdt"
                    label="Số Điện Thoại"
                    type="text"
                    fullWidth
                    variant="standard"
                    InputLabelProps={{ shrink: true }}
                    error={error ? true : false}
                    helperText={error ? error.message : " "}
                  />
                )}
              />
              <Controller
                name="diaChi"
                control={control}
                defaultValue={diaChi}
                rules={{
                  minLength: { value: 10, message: "Tối thiểu 10 ký tự" },
                  required: { value: true, message: "Tối thiểu 10 ký tự" },
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    id="sdt"
                    label="Địa chỉ"
                    type="text"
                    multiline
                    maxRows={2}
                    spellCheck={"false"}
                    fullWidth
                    variant="standard"
                    InputLabelProps={{ shrink: true }}
                    error={error ? true : false}
                    helperText={error ? error.message : " "}
                  />
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleDialogClose}
                variant="contained"
                color="error"
              >
                Hủy
              </Button>
              <Button onClick={resetRecipientForm} variant="contained">
                Tải lại
              </Button>
              <Button
                variant="contained"
                disabled={!formState.isValid}
                color="success"
                onClick={handleSubmit(onSubmit)}
              >
                Xác nhận
              </Button>
            </DialogActions>
          </Dialog>
          <CustomBackDrop isLoading={openBackdrop} />
        </Box>
      )}
    </>
  );
}

export default UserCartPage;
