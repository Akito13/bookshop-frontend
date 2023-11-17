import React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { SachType } from "../types/SachType";
import Sach from "./Sach";
import { Typography } from "@mui/material";

type ItemListProps = {
  sachs: SachType[];
  isLoading: boolean;
};

function ItemList({ sachs, isLoading }: ItemListProps) {
  const sachNum = sachs.length;
  // const xs = sachNum <= 4 ? 3 :
  return (
    <Box
      sx={{
        border: "1.5px #aba solid",
        borderRadius: 4,
        backgroundColor: "#fff",
        px: 5,
        pt: 4,
        pb: 5,
        width: "100%",
      }}
    >
      <Box borderBottom={"2px solid #888"} marginBottom={3}>
        <Typography variant="h4">{sachs[0].loaiDto.ten}</Typography>
      </Box>
      <Box
        sx={{
          flexDirection: "row",
          display: "flex",
          p: 1,
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        {sachs.map((s) => (
          <Sach sach={s} key={s.ten}></Sach>
        ))}
      </Box>
    </Box>
  );
}

export default ItemList;
