import { ChangeEvent, useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { NavLink, useNavigate } from "react-router-dom";
import { axiosPublic } from "../../services/axios";
import {
  ApiResponseFieldError,
  ApiResponseSuccess,
} from "../../types/ResponseType";
import { Loai, SachType } from "../../types/SachType";
import { APIURL, NavigationLink } from "../../utils/Constants";
import axios, { CancelToken, CancelTokenSource } from "axios";
import Image from "mui-image";
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

function AdminSachCreate() {
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loaiList, setLoaiList] = useState<Loai[]>([]);
  const axiosPrivate = useAxiosPrivate();
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [preview, setPreview] = useState<string>("");

  //   const fetchSachDetails = useCallback(async (token?: CancelToken) => {
  //     try {
  //       const res = await axiosPrivate.get<ApiResponseSuccess<SachType>>(
  //         `${APIURL.SACH_BASE}/${params.sachId}`,
  //         { cancelToken: token }
  //       );
  //       const responseData = res.data;
  //       const records = responseData.payload.records;
  //       if (records && !("id" in records)) {
  //         return records[0];
  //       }
  //       console.log("Lỗi gì đó");
  //       console.log(responseData);
  //       throw new Error("Có lỗi xảy ra");
  //     } catch (err) {
  //       if (!axios.isCancel(err)) {
  //         console.log(err);
  //       }
  //       // if (err) setError(err.response.data);
  //       return Promise.reject(err);
  //     }
  //   }, []);

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

  const handleSelectFile = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) {
      setSelectedFile(undefined);
      return "";
    }
    const file = target.files[0];
    setSelectedFile(file);
    return file.name;
  };

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
        thoiGian: { endTime: null, startTime: null },
      },
      loaiDto: { ma: "", parent: "", ten: "" },
      moTa: "",
      nxb: "",
      soLuong: 0,
      tacGia: "",
      trangThai: false,
    },
  });

  const sach = getValues();

  useEffect(() => {
    if (!selectedFile) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

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
      })
      .finally(() => setIsLoading(false));
    // fetchSachDetails(cancelToken.token)
    //   .then((data) => {
    //     reset(data);
    //     setError(false);
    //   })
    //   .catch((err) => {
    //     if (!axios.isCancel(err)) {
    //       toast.error("Xảy ra lỗi tải chi tiết sách");
    //       setError(true);
    //     }
    //   })
    //   .finally(() => setIsLoading(false));
    return () => {
      cancelToken.cancel();
    };
  }, []);

  const onSubmit: SubmitHandler<SachType> = async (data, e) => {
    e?.preventDefault();
    console.log(data);
    console.log(selectedFile);
    setIsLoading(true);
    const { anh, giaSach, loaiDto, moTa, nxb, soLuong, tacGia, ten } = data;
    console.log(nxb);
    const fullData = {
      anh,
      moTa,
      nxb,
      soLuong,
      tacGia,
      ten,
      giaGoc: giaSach.giaGoc,
      giaBan: giaSach.giaBan,
      startTime: giaSach.thoiGian.startTime,
      endTime: giaSach.thoiGian.endTime,
      phanTramGiam: giaSach.phanTramGiam,
      maLoai: loaiDto.ma,
      tenLoai: loaiDto.ten,
      parentLoai: loaiDto.parent,
      img: selectedFile,
    };
    axiosPrivate
      .post(`${APIURL.SACH_BASE}/new`, fullData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        const data = res.data;
        console.log(data);
        setPreview("");
        reset();
        toast.success("Thêm thành công", { duration: 2 * 1000 });
        navigate(`${NavigationLink.HOME_ADMIN}/${data}`, { replace: true });
        // setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        let message: string;
        if (error.response?.status === 401 || error.response.status === 403) {
          message = "Bạn chưa đăng nhập";
        } else if (error.response?.data) {
          message = error.response.data.message;
        } else {
          message = "Có lỗi xảy ra";
        }
        toast.error(message, { duration: 1.5 * 1000 });
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
          height: error ? "200px" : "720px",
        }}
        margin={"auto"}
        container
        columnSpacing={2}
      >
        {sach && (
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
                src={preview}
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
                  rules={{
                    required: { value: true, message: "Loại không bỏ trống" },
                    validate: {
                      isPicked: (val) =>
                        (val != null &&
                          val.ma != null &&
                          val.ma.trim() !== "") ||
                        "Chưa chọn loại",
                    },
                  }}
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <>
                      <InputLabel
                        sx={{ fontSize: "0.8rem" }}
                        id="loai-select-label"
                        {...(error != null && { sx: { color: "#d32f2f" } })}
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
                        value={value.ma}
                        onChange={(e) => {
                          const selectedLoai = loaiList.find(
                            (v) => v.ma === e.target.value
                          );
                          if (selectedLoai) {
                            onChange(selectedLoai);
                          }
                        }}
                        style={{ marginBottom: 2 }}
                        error={error ? true : false}
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
                      <FormHelperText sx={{ color: "#d32f2f" }}>
                        {error?.message ? error.message : " "}
                      </FormHelperText>
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
                          onChange={(v) => {
                            if (v != null && v.isValid()) {
                              const date = v.date();
                              const month = v.month() + 1;
                              console.log(month);
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
                    required: { value: true, message: "Tối thiểu 20 ký tự" },
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
                  rules={{ required: { value: true, message: "Chưa có ảnh" } }}
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <TextField
                      type="file"
                      id="anh"
                      label="Ảnh sách"
                      inputProps={{ accept: "image/*" }}
                      style={{ marginBottom: 2 }}
                      InputLabelProps={{ shrink: true }}
                      error={error ? true : false}
                      helperText={error ? error.message : " "}
                      //   variant="standard"
                      onChange={(e) => {
                        const fileName = handleSelectFile(e);
                        onChange(fileName);
                      }}
                      {...field}
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
                  {formState.isDirty && (
                    <>
                      <Button variant="contained" onClick={() => reset()}>
                        Hủy
                      </Button>
                      <LoadingButton
                        type="submit"
                        loading={isLoading}
                        variant="contained"
                        sx={{ mt: 3, mb: 2, ml: 3 }}
                        // disabled={!formState.isValid}
                      >
                        <span>Thêm sách</span>
                      </LoadingButton>
                    </>
                  )}
                </Stack>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
}

export default AdminSachCreate;
