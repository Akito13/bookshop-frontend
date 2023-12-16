import React from "react";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";

type CustomPaginationProps = {
  totalPages: number;
  page: number;
  handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
};

function CustomPagination({
  totalPages,
  handlePageChange,
  page,
}: CustomPaginationProps) {
  return (
    <Stack spacing={2} sx={{ margin: "auto", width: "50%" }}>
      <Pagination
        count={totalPages}
        color="primary"
        showFirstButton
        showLastButton
        page={page}
        size="large"
        sx={{
          margin: "auto !important",
        }}
        onChange={handlePageChange}
      />
    </Stack>
  );
}

export { CustomPagination };
