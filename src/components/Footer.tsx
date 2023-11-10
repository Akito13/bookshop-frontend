import { Typography } from "@mui/material";
import React from "react";

function Footer() {
  return (
    <Typography marginTop={8} variant="body2" color="text.secondary" align="center">
      {"Copyright © BookShop "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

export default Footer;
