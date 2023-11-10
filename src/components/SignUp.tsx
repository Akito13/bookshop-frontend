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
import { AccountRegistration } from "../types/AccountType";
// import { ApiResponsePayload } from "../types/ResponseType";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { createAccount } from "../services/accountApi";
import toast from "react-hot-toast";
import { ApiResponseFieldError } from "../types/ResponseType";

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

  const { mutateAsync } = useMutation({
    mutationFn: createAccount,
    onError(error) {
      console.log(
        `This shouldn't be printed on any occasions onError(): \n${error}`
      );
    },
  });

  const handleFieldErrors = (
    data: ApiResponseFieldError<AccountRegistration>
  ) => {
    toast.error(data.message);
    setFieldErrors((current) => {
      return { ...current, ...data.errors };
    });
  };

  const { register, handleSubmit } = useForm<AccountRegistration>();
  const onSubmit: SubmitHandler<AccountRegistration> = async (data) => {
    const responseData = await mutateAsync(data);
    if (responseData === undefined) {
      toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
      return;
    }
    if ("errors" in responseData) {
      responseData.errors && handleFieldErrors(responseData);
      !responseData.errors && toast.error(responseData.message);
      return;
    }
    if (
      responseData.payload.records &&
      !("id" in responseData.payload.records)
    ) {
      const savedAccounts = responseData.payload.records;
      if (savedAccounts.length && savedAccounts.length > 0) {
        toast.success("Đăng ký thành công. Vui lòng xác nhận tài khoản");
        navigate("confirmation", {
          state: { email: savedAccounts[0].email },
          replace: true,
        });
        return;
      }
    }
    toast.error("Có lỗi xảy ra. Vui lòng thử lại sau");
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
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
                  label="First Name"
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
                  label="Last Name"
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
                  label="Email Address"
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
                  // name="password"
                  label="Password"
                  type="password"
                  id="password"
                  {...register("password")}
                  // autoComplete="new-password"
                  error={fieldErrors.password !== ""}
                  helperText={fieldErrors.password}
                  // inputRef={signUpPasswordRef}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <NavLink to="/sign-in" end>
                  Already have an account? Sign in
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
