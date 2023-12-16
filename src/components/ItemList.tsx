import React, { BaseSyntheticEvent } from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { SachType } from "../types/SachType";
import Sach from "./Sach";
import { Typography } from "@mui/material";
import { axiosPrivate } from "../services/axios";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { CartSach } from "../types/CartType";
import toast from "react-hot-toast";
import { APIURL } from "../utils/Constants";
import { useQueryClient } from "@tanstack/react-query";

type ItemListProps = {
  sachs: SachType[];
  isLoading: boolean;
  accountId: number;
};

function ItemList({ sachs, isLoading, accountId }: ItemListProps) {
  const sachNum = sachs.length;
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  // const xs = sachNum <= 4 ? 3 :

  const onSubmit = async (
    data: CartSach,
    e: BaseSyntheticEvent<object, any, any> | undefined
  ) => {
    e?.preventDefault();
    console.log(data);
    if (data.soLuong <= 0) {
      toast.error("Sách tạm hết hàng", { duration: 2.5 * 1000 });
      return;
    }
    const validData = { ...data, soLuong: 1 };
    axiosPrivate
      .post(`${APIURL.CART_BASE}/${accountId}`, validData)
      .then((res) => {
        const data = res.data;
        console.log(data);
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
        toast.error(message, { duration: 2 * 1000 });
      });
  };

  return (
    <Box
      sx={{
        border: "1.5px #aba solid",
        borderRadius: 4,
        backgroundColor: "#fff",
        px: 5,
        pt: 4,
        pb: 5,
      }}
    >
      <Box borderBottom={"2px solid #888"} marginBottom={3}>
        <Typography variant="h4">{sachs[0].loaiDto.ten}</Typography>
      </Box>
      {/* <Box
        sx={{
          flexDirection: "row",
          display: "flex",
          p: 1,
          flexWrap: "wrap",
          width: "100%",
        }}
      > */}
      <Grid
        container
        columns={{ xs: 6, md: 9, lg: 12 }}
        width={"100%"}
        spacing={2}
      >
        {sachs.map((s) => (
          <Grid item xs={3} md={3} lg={3} key={`${s.id}-grid`}>
            <Sach sach={s} key={s.ten} onAddToCart={onSubmit}></Sach>
          </Grid>
        ))}
      </Grid>
      {/* </Box> */}
    </Box>
  );
}

export default ItemList;
