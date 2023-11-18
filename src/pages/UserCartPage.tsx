import React, { useEffect, useMemo, useState } from "react";
import Header, { CartAmountParam } from "../components/Header";
import { APIURL, CookieKey, NavigationLink } from "../utils/Constants";
import { NavLink, useNavigate } from "react-router-dom";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import {
  QueryFunctionContext,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useCookie from "../hooks/useCookie";
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
  GridRowParams,
  GridRowSelectionModel,
  GridValueGetterParams,
} from "@mui/x-data-grid";
import formatNumber from "../utils/numberFormatter";
import Image from "mui-image";
import toast from "react-hot-toast";

type CartMutationVariablesType = {
  id: number;
  cartSach: CartSach;
};

function UserCartPage() {
  const [rowNums, setRowNums] = useState<GridRowSelectionModel>([]);

  const navigate = useNavigate();
  const [id] = useCookie(CookieKey.ACCOUNT_ID);
  const axiosPrivate = useAxiosPrivate();
  const [sachList, setSachList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>();
  const queryCLient = useQueryClient();

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

  const updateCart = async ({ id, cartSach }: CartMutationVariablesType) => {
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
  };

  const { data, isLoading } = useQuery({
    queryKey: ["getFullCart", +id],
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
      mutateAsync({ id: +id, cartSach: sach })
        .then((res) => {
          queryCLient.invalidateQueries({ queryKey: ["getFullCart"] });
          queryCLient.invalidateQueries({ queryKey: ["cartAmount"] });
          console.log("Res là");
          console.log(res);
          toast.success("Xóa thành công");
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
        width: 150,
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
        width: 200,
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
        width: 400,
        minWidth: 200,
      },
      {
        field: "gia",
        headerName: "Đơn giá",
        hiddable: false,
        type: "number",
        align: "center",
        headerAlign: "center",
        width: 150,
      },
      {
        field: "soLuong",
        headerName: "Số lượng",
        hiddable: false,
        align: "center",
        headerAlign: "center",
        type: "number",
        width: 150,
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
        width: 150,
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
    }
  }, [data]);

  const handleSearchForm = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      navigate(
        {
          pathname: NavigationLink.SACH_BASE,
          search: `?ten=${(e.target as HTMLInputElement).value}`,
        },
        {
          replace: true,
        }
      );
    }
  };

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
        console.log(newRowNums);
        return [...(newRowNums as GridRowId[])];
      });
    } else {
      setRowNums((prev) => {
        let newRowNums = prev?.slice();
        newRowNums?.push(id as unknown as GridRowId);
        console.log(newRowNums);
        return [...(newRowNums as GridRowId[])];
      });
    }
  };

  return (
    <>
      <Header handleSearchForm={handleSearchForm} />
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#f8f6f0",
          minWidth: 500,
          maxWidth: 2880,
          paddingY: 20,
          paddingX: 5,
        }}
      >
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
          <Box sx={{ display: "flex" }}>
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
          <Box sx={{ height: "550px" }}>
            <div
              style={{
                maxHeight: 600,
                width: "100%",
                padding: "20px 30px",
                height: "100%",
                overflow: "visible",
              }}
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
                  width: "80%",
                  height: "100%",
                  margin: "auto",
                  "& .MuiDataGrid-row, & .MuiDataGrid-cell": {
                    maxHeight: "80px !important",
                    minHeight: "80px !important",
                  },
                  " & .MuiDataGrid-columnHeaderTitle": {
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
                }}
              />
            </div>
          </Box>
        )}
      </Box>
    </>
  );
}

export default UserCartPage;
