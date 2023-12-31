import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { SubmitHandler, useForm } from "react-hook-form";
import { AccountEmailConfirmation } from "../types/ConfirmationType";
import { useMutation } from "@tanstack/react-query";
import { sendEmailConfirmationCode } from "../services/mailApi";
import { useEffect, useState } from "react";
import {
  ApiResponseFieldError,
  ApiResponseSuccess,
} from "../types/ResponseType";
import toast from "react-hot-toast";
import { ServerErrorStatusCode } from "../utils/Constants";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function Confirm() {
  const navigate = useNavigate();

  const location = useLocation();

  const [confirmationCode, setConfirmationCode] = useState("");

  const { register, handleSubmit, setValue } =
    useForm<AccountEmailConfirmation>();

  useEffect(() => {
    if (location.state?.email) {
      setValue("email", location.state.email);
    }
  }, []);

  const { mutateAsync } = useMutation({
    mutationFn: sendEmailConfirmationCode,
    onError(error) {
      console.log(
        `This shouldn't be printed on any occasions onError(): \n${error}`
      );
    },
  });

  const handleErrors = (
    data:
      | ApiResponseFieldError<AccountEmailConfirmation>
      | ApiResponseSuccess<null>
  ) => {
    if (ServerErrorStatusCode.includes(data.statusCode)) {
      return true;
    }
    if ("errors" in data) {
      setConfirmationCode(data.errors.confirmationCode);
      return true;
    }
    return false;
  };

  const onSubmit: SubmitHandler<AccountEmailConfirmation> = async (data, e) => {
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
    // if ("errors" in responseData) {
    //   responseData.errors && handleFieldErrors(responseData);
    //   !responseData.errors && toast.error(responseData.message);
    //   return;
    // }
    toast.success("Xác nhận thành công.");
    window.history.replaceState({ state: null }, document.title);
    navigate("/account/sign-in", { replace: true });
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
            Confirm Code
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
              label="Email"
              {...register("email")}
              sx={{
                display: "none",
              }}
              hiddenLabel
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="confirmationCode"
              label="6-digit code"
              {...register("confirmationCode")}
              autoComplete="Confirmation Code"
              autoFocus
              error={confirmationCode !== ""}
              helperText={confirmationCode}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Send
            </Button>
          </Box>
        </Box>
        <Footer></Footer>
      </Container>
    </ThemeProvider>
  );
}
