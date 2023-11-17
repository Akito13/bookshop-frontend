import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import Checkbox from "@mui/material/Checkbox";
// import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { NavLink, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { useState } from "react";
import { Account, AccountRegistration } from "../types/AccountType";
// import { ApiResponsePayload } from "../types/ResponseType";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { createAccount } from "../services/accountApi";
import toast from "react-hot-toast";
import {
  ApiResponseFieldError,
  ApiResponseSuccess,
} from "../types/ResponseType";
import { NavigationLink, ServerErrorStatusCode } from "../utils/Constants";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import Header from "./Header";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function SignUp() {
  const [fieldErrors, setFieldErrors] = useState<AccountRegistration>({
    email: "",
    hoLot: "",
    password: "",
    ten: "",
  });
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) =>
    e.preventDefault();

  const { mutateAsync } = useMutation({
    mutationFn: createAccount,
    onError(error) {
      console.log(
        `This shouldn't be printed on any occasions onError(): \n${error}`
      );
    },
  });

  const handleErrors = (
    data:
      | ApiResponseFieldError<AccountRegistration>
      | ApiResponseSuccess<Account>
  ) => {
    if (ServerErrorStatusCode.includes(data.statusCode)) {
      return true;
    }
    if ("errors" in data) {
      if (!data.errors) {
        setFieldErrors({ email: "", hoLot: "", ten: "", password: "" });
        return true;
      } else {
        setFieldErrors((current) => {
          return { ...current, ...data.errors };
        });
        return true;
      }
    }
    return false;
  };

  const { register, handleSubmit } = useForm<AccountRegistration>();

  const onSubmit: SubmitHandler<AccountRegistration> = async (data, e) => {
    e?.preventDefault();
    const responseData = await mutateAsync(data);
    if (responseData === undefined) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
      return;
    }
    if (handleErrors(responseData)) {
      toast.error(responseData.message);
      return;
    }

    if (
      "payload" in responseData &&
      responseData.payload.records &&
      !("id" in responseData.payload.records)
    ) {
      const savedAccounts = responseData.payload.records;
      if (savedAccounts.length && savedAccounts.length > 0) {
        toast.success("Đăng ký thành công. Vui lòng xác nhận tài khoản");
        console.log(savedAccounts[0].email);
        navigate("/account/sign-up/confirmation", {
          state: { email: savedAccounts[0].email },
          replace: true,
        });
        return;
      }
    }
    toast.error("Có lỗi xảy ra. Vui lòng thử lại sau");
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
            Đăng Ký
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  required
                  fullWidth
                  id="ten"
                  // name="ten"
                  label="Tên"
                  autoFocus
                  {...register("ten")}
                  error={fieldErrors.ten !== ""}
                  helperText={fieldErrors.ten}
                  // inputRef={signUpTenRef}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="hoLot"
                  label="Họ và tên lót"
                  // name="hoLot"
                  autoComplete="family-name"
                  {...register("hoLot")}
                  error={fieldErrors.hoLot !== ""}
                  helperText={fieldErrors.hoLot}
                  // inputRef={signUpHoLotRef}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Tài khoản email"
                  // name="email"
                  autoComplete="email"
                  {...register("email")}
                  error={fieldErrors.email !== ""}
                  helperText={fieldErrors.email}
                  // inputRef={signUpEmailRef}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Mật khẩu"
                  id="password"
                  {...register("password")}
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
                  error={fieldErrors.password !== ""}
                  helperText={fieldErrors.password}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Đăng ký
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <NavLink to={NavigationLink.SIGN_IN} end>
                  Bạn đã có tài khoản? Đăng nhập
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
