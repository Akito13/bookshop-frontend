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
import { NavLink } from "react-router-dom";
import Footer from "./Footer";
import { useState, useRef, useEffect } from "react";
import { AccountRegistration } from "../types/AccountType";
import { ApiResponsePayload } from "../types/ResponseType";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { createAccount } from "../services/accountApi";

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

export default function SignUp() {
  const { mutate, isError, status } = useMutation({
    mutationFn: createAccount,
    onSuccess: (data, variables) => {
      console.log(`It was a success POST onSuccess(): \n`);
      console.log(data);
    },
    onError(error, variables, context) {
      console.log(`It was a failed POST onError(): \n${error}`);
    },
  });

  const { register, reset, handleSubmit } = useForm<AccountRegistration>();
  const onSubmit: SubmitHandler<AccountRegistration> = (data) => {
    mutate(data);
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
                  // error={signUpErrors.ten !== ""}
                  // helperText={signUpErrors.ten}
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
                  // error={signUpErrors.hoLot !== ""}
                  // helperText={signUpErrors.hoLot}
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
                  // error={signUpErrors.email !== ""}
                  // helperText={signUpErrors.email}
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
                  // error={signUpErrors.password !== ""}
                  // helperText={signUpErrors.password}
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
