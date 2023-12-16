import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { axiosPublic } from "../../services/axios";
import {
  ApiResponseFieldError,
  ApiResponseSuccess,
} from "../../types/ResponseType";
import { Loai, SachType } from "../../types/SachType";
import { APIURL, NavigationLink } from "../../utils/Constants";
import axios, { CancelToken, CancelTokenSource } from "axios";
import Image from "mui-image";
import CircularProgress from "@mui/material/CircularProgress";
import ErrorPage from "../exceptions/ErrorPage";
import {
  Button,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import LoadingButton from "@mui/lab/LoadingButton";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import EditIcon from "@mui/icons-material/BorderColor";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { DateField } from "@mui/x-date-pickers";

function AdminSachDetails() {
  const params = useParams();

  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loaiList, setLoaiList] = useState<Loai[]>([]);
  const axiosPrivate = useAxiosPrivate();

  const fetchSachDetails = useCallback(async (token?: CancelToken) => {
    try {
      const res = await axiosPrivate.get<ApiResponseSuccess<SachType>>(
        `${APIURL.SACH_BASE}/${params.sachId}`,
        { cancelToken: token }
      );
      const responseData = res.data;
      const records = responseData.payload.records;
      if (records && !("id" in records)) {
        return records[0];
      }
      console.log("Lỗi gì đó");
      console.log(responseData);
      throw new Error("Có lỗi xảy ra");
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.log(err);
      }
      // if (err) setError(err.response.data);
      return Promise.reject(err);
    }
  }, []);

  const fetchLoai = useCallback(async (token?: CancelToken) => {
    try {
      const res = await axiosPublic.get<ApiResponseSuccess<Loai>>(
        `${APIURL.LOAI_BASE}/allNonGrouping`,
        { cancelToken: token }
      );
      const responseData = res.data;
      const records = responseData.payload.records;
      if (records && !("id" in records)) {
        return records;
      }
      console.log("Lỗi gì đó");
      console.log(responseData);
      throw new Error("Có lỗi xảy ra");
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.log(error);
      }
      return Promise.reject(error);
    }
  }, []);

  const {
    handleSubmit,
    formState,
    control,
    reset,
    getValues,
    formState: { isSubmitSuccessful },
  } = useForm<SachType>({
    shouldFocusError: true,
    defaultValues: {
      id: 0,
      ten: "",
      anh: "",
      giaSach: {
        giaBan: 0,
        giaGoc: 0,
        phanTramGiam: 0,
        thoiGian: { endTime: "", startTime: "" },
      },
      loaiDto: { ma: "", parent: "", ten: "" },
      moTa: "",
      nxb: "",
      soLuong: 0,
      tacGia: "",
      trangThai: false,
    },
  });

  const toggleEditMode = () => setIsEditing((prev) => !prev);
  const cancelChange = () => {
    toggleEditMode();
    reset();
  };
  const sach = getValues();

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    setIsLoading(true);
    fetchLoai(cancelToken.token)
      .then((data) => setLoaiList(data))
      .catch((err) => {
        if (!axios.isCancel(err)) {
          console.log("Lỗi fetch Thể loại sách");
          console.log(err);
        }
      });
    fetchSachDetails(cancelToken.token)
      .then((data) => {
        reset(data);
        setError(false);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          toast.error("Xảy ra lỗi tải chi tiết sách", { duration: 1000 });
          if ("response" in err && "data" in err.response) {
            if (err.response.data.message == "Sách không có") {
              setError(true);
            }
          }
        }
      })
      .finally(() => setIsLoading(false));
    return () => {
      cancelToken.cancel();
    };
  }, []);

  useEffect(() => {
    let cancelToken: CancelTokenSource | null = null;
    if (formState.isSubmitSuccessful) {
      setIsLoading(true);
      cancelToken = axios.CancelToken.source();
      fetchSachDetails(cancelToken.token)
        .then((data) => {
          reset(data);
          setError(false);
        })
        .catch((err) => {
          if (!axios.isCancel(err)) {
            toast.error("Xảy ra lỗi tải chi tiết sách", { duration: 1000 });
            if ("response" in err && "data" in err.response) {
              if (err.response.data.message == "Sách không có") {
                setError(true);
              }
            }
          }
        })
        .finally(() => setIsLoading(false));
    }
    return () => {
      if (cancelToken) {
        cancelToken.cancel();
      }
    };
  }, [formState, isSubmitSuccessful, reset]);

  const onSubmit: SubmitHandler<SachType> = async (data, e) => {
    e?.preventDefault();
    console.log(data);
    setIsLoading(true);
    axiosPrivate
      .put<ApiResponseSuccess<SachType>>(`${APIURL.SACH_BASE}/${data.id}`, data)
      .then((res) => {
        const data = res.data.payload.records;
        if (data && !("id" in data)) {
          reset(data[0]);
        }
        // setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        // let message: string;
        // if (error.response.status === 401 || error.response.status === 403) {
        //   message = "Bạn cần đăng nhập";
        // } else {
        //   message = "Có lỗi xảy ra";
        // }
        toast.error("Có lỗi xảy ra", { duration: 1.5 * 1000 });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: "#f8f6f0",
        minWidth: 500,
        maxWidth: 2880,
        paddingY: 10,
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
          height: error ? "200px" : "680px",
        }}
        margin={"auto"}
        container
        columnSpacing={2}
      >
        {/* {isLoading && (
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Grid>
        )} */}
        {sach && !error ? (
          <>
            <Grid
              item
              xs={5}
              sx={{
                display: "flex",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <Image
                duration={0}
                src={sach.anh}
                style={{ objectFit: "contain" }}
              />
            </Grid>
            <Grid item xs={7} paddingRight={5} sx={{ height: "100%" }}>
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                sx={{ mt: 3 }}
              >
                <Box display={"flex"} justifyContent={"space-between"}>
                  <Controller
                    control={control}
                    name="id"
                    defaultValue={sach.id}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        id="id"
                        label="Sách Id"
                        variant="standard"
                        {...field}
                        InputProps={{
                          readOnly: true,
                          disableUnderline: true,
                        }}
                        style={{ marginBottom: 2 }}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                  {!isEditing && sach.trangThai && (
                    <Button
                      variant="contained"
                      endIcon={<EditIcon />}
                      size="medium"
                      style={{ height: "50%" }}
                      onClick={toggleEditMode}
                    >
                      Sửa
                    </Button>
                  )}
                  {!sach.trangThai && (
                    <Typography
                      variant="h5"
                      color={"error"}
                      width={"50%"}
                      alignSelf={"center"}
                      fontWeight={"bold"}
                    >
                      Đã Xóa
                    </Typography>
                  )}
                </Box>
                <Controller
                  control={control}
                  name="ten"
                  defaultValue={sach.ten}
                  rules={{
                    minLength: { value: 1, message: "Tối thiểu 1 ký tự" },
                    required: { value: true, message: "Tối thiểu 1 ký tự" },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      fullWidth
                      id="id"
                      label="Tên sách"
                      variant="standard"
                      {...field}
                      {...(!isEditing
                        ? {
                            InputProps: {
                              readOnly: true,
                              disableUnderline: true,
                            },
                          }
                        : null)}
                      style={{ marginBottom: 2 }}
                      InputLabelProps={{ shrink: true }}
                      error={error ? true : false}
                      helperText={error ? error.message : " "}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="loaiDto"
                  defaultValue={sach.loaiDto}
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <>
                      <InputLabel
                        sx={{ fontSize: "0.8rem" }}
                        id="loai-select-label"
                      >
                        Thể loại sách
                      </InputLabel>
                      <Select
                        fullWidth
                        id="loaiDto"
                        labelId="loai-select-label"
                        label="Thể loại sách"
                        variant="standard"
                        {...field}
                        disabled={isEditing ? false : true}
                        value={value.ma}
                        onChange={(e) => {
                          const selectedLoai = loaiList.find(
                            (v, i) => v.ma === e.target.value
                          );
                          if (selectedLoai) {
                            onChange(selectedLoai);
                          }
                        }}
                        style={{ marginBottom: 2 }}
                      >
                        {loaiList &&
                          loaiList.length > 0 &&
                          loaiList.map((l) => (
                            <MenuItem
                              value={l.ma}
                              // value={l}
                              key={l.ma}
                            >
                              {l.ten}
                            </MenuItem>
                          ))}
                      </Select>
                      <FormHelperText> </FormHelperText>
                    </>
                  )}
                />
                <Controller
                  control={control}
                  name="tacGia"
                  rules={{
                    minLength: { value: 1, message: "Tối thiểu 1 ký tự" },
                    required: { value: true, message: "Tối thiểu 1 ký tự" },
                  }}
                  defaultValue={sach.tacGia}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      fullWidth
                      id="tacGia"
                      label="Tác giả"
                      variant="standard"
                      {...field}
                      {...(!isEditing
                        ? {
                            InputProps: {
                              readOnly: true,
                              disableUnderline: true,
                            },
                          }
                        : null)}
                      style={{ marginBottom: 2 }}
                      InputLabelProps={{ shrink: true }}
                      error={error ? true : false}
                      helperText={error ? error.message : " "}
                    />
                  )}
                />
                <Box display={"flex"}>
                  <Controller
                    control={control}
                    name="giaSach.giaGoc"
                    defaultValue={sach.giaSach.giaGoc}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        fullWidth
                        id="giaNhap"
                        type="number"
                        label="Giá nhập"
                        variant="standard"
                        {...field}
                        style={{ marginBottom: 2 }}
                        InputProps={{
                          readOnly: true,
                          disableUnderline: true,
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="giaSach.giaBan"
                    defaultValue={sach.giaSach.giaBan}
                    rules={{
                      validate: (v) =>
                        (!isNaN(v) && v > sach.giaSach.giaGoc) ||
                        "Phải lớn hơn giá nhập",
                    }}
                    render={({
                      field: { onChange, ...field },
                      fieldState: { error },
                    }) => (
                      <TextField
                        fullWidth
                        id="gia"
                        type="number"
                        label="Đơn giá"
                        variant="standard"
                        {...field}
                        onChange={(e) => {
                          onChange(+e.target.value);
                        }}
                        style={{ marginBottom: 2 }}
                        {...(!isEditing
                          ? {
                              InputProps: {
                                readOnly: true,
                                disableUnderline: true,
                              },
                            }
                          : null)}
                        InputLabelProps={{ shrink: true }}
                        error={error ? true : false}
                        helperText={error ? error.message : " "}
                      />
                    )}
                  />
                </Box>
                <Box display={"flex"}>
                  <Controller
                    control={control}
                    name="nxb"
                    defaultValue={sach.nxb}
                    rules={{
                      validate: {
                        validDate: (v) =>
                          new Date().valueOf() - new Date(v).valueOf() >= 0 ||
                          "Không vượt quá ngày hiện tại",
                      },
                    }}
                    render={({
                      field: { value, onChange, ...field },
                      fieldState: { error },
                    }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateField
                          fullWidth
                          variant="standard"
                          // sx={{ flexGrow: 1 }}
                          sx={{ width: "100%" }}
                          label="Ngày xuất bản"
                          value={dayjs(value)}
                          {...field}
                          {...(!isEditing
                            ? {
                                InputProps: {
                                  readOnly: true,
                                  disableUnderline: true,
                                },
                              }
                            : null)}
                          onChange={(v) => {
                            if (v != null && v.isValid()) {
                              const date = v.date();
                              const month = v.month() + 1;
                              onChange(
                                `${v.year()}-${
                                  month < 10 ? `0${month}` : month
                                }-${date < 10 ? `0${date}` : date}`
                              );
                            }
                          }}
                          slotProps={{
                            textField: {
                              error: error ? true : false,
                              helperText: error ? error.message : " ",
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                  <Controller
                    control={control}
                    name="soLuong"
                    defaultValue={sach.soLuong}
                    rules={{
                      validate: (v) => {
                        return (!isNaN(+v) && v >= 0) || "Phải lớn hơn 0";
                      },
                    }}
                    render={({
                      field: { onChange, ...field },
                      fieldState: { error },
                    }) => (
                      <TextField
                        fullWidth
                        // sx={{ flexGrow: 1 }}
                        id="soLuong"
                        type="number"
                        label="Còn lại"
                        variant="standard"
                        onChange={(e) => {
                          onChange(+e.target.value);
                        }}
                        {...field}
                        {...(!isEditing
                          ? {
                              InputProps: {
                                readOnly: true,
                                disableUnderline: true,
                              },
                            }
                          : null)}
                        style={{ marginBottom: 2 }}
                        InputLabelProps={{ shrink: true }}
                        error={error ? true : false}
                        helperText={error ? error.message : " "}
                      />
                    )}
                  />
                </Box>
                <Controller
                  control={control}
                  name="moTa"
                  defaultValue={sach.moTa}
                  rules={{
                    minLength: { value: 20, message: "Tối thiểu 20 ký tự" },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      spellCheck={"false"}
                      id="moTa"
                      label="Mô tả"
                      variant="standard"
                      {...field}
                      {...(!isEditing
                        ? {
                            InputProps: {
                              readOnly: true,
                              disableUnderline: true,
                            },
                          }
                        : null)}
                      style={{ marginBottom: 2 }}
                      InputLabelProps={{ shrink: true }}
                      error={error ? true : false}
                      helperText={error ? error.message : " "}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="anh"
                  defaultValue={sach.anh}
                  render={({ field: { value, ...rest } }) => (
                    <TextField
                      sx={{
                        display: "none",
                      }}
                      hiddenLabel
                      id="anh"
                      label="anh"
                      variant="standard"
                      {...rest}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="trangThai"
                  defaultValue={sach.trangThai}
                  render={({ field: { value, ...rest } }) => (
                    <TextField
                      fullWidth
                      id="trangThai"
                      label="trangThai"
                      sx={{
                        display: "none",
                      }}
                      hiddenLabel
                      variant="standard"
                      {...rest}
                    />
                  )}
                />
                <Stack direction="row" spacing={2}>
                  {isEditing && (
                    <>
                      <Button variant="contained" onClick={cancelChange}>
                        Hủy
                      </Button>
                      <LoadingButton
                        type="submit"
                        loading={isLoading}
                        variant="contained"
                        sx={{ mt: 3, mb: 2, ml: 3 }}
                        disabled={!formState.isDirty}
                      >
                        <span>Lưu thay đổi</span>
                      </LoadingButton>
                    </>
                  )}
                </Stack>
              </Box>
            </Grid>
          </>
        ) : (
          <Grid
            item
            xs={12}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h4" color={"error"}>
              Sách Không Tồn Tại
            </Typography>
            <NavLink to={NavigationLink.HOME_ADMIN}>
              <Button variant="contained" size="medium">
                Quay lại
              </Button>
            </NavLink>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default AdminSachDetails;
