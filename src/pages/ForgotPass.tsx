import React, { SetStateAction, useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { NavLink, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { SubmitHandler, useForm } from "react-hook-form";
import { AccountForgotPass } from "../types/AccountType";
import toast from "react-hot-toast";
import { APIURL, NavigationLink } from "../utils/Constants";
import Backdrop from "../components/CustomBackdrop";
import LoadingButton from "@mui/lab/LoadingButton";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Header from "../components/Header";
import axios from "axios";
import { axiosPublic } from "../services/axios";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function ForgotPass() {
  const { register, handleSubmit, formState } = useForm<AccountForgotPass>({
    defaultValues: {
      email: "",
      password: "",
      confirmationCode: "",
    },
  });
  const navigate = useNavigate();

  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [isReadyForConfirmation, setIsReadyForConfirmation] =
    useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) =>
    e.preventDefault();

  useEffect(() => {
    if (isConfirmed) {
      toast.success("Đổi mật khẩu thành công", { duration: 2 * 1000 });
      navigate(`${NavigationLink.SIGN_IN}`, { replace: true });
    }
  }, [isConfirmed]);

  const onSubmit = async (
    url: string,
    data: { email?: string; password?: string; confirmationCode?: string },
    setStateFn?: (value: SetStateAction<boolean>) => void
  ) => {
    setIsLoading(true);
    try {
      const res = await axiosPublic.get(url, {
        params: data,
      });
      if (res.status === 200 && setStateFn) {
        setStateFn(true);
      }
    } catch (err) {
      let message: string | null = null;
      if (axios.isAxiosError(err) && "response" in err) {
        const data = err.response?.data;
        if (data && data.message) {
          message = data.message;
        }
      }
      toast.error(message != null ? message : "Có lỗi xảy ra", {
        duration: 2 * 1000,
      });
    }
    setIsLoading(false);
  };

  const onSubmitWithEmail: SubmitHandler<AccountForgotPass> = async (
    data,
    e
  ) => {
    e?.preventDefault();
    await onSubmit(
      `${APIURL.ACCOUNT_BASE}/email`,
      { email: data.email },
      setIsEmailValid
    );
  };

  const onSubmitWithPassword: SubmitHandler<AccountForgotPass> = async (
    data,
    e
  ) => {
    e?.preventDefault();
    setIsLoading(true);
    await onSubmit(
      `${APIURL.ACCOUNT_BASE}/password`,
      { email: data.email, password: data.password },
      setIsReadyForConfirmation
    );
  };

  const onSubmitWithConfirmation: SubmitHandler<AccountForgotPass> = async (
    data,
    e
  ) => {
    e?.preventDefault();
    setIsLoading(true);
    await onSubmit(
      `${APIURL.MAIL_CONFIRMATION}/pwd-change`,
      {
        email: data.email,
        password: data.password,
        confirmationCode: data.confirmationCode,
      },
      setIsConfirmed
    );
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

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Header handleSearchForm={handleSearchForm} />
        <Box
          sx={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Nhập Thông Tin
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Tài khoản email"
              {...register("email", {
                required: { value: true, message: "Email chưa nhập" },
              })}
              autoComplete="email"
              autoFocus
              error={formState?.errors?.email ? true : false}
              helperText={
                formState?.errors?.email ? formState.errors.email.message : " "
              }
              InputProps={{
                readOnly: isEmailValid,
              }}
            />
            {isEmailValid && (
              <TextField
                margin="normal"
                fullWidth
                {...register("password", {
                  required: { value: true, message: "Mật khẩu chưa nhập" },
                  minLength: { value: 8, message: "Ít nhất 8 ký tự" },
                })}
                label="Mật khẩu mới"
                id="password"
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Xem password"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  readOnly: isReadyForConfirmation,
                }}
                error={formState?.errors?.password ? true : false}
                helperText={
                  formState?.errors?.password
                    ? formState.errors.password.message
                    : " "
                }
              />
            )}
            {isReadyForConfirmation && (
              <TextField
                margin="normal"
                fullWidth
                {...register("confirmationCode", {
                  required: { value: true, message: "Không bỏ trống" },
                  minLength: { value: 6, message: "Phải là 6 ký tự số" },
                  maxLength: { value: 6, message: "Phải là 6 ký tự số" },
                })}
                label="Mã xác nhận"
                id="confirmationCode"
                error={formState?.errors?.confirmationCode ? true : false}
                helperText={
                  formState?.errors?.confirmationCode
                    ? formState.errors.confirmationCode.message
                    : " "
                }
              />
            )}
            {!isEmailValid && (
              <LoadingButton
                fullWidth
                type="button"
                loading={isLoading}
                loadingPosition="end"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleSubmit(onSubmitWithEmail)}
              >
                <span>Xác nhận Email</span>
              </LoadingButton>
            )}
            {isEmailValid && !isReadyForConfirmation && (
              <LoadingButton
                fullWidth
                type="button"
                loading={isLoading}
                loadingPosition="end"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleSubmit(onSubmitWithPassword)}
              >
                <span>Xác nhận mật khẩu</span>
              </LoadingButton>
            )}
            {isReadyForConfirmation && (
              <LoadingButton
                fullWidth
                type="button"
                loading={isLoading}
                loadingPosition="end"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleSubmit(onSubmitWithConfirmation)}
              >
                <span>Xác nhận đổi</span>
              </LoadingButton>
            )}
            <Backdrop isLoading={isLoading} />
            <Grid container>
              <Grid item xs>
                <NavLink to={NavigationLink.FORGOT_PASSWORD} end>
                  Đăng Nhập
                </NavLink>
              </Grid>
              <Grid item>
                <NavLink to={NavigationLink.SIGN_UP} end>
                  Đăng Ký
                </NavLink>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Footer></Footer>
      </Container>
    </ThemeProvider>
  );
}
