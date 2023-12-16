import React, { useEffect, useMemo, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { APIURL, CookieKey } from "../../utils/Constants";
import { ApiResponseSuccess } from "../../types/ResponseType";
import { OrderType } from "../../types/OrderType";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import useCookie from "../../hooks/useCookie";
import { GridColDef } from "@mui/x-data-grid/models/colDef";
import { GridValueGetterParams } from "@mui/x-data-grid/models/params";
import formatNumber from "../../utils/numberFormatter";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import { useParams } from "react-router-dom";
import adjustTimeFromUTC from "../../utils/timeAdjustment";

function AdminOrderDetails() {
  const axiosPrivate = useAxiosPrivate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [order, setOrder] = useState<OrderType>();
  const { donhangId } = useParams();
  useEffect(() => {
    setIsLoading(true);
    if (donhangId) {
      axiosPrivate
        .get<ApiResponseSuccess<OrderType>>(
          `${APIURL.ORDER_BASE}/admin/${donhangId}`
        )
        .then((res) => {
          const data = res.data;
          const records = data.payload.records;
          if (records && !("id" in records)) {
            setOrder(records[0]);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => setIsLoading(false));
    }
  }, []);
  // const { donhangId, tenNguoiNhan,trangThai, tongTien } = order as OrderType;
  // const me = orderDetails[0];
  // const { donGia, phanTramGiam, sachId, soLuong, tenSach, tongTien } = me;
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "sachId",
        headerName: "Mã sách",
        align: "center",
        headerAlign: "center",
        sortable: false,
        width: 110,
      },
      {
        field: "tenSach",
        headerName: "Tên sách",
        headerAlign: "center",
        width: 280,
        minWidth: 200,
      },
      {
        field: "donGia",
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
        field: "phanTramGiam",
        headerName: "Giảm",
        hiddable: false,
        align: "center",
        headerAlign: "center",
        type: "number",
        width: 90,
        valueGetter: (params: GridValueGetterParams) => {
          return params.value * 100 + "%";
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
          return formatNumber(
            (params.row.donGia - params.row.donGia * params.row.phanTramGiam) *
              params.row.soLuong
          );
        },
      },
    ],
    []
  );

  return (
    <Box sx={{ backgroundColor: "#f8f6f0", paddingY: 6, paddingX: 3 }}>
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
      {!isLoading && order == null && (
        <Box
          sx={{
            display: "flex",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4" textAlign={"center"} color="error">
            Đơn Hàng Không Tồn Tại
          </Typography>
        </Box>
      )}
      {!isLoading && order && (
        <>
          <Box marginBottom={3} minWidth={350}>
            <Card
              variant="outlined"
              sx={{ width: "50%", margin: "auto", borderRadius: 3, padding: 2 }}
            >
              <CardContent sx={{ minHeight: 190 }}>
                <Typography
                  fontSize={16}
                  gutterBottom
                  component={"div"}
                  display="flex"
                  gap={2}
                >
                  <Typography color="text.secondary" width={120}>
                    Đơn Hàng:
                  </Typography>
                  <Typography>#{order.donhangId}</Typography>
                </Typography>
                <Typography
                  fontSize={16}
                  gutterBottom
                  component={"div"}
                  display="flex"
                  gap={2}
                >
                  <Typography color="text.secondary" width={120}>
                    Người Nhận:
                  </Typography>
                  <Typography>{order.tenNguoiNhan}</Typography>
                </Typography>
                <Typography
                  fontSize={16}
                  gutterBottom
                  component={"div"}
                  display="flex"
                  gap={2}
                >
                  <Typography color="text.secondary" width={120}>
                    SĐT:
                  </Typography>
                  <Typography>{order.sdt}</Typography>
                </Typography>
                <Typography
                  fontSize={16}
                  gutterBottom
                  component={"div"}
                  display="flex"
                  gap={2}
                >
                  <Typography color="text.secondary" width={120} flexShrink={0}>
                    Địa Chỉ:
                  </Typography>
                  <Typography paragraph sx={{ textWrap: "balance" }}>
                    {order.diaChi}
                  </Typography>
                </Typography>
                <Typography
                  fontSize={16}
                  gutterBottom
                  component={"div"}
                  display="flex"
                  gap={2}
                >
                  <Typography color="text.secondary" width={120} flexShrink={0}>
                    Tổng Tiền:
                  </Typography>
                  <Typography paragraph sx={{ textWrap: "balance" }}>
                    {formatNumber(order.tongTien)}đ
                  </Typography>
                </Typography>
                <Typography
                  fontSize={16}
                  gutterBottom
                  component={"div"}
                  display="flex"
                  gap={2}
                >
                  <Typography color="text.secondary" width={120} flexShrink={0}>
                    Thời Gian Đặt:
                  </Typography>
                  <Typography>
                    {adjustTimeFromUTC(order.thoiGianDat, 0)}
                  </Typography>
                </Typography>
                <Typography
                  fontSize={16}
                  gutterBottom
                  component={"div"}
                  display="flex"
                  gap={2}
                >
                  <Typography color="text.secondary" width={120} flexShrink={0}>
                    Thời Gian Xuất:
                  </Typography>
                  {order.thoiGianXuat
                    ? adjustTimeFromUTC(order.thoiGianXuat, 0)
                    : "Chưa có"}
                </Typography>
              </CardContent>
              {/* {order.trangThai.trangThaiId < "D" && (
                <CardActions sx={{ justifyContent: "flex-end", paddingX: 4 }}>
                  <Button size="small" color="error" variant="contained">
                    Hủy đơn
                  </Button>
                </CardActions>
              )} */}
            </Card>
          </Box>
          <Box>
            <DataGrid
              rows={order.orderDetails}
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
              getRowId={(row) => row.sachId}
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
          </Box>
        </>
      )}
    </Box>
  );
}
export default AdminOrderDetails;
