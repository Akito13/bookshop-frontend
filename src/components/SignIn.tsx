import React, { useEffect, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { SubmitHandler, useForm } from "react-hook-form";
import { Account, AccountSignIn } from "../types/AccountType";
import { useMutation } from "@tanstack/react-query";
import { loginAccount } from "../services/accountApi";
import toast from "react-hot-toast";
import { ApiResponseSuccess } from "../types/ResponseType";
import {
  CookieKey,
  NavigationLink,
  ServerErrorStatusCode,
} from "../utils/Constants";
import useCookie from "../hooks/useCookie";
import { parseJwt } from "../utils/jwrtConverter";
import Backdrop from "../components/CustomBackdrop";
import LoadingButton from "@mui/lab/LoadingButton";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Header from "./Header";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function SignIn() {
  const { register, handleSubmit } = useForm<AccountSignIn>();
  const navigate = useNavigate();
  const location = useLocation();
  const [jwt, setJwt] = useCookie(CookieKey.JWT);
  const [__, setAccountId] = useCookie(CookieKey.ACCOUNT_ID);
  const [___, setAuthority] = useCookie(CookieKey.AUTHORITY);
  const from = location.state?.from?.pathname || NavigationLink.HOME_USER;

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    try {
      if (
        jwt != null &&
        new Date(parseJwt(jwt).exp * 1000).valueOf() - new Date().valueOf() > 0
      ) {
        toast.error("Bạn đã đăng nhập");
        toast.success("Ok");
        console.log("Hello");
        // navigate(from, { replace: true });
      }
    } catch (error) {
      console.log("Error khi parse JWT");
    }
  }, []);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) =>
    e.preventDefault();

  const { mutateAsync } = useMutation({
    mutationFn: loginAccount,
    onError(error) {
      console.log(
        `This shouldn't be printed on any occasions onError(): \n${error}`
      );
    },
  });

  const handleErrors = (data: ApiResponseSuccess<Account>) => {
    console.log(data.statusCode);
    if (ServerErrorStatusCode.includes(data.statusCode)) {
      return true;
    }
    if (data.payload == null) {
      return true;
    }
    return false;
  };

  const onSubmit: SubmitHandler<AccountSignIn> = async (data, e) => {
    e?.preventDefault();
    setIsLoading(true);
    const { response: responseData, headers } = await mutateAsync(data);
    if (responseData === undefined || responseData === null) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
      setIsLoading(false);
      return;
    }
    if (handleErrors(responseData)) {
      toast.error(responseData.message);
      setIsLoading(false);
      return;
    }
    if (
      responseData.payload.records &&
      !("id" in responseData.payload.records)
    ) {
      const accounts = responseData.payload.records;
      if (accounts.length && accounts.length > 0) {
        const account = accounts[0];
        const jwtToken = headers["jwttoken"];
        console.log(jwtToken);
        if (!jwtToken) {
          toast.error("Có lỗi xảy ra. Vui lòng thử lại sau");
          setIsLoading(false);
          return;
        }
        const tokenPayload = parseJwt(jwtToken);
        setJwt(jwtToken, { expires: 1 });
        setAuthority(tokenPayload.authority, { expires: 1 });
        setAccountId(tokenPayload.id, { expires: 1 });
        setIsLoading(false);
        toast.success(`Chào mừng trở lại ${account.hoLot} ${account.ten}`);
        if (tokenPayload.authority === "ROLE_USER") {
          navigate(from, { replace: true });
        } else {
          navigate(NavigationLink.HOME_ADMIN, { replace: true });
        }
      }
    }
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
            Đăng Nhập
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Tài khoản email"
              {...register("email")}
              autoComplete="email"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              {...register("password")}
              label="Mật khẩu"
              id="password"
              autoComplete="current-password"
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
              }}
            />
            <LoadingButton
              fullWidth
              type="submit"
              loading={isLoading}
              loadingPosition="end"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              <span>Đăng nhập</span>
            </LoadingButton>
            <Backdrop isLoading={isLoading} />
            <Grid container>
              <Grid item xs>
                <NavLink to={NavigationLink.FORGOT_PASSWORD} end>
                  Quên mật khẩu?
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
