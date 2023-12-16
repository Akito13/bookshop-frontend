import Typography from "@mui/material/Typography";
import React, {
  Reducer,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { GridColDef } from "@mui/x-data-grid/models/colDef/gridColDef";
import Image from "mui-image";
import { GridValueGetterParams } from "@mui/x-data-grid/models/params/gridCellParams";
import formatNumber from "../../utils/numberFormatter";
import Button from "@mui/material/Button";
import { useQuery } from "@tanstack/react-query";
import useCookie from "../../hooks/useCookie";
import {
  SachFilterAction,
  SachFilterState,
  addSachQueryParam,
  sachFilterReducer,
} from "../../utils/reducerCreateQueryParams";
import { NavLink, useSearchParams } from "react-router-dom";
import { SachType } from "../../types/SachType";
import { ApiResponseSuccess } from "../../types/ResponseType";
import { APIURL, NavigationLink } from "../../utils/Constants";
import axios from "axios";
import { SelectChangeEvent } from "@mui/material/Select";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LeftSideList from "../../components/LeftSideList";
import Slider, { SliderProps } from "@mui/material/Slider";
import DropdownSelect from "../../components/DropdownSelect";
import CircularProgress from "@mui/material/CircularProgress";
import Sach from "../../components/Sach";
import { CustomPagination as Pagination } from "../../components/CustomPagination";
import { Mark } from "@mui/base";
import TextField from "@mui/material/TextField";
import ReloadIcon from "@mui/icons-material/Cached";

let initialSachState: SachFilterState;

const giaMarks: Mark[] = [
  {
    value: 0,
    label: "0đ",
  },
  {
    value: 1000000,
    label: "1,000,000đ",
  },
];

function AdminSach() {
  const [isLoading, setIsLoading] = useState(true);

  const [params, setParams] = useSearchParams();
  const [reload, setReload] = useState<boolean>(false);
  const paramPageString = params.get("page");
  const paramTen = params.get("ten");
  const paramLoai = params.get("loai");
  const paramGiaString = params.get("gia");
  const paramSortBy = params.get("sb");
  const paramsDirection = params.get("direction");
  const axiosPrivate = useAxiosPrivate();
  const [totalPages, setTotalPages] = useState<number>(0);

  const paramGia =
    paramGiaString != null
      ? isNaN(+paramGiaString) || +paramGiaString < 0
        ? 1000000
        : +paramGiaString
      : null;
  const paramPage =
    paramPageString != null
      ? isNaN(+paramPageString) || +paramPageString < 0
        ? 0
        : +paramPageString
      : null;
  initialSachState = addSachQueryParam(
    {},
    {
      gia: paramGia,
      loai: paramLoai,
      page: paramPage,
      ten: paramTen,
      sortBy: paramSortBy,
      direction: paramsDirection,
    }
  );

  const [state, dispatch] = useReducer<
    Reducer<SachFilterState, SachFilterAction>
  >(sachFilterReducer, initialSachState);
  const [sachList, setSachList] = useState<SachType[]>([]);

  const { gia, loai, page, ten, sortBy, direction, trangThai } = state;

  useEffect(() => {
    setIsLoading(true);
    const cancelToken = axios.CancelToken.source();
    const params = addSachQueryParam({}, state);
    axiosPrivate
      .get<ApiResponseSuccess<SachType>>(`${APIURL.SACH_ALL}/admin`, {
        cancelToken: cancelToken.token,
        params,
      })
      .then((res) => {
        console.log(res);
        if (res.data.payload.records && !("id" in res.data.payload.records)) {
          setSachList(res.data.payload.records);
          setTotalPages(res.data.payload.totalPages as number);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
        setParams(state);
      });

    return () => {
      cancelToken.cancel();
    };
  }, [gia, loai, page, ten, sortBy, direction, trangThai, reload]);

  // const columns: GridColDef[] = useMemo(
  //   () => [
  //     {
  //       field: "id",
  //       headerName: "Mã sách",
  //       align: "center",
  //       headerAlign: "center",
  //       sortable: false,
  //       width: 150,
  //       colSpan: ({ row }) => {
  //         if (row.id === "TONGTIEN") {
  //           return 3;
  //         }
  //         return undefined;
  //       },
  //       valueGetter: ({ value, row }) => {
  //         if (row.id === "TONGTIEN") {
  //           return row.label;
  //         }
  //         return value;
  //       },
  //     },
  //     {
  //       field: "anh",
  //       headerName: "Ảnh",
  //       align: "center",
  //       headerAlign: "center",
  //       sortable: false,
  //       width: 200,
  //       renderCell: (params) => {
  //         return (
  //           <>
  //             <Image
  //               src={params.value}
  //               duration={0}
  //               style={{ objectFit: "contain", height: "60px" }}
  //             />
  //           </>
  //         );
  //       },
  //     },
  //     {
  //       field: "ten",
  //       headerName: "Tên sách",
  //       width: 400,
  //       minWidth: 200,
  //     },
  //     {
  //       field: "gia",
  //       headerName: "Đơn giá",
  //       hiddable: false,
  //       type: "number",
  //       align: "center",
  //       headerAlign: "center",
  //       width: 150,
  //     },
  //     {
  //       field: "soLuong",
  //       headerName: "Số lượng",
  //       hiddable: false,
  //       align: "center",
  //       headerAlign: "center",
  //       type: "number",
  //       width: 150,
  //     },
  //     {
  //       field: "sum",
  //       headerName: "Tổng tiền",
  //       sortable: false,
  //       align: "center",
  //       headerAlign: "center",
  //       width: 150,
  //       valueGetter: (params: GridValueGetterParams) => {
  //         if (params.row.id === "TONGTIEN") {
  //           return formatNumber(params.row.sum);
  //         }
  //         return formatNumber(params.row.gia * params.row.soLuong);
  //       },
  //     },
  //     {
  //       field: "btn",
  //       headerName: "Thao tác",
  //       sortable: false,
  //       align: "center",
  //       headerAlign: "center",
  //       width: 150,
  //       renderCell: (params) => {
  //         if (params.row.id === "TONGTIEN") {
  //           return undefined;
  //         }
  //         return (
  //           <>
  //             <Button
  //               variant="contained"
  //               // disabled={!activeRows?.includes(params?.id)}
  //               disabled={!rowNums?.includes(params.id)}
  //               onClick={() => handleActionClick(params.id as number)}
  //             >
  //               Xóa
  //             </Button>
  //           </>
  //         );
  //       },
  //     },
  //   ],
  //   [rowNums]
  // );

  const handleTenChange = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      dispatch({ type: "TEN", payload: (e.target as HTMLInputElement).value });
    }
  };

  const handleGiaChange = (
    e: Event | SyntheticEvent<Element, Event>,
    value: number | number[]
  ) => {
    if (typeof value === "number") {
      dispatch({ type: "GIA", payload: value });
    }
  };

  const hanleLoaiChange = (maLoai: string) => {
    dispatch({ type: "LOAI", payload: maLoai });
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    value--;
    dispatch({ type: "PAGE", payload: value });
  };

  const handleSortByChange = (event: SelectChangeEvent<string>) => {
    dispatch({ type: "SORT_BY", payload: event.target.value });
  };

  const handleDirectionChange = (event: SelectChangeEvent<string>) => {
    dispatch({ type: "DIRECTION", payload: event.target.value });
  };

  const handleParamsReset = () => {
    dispatch({ type: "RESET" });
  };

  return (
    <Box sx={{ backgroundColor: "#f8f6f0", paddingY: 8, paddingX: 2 }}>
      <Grid
        sx={{ mb: 20 }}
        container
        style={{
          maxWidth: "100%",
          margin: "auto",
        }}
        spacing={2}
        // paddingLeft={60}
        // paddingRight={45}
      >
        <Grid item xs={3}>
          <Box mb={2}>
            <LeftSideList loaiChangeHandler={hanleLoaiChange} />
          </Box>
          <Box
            sx={{
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #1976d2",
              maxWidth: "360px",
            }}
          >
            <Box sx={{ width: "100%" }}>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#fff",
                  background: "#1976d2",
                  padding: "10px 16px",
                }}
              >
                Giá sách
              </Typography>
            </Box>
            <Box
              paddingRight={5}
              paddingY={2}
              paddingLeft={2}
              sx={{ backgroundColor: "#fff" }}
            >
              <Slider
                aria-label="Giá sách"
                defaultValue={1000000}
                getAriaValueText={(n) => `${n} đồng`}
                valueLabelDisplay="auto"
                valueLabelFormat={(n) => `${formatNumber(n)} VNĐ`}
                step={50000}
                min={0}
                max={1000000}
                marks={giaMarks}
                onChangeCommitted={handleGiaChange}
              />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={9}>
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #1976d2",
              overflow: "hidden",
              paddingY: 4,
              width: "100%",
            }}
          >
            <Box
              display={"flex"}
              sx={{
                justifyContent: "end",
                paddingX: 3,
                minWidth: 30,
                alignItems: "center",
              }}
            >
              <TextField
                id="search-sach"
                label="Tìm tên sách"
                variant="outlined"
                onKeyDown={handleTenChange}
                size="small"
              />
              <DropdownSelect
                handleSortByChange={handleSortByChange}
                labels={[
                  "Theo Tên",
                  "Theo Giá",
                  "Theo Số Lượng",
                  "Theo Trạng Thái",
                ]}
                values={["ten", "gia", "soLuong", "trangThai"]}
                sortBy={sortBy ? sortBy : "ten"}
              />
              <DropdownSelect
                handleSortByChange={handleDirectionChange}
                labels={["Cao đến thấp", "Thấp đến cao"]}
                values={["desc", "asc"]}
                sortBy={direction ? direction : "asc"}
              />
              <Button
                variant="outlined"
                size="small"
                sx={{ height: 40, marginLeft: 1 }}
                onClick={handleParamsReset}
              >
                <ReloadIcon />
              </Button>
              <NavLink to={NavigationLink.ADMIN_NEW_SACH}>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  sx={{ height: 40, marginLeft: 2 }}
                >
                  Thêm Sách
                </Button>
              </NavLink>
            </Box>
            <Grid
              container
              spacing={2}
              rowSpacing={2}
              mt={0}
              ml={0}
              sx={{ height: "100%", padding: "0 30px 80px 0", width: "100%" }}
              columns={{ xs: 6, md: 9, lg: 9, xl: 12 }}
            >
              {isLoading && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress />
                  </Box>
                </Grid>
              )}
              {sachList &&
                sachList.length > 0 &&
                !isLoading &&
                sachList.map((sach) => (
                  <Grid
                    item
                    xs={3}
                    md={3}
                    lg={3}
                    xl={3}
                    key={`${sach.id}-grid`}
                  >
                    <Sach sach={sach} key={sach.id} handleReset={setReload} />
                  </Grid>
                ))}
              {(sachList == null || sachList.length <= 0) && !isLoading && (
                <Grid item xs={12} height={"100%"}>
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h4" textAlign={"center"}>
                      Không tìm thấy sách phù hợp
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
            {totalPages > 1 && (
              <Pagination
                totalPages={totalPages}
                page={page != null ? page + 1 : 1}
                handlePageChange={handlePageChange}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export { giaMarks };
export default AdminSach;
