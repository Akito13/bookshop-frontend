import { BaseSyntheticEvent, Dispatch, SetStateAction, useState } from "react";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { SachType } from "../types/SachType";
import formatNumber from "../utils/numberFormatter";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { NavLink, Navigate } from "react-router-dom";
import { APIURL, CookieKey, NavigationLink } from "../utils/Constants";
import useCookie from "../hooks/useCookie";
import EditIcon from "@mui/icons-material/BorderColor";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import { axiosPrivate } from "../services/axios";
import toast from "react-hot-toast";
import BasicModal from "./Modal";
import { CartSach } from "../types/CartType";

type SachProps = {
  sach: SachType;
  onAddToCart?: (
    data: CartSach,
    e: BaseSyntheticEvent<object, any, any> | undefined
  ) => Promise<void>;
  handleReset?: Dispatch<SetStateAction<boolean>>;
};

export default function Sach({ sach, handleReset, onAddToCart }: SachProps) {
  const [authority] = useCookie(CookieKey.AUTHORITY);
  const [open, setOpen] = useState(false);

  const handleSachDelete = () => {
    axiosPrivate
      .delete(`${APIURL.SACH_BASE}/${sach.id}`)
      .then((res) => {
        toast.success("Đã xóa thành công");
        if (handleReset) {
          handleReset((prev) => !prev);
        }
        console.log(res);
      })
      .catch((error) => {
        toast.error("Xảy ra lỗi");
        console.log("Lỗi khi xóa sách");
        console.log(error);
      });
  };

  const handleSachRestore = () => {
    axiosPrivate
      .patch(`${APIURL.SACH_BASE}/${sach.id}`)
      .then((res) => {
        toast.success("Khôi phục thành công");
        if (handleReset) {
          handleReset((prev) => !prev);
        }
        console.log(res);
      })
      .catch((error) => {
        toast.error("Xảy ra lỗi");
        console.log("Lỗi khi khôi phục sách");
        console.log(error);
      });
  };

  return (
    <Card
      sx={{
        maxWidth: 225,
        margin: "auto",
        minHeight: 280,
        boxShadow: "0 3px 5px 1px #888",
        borderRadius: 2,
      }}
    >
      <CardMedia
        component="img"
        height="150"
        image={sach.anh}
        alt="Paella dish"
        sx={{
          objectFit: "contain",
        }}
      />
      <CardContent
        sx={{
          padding: "10px 5px 10px 10px",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginTop: 3,
        }}
      >
        <Typography
          color="text.secondary"
          height={20}
          minWidth={200}
          fontSize={14}
        >
          NXB: {sach.nxb}
        </Typography>
        <Typography
          height={30}
          width={"95%"}
          paddingRight={2}
          noWrap
          sx={{
            fontSize: "17px",
            textOverflow: "ellipsis",
          }}
          color="text.secondary"
        >
          {sach.ten}
        </Typography>
        <Typography
          color="#C92127"
          height={20}
          minWidth={200}
          fontSize={18}
          fontWeight={"bold"}
          mt={2}
        >
          {formatNumber(sach.giaSach.giaBan)} đ
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        {authority === "ROLE_ADMIN" ? (
          <>
            <BasicModal
              open={open}
              handleClose={() => setOpen(false)}
              handleConfirm={() => {
                handleSachDelete();
                setOpen(false);
              }}
              content={`Bạn chắc chắn muốn xóa ${sach.ten} ?`}
            />
            {sach.trangThai ? (
              <>
                <IconButton aria-label="Xóa sách" onClick={() => setOpen(true)}>
                  <DeleteIcon color="error" />
                </IconButton>
                <NavLink to={NavigationLink.HOME_ADMIN + `/${sach.id}`}>
                  <IconButton aria-label="Chỉnh sửa sách">
                    <EditIcon color="primary" />
                  </IconButton>
                </NavLink>
              </>
            ) : (
              <>
                <Typography variant="h6">Đã xóa</Typography>
                <IconButton
                  aria-label="Khôi phục sách"
                  onClick={handleSachRestore}
                >
                  <RestoreIcon color="success" />
                </IconButton>
              </>
            )}
          </>
        ) : (
          <>
            {sach.soLuong > 0 ? (
              <IconButton
                aria-label="Thêm vào cart"
                onClick={(e) =>
                  onAddToCart &&
                  onAddToCart(
                    {
                      anh: sach.anh,
                      id: sach.id,
                      soLuong: sach.soLuong,
                      ten: sach.ten,
                      gia:
                        sach.giaSach.giaBan -
                        sach.giaSach.giaBan * sach.giaSach.phanTramGiam,
                      trangThai: sach.trangThai,
                      phanTramGiam: sach.giaSach.phanTramGiam,
                    },
                    e
                  )
                }
              >
                <AddShoppingCartRoundedIcon />
              </IconButton>
            ) : (
              <span
                style={{
                  fontSize: "16px",
                  display: "inline-block",
                  color: "#C92127",
                  textAlign: "center",
                }}
              >
                (Tạm hết hàng)
              </span>
            )}
            <NavLink to={NavigationLink.SACH_BASE + `/${sach.id}`}>
              <IconButton aria-label="Xem chi tiết">
                <InfoOutlinedIcon />
              </IconButton>
            </NavLink>
          </>
        )}
      </CardActions>
    </Card>
  );
}
