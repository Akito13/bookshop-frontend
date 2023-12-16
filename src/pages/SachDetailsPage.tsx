import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { useNavigate, useParams } from "react-router-dom";
import { axiosPublic } from "../services/axios";
import {
  ApiResponseFieldError,
  ApiResponseSuccess,
} from "../types/ResponseType";
import { SachType } from "../types/SachType";
import { APIURL, CookieKey, NavigationLink } from "../utils/Constants";
import axios from "axios";
import Image from "mui-image";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorPage from "./exceptions/ErrorPage";
import { TextField, Typography } from "@mui/material";
import formatNumber from "../utils/numberFormatter";
import Header from "../components/Header";
import { SubmitHandler, useForm } from "react-hook-form";
import LoadingButton from "@mui/lab/LoadingButton";
import { CartSach } from "../types/CartType";
import useCookie from "../hooks/useCookie";
import toast from "react-hot-toast";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useQueryClient } from "@tanstack/react-query";

function SachDetails() {
  const params = useParams();
  const [sach, setSach] = useState<SachType>();
  const navigate = useNavigate();
  const [error, setError] = useState<ApiResponseFieldError<SachType>>();
  const [id] = useCookie(CookieKey.ACCOUNT_ID);
  const [authority] = useCookie(CookieKey.AUTHORITY);
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    register,
    formState: { isValid },
  } = useForm<CartSach>({
    shouldFocusError: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  //   const { register, handleSubmit } = useForm<AccountRegistration>();

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    setIsLoading(true);
    axiosPublic
      .get<ApiResponseSuccess<SachType>>(
        `${APIURL.SACH_BASE}/${params.sachId}`,
        { cancelToken: cancelToken.token }
      )
      .then((res) => {
        const sach = res.data;
        const records = sach.payload.records;
        if (records && !("id" in records)) {
          setSach(records[0]);
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response) setError(err.response.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
    return () => {
      cancelToken.cancel();
    };
  }, []);

  const onSubmit: SubmitHandler<CartSach> = async (data, e) => {
    e?.preventDefault();
    setIsLoading(true);
    axiosPrivate
      .post(`${APIURL.CART_BASE}/${id}`, data)
      .then((res) => {
        const data = res.data;
        console.log(data);
        setIsLoading(false);
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
        toast.error(message, { duration: 2.5 * 1000 });
      });
  };

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

  return error ? (
    <ErrorPage code={404} text={error.message} />
  ) : (
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
        <Grid
          sx={{
            backgroundColor: "#fff",
            paddingY: 5,
            maxWidth: "90%",
            border: "1.5px #aba solid",
            borderRadius: 4,
          }}
          margin={"auto"}
          container
          columnSpacing={2}
        >
          {sach ? (
            <>
              <Grid
                item
                xs={5}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Image
                  duration={0}
                  src={sach.anh}
                  style={{ maxWidth: 600, width: "100%" }}
                />
              </Grid>
              <Grid item xs={7}>
                <Typography
                  width={"100%"}
                  sx={{ wordWrap: "break-word", textOverflow: "ellipsis" }}
                  variant="h4"
                >
                  {sach.ten}
                </Typography>
                <Typography
                  width={"100%"}
                  sx={{ wordWrap: "break-word", textOverflow: "ellipsis" }}
                  variant="h6"
                  pt={3}
                >
                  Tác giả: {sach.tacGia}
                </Typography>
                <Typography
                  width={"100%"}
                  sx={{ wordWrap: "break-word", textOverflow: "ellipsis" }}
                  variant="h6"
                  pt={2}
                >
                  Ngày xuất bản: {sach.nxb}
                </Typography>
                <Typography
                  width={"100%"}
                  sx={{ wordWrap: "break-word", textOverflow: "ellipsis" }}
                  variant="h4"
                  pt={2}
                  color="#C92127"
                >
                  Giá:
                  <span
                    style={{
                      fontWeight: "bold",
                      display: "inline-block",
                      margin: "0 15px",
                    }}
                  >
                    {formatNumber(sach.giaSach.giaBan)} đ
                  </span>
                  <span style={{ fontSize: "18px", display: "inline-block" }}>
                    {sach.soLuong && sach.soLuong > 0
                      ? `(Còn lại: ${sach.soLuong})`
                      : null}
                  </span>
                </Typography>
                <Typography paragraph paddingRight={6} pt={2}>
                  <Typography variant="h6">Tóm tắt nội dung</Typography>
                  {sach.moTa}
                </Typography>
                <Box
                  component="form"
                  noValidate
                  onSubmit={handleSubmit(onSubmit)}
                  sx={{
                    mt: 3,
                    display: "flex",
                    alignItems: "baseline",
                    gap: 3,
                  }}
                >
                  <TextField
                    id="soLuong"
                    type="number"
                    label="Số lượng"
                    defaultValue={1}
                    variant="standard"
                    sx={{ mt: 2 }}
                    {...register("soLuong", {
                      valueAsNumber: true,
                      validate: {
                        positive: (v) => !isNaN(v) && v > 0,
                      },
                    })}
                    error={!isValid}
                    helperText={!isValid ? "Phải là số lớn hơn 0" : ""}
                  />
                  {authority === "ROLE_USER" ? (
                    sach.soLuong > 0 ? (
                      <LoadingButton
                        // size="small"
                        type="submit"
                        loading={isLoading}
                        variant="contained"
                        sx={{ mt: 3, mb: 2, ml: 3 }}
                      >
                        <span>Thêm vào giỏ</span>
                      </LoadingButton>
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
                    )
                  ) : null}
                  <TextField
                    required
                    fullWidth
                    id="id"
                    label="id"
                    {...register("id")}
                    value={sach.id}
                    sx={{
                      display: "none",
                    }}
                    hiddenLabel
                  />
                  <TextField
                    required
                    fullWidth
                    id="ten"
                    label="ten"
                    {...register("ten")}
                    value={sach.ten}
                    sx={{
                      display: "none",
                    }}
                    hiddenLabel
                  />
                  <TextField
                    required
                    fullWidth
                    id="anh"
                    label="anh"
                    {...register("anh")}
                    value={sach.anh}
                    sx={{
                      display: "none",
                    }}
                    hiddenLabel
                  />
                  <TextField
                    required
                    fullWidth
                    id="trangThai"
                    label="trangThai"
                    {...register("trangThai")}
                    value={sach.trangThai}
                    sx={{
                      display: "none",
                    }}
                    hiddenLabel
                  />
                  <TextField
                    required
                    fullWidth
                    id="gia"
                    label="gia"
                    {...register("gia")}
                    value={sach.giaSach.giaBan}
                    sx={{
                      display: "none",
                    }}
                    hiddenLabel
                  />
                </Box>
              </Grid>
            </>
          ) : (
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <CircularProgress />
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  );
}

export default SachDetails;
