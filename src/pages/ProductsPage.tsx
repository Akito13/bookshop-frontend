import Box from "@mui/material/Box";
import Header from "../components/Header";
import Grid from "@mui/material/Grid";
import LeftSideList from "../components/LeftSideList";
import { useNavigate, useSearchParams } from "react-router-dom";
import React, {
  useEffect,
  useReducer,
  Reducer,
  useState,
  SyntheticEvent,
} from "react";
import { axiosPublic } from "../services/axios";
import { APIURL } from "../utils/Constants";
import axios from "axios";
import { ApiResponseSuccess } from "../types/ResponseType";
import { SachType } from "../types/SachType";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import formatNumber from "../utils/numberFormatter";
import Sach from "../components/Sach";
import Backdrop from "../components/CustomBackdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { CustomPagination as Pagination } from "../components/CustomPagination";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import DropdownSelect from "../components/DropdownSelect";
import Button from "@mui/material/Button";

type ParamActionNumber = {
  type: "PAGE" | "PAGE_SIZE" | "GIA";
  payload: number;
};

type ParamActionString = {
  type: "TEN" | "LOAI" | "SORT_BY" | "DIRECTION";
  payload: string;
};

type ParamActionReset = {
  type: "RESET";
};

type ParamActions = ParamActionNumber | ParamActionString | ParamActionReset;

type ParamState = {
  page?: number | null;
  gia?: number | null;
  ten?: string | null;
  loai?: string | null;
  sortBy?: string | null;
  direction?: string | null;
};

const reducer: Reducer<ParamState, ParamActions> = (state, action) => {
  switch (action.type) {
    case "GIA":
      return { ...state, gia: action.payload, page: 0 };
    case "LOAI":
      return { ...state, loai: action.payload, page: 0 };
    case "TEN":
      return { ...state, page: 0, ten: action.payload };
    case "PAGE":
      if (action.payload < 0) return state;
      return { ...state, page: action.payload };
    case "SORT_BY":
      return { ...state, page: 0, sortBy: action.payload };
    case "DIRECTION":
      return { ...state, page: 0, direction: action.payload };
    case "RESET":
      return {};
  }
  return state;
};

let initialParamState: ParamState;

function addQueryParams(queryParams: ParamState, queryValues: ParamState) {
  if (queryValues.gia !== null && queryValues.gia !== undefined) {
    console.log(`Type của gia: ${typeof queryValues.gia}`);
    queryParams.gia = queryValues.gia;
  }
  if (queryValues.loai !== null && queryValues.loai !== undefined) {
    queryParams.loai = queryValues.loai;
  }
  if (queryValues.page !== null && queryValues.page !== undefined) {
    console.log(`Type của page: ${typeof queryValues.gia}`);
    queryParams.page = queryValues.page >= 0 ? queryValues.page : 0;
  }
  if (queryValues.ten !== null && queryValues.ten !== undefined) {
    queryParams.ten = queryValues.ten;
  }
  if (queryValues.sortBy !== null && queryValues.sortBy !== undefined) {
    queryParams.sortBy = queryValues.sortBy;
  }
  if (queryValues.direction !== null && queryValues.direction !== undefined) {
    queryParams.direction = queryValues.direction;
  }
  return queryParams;
}

function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [params, setParams] = useSearchParams();
  const paramPageString = params.get("page");
  const paramTen = params.get("ten");
  const paramLoai = params.get("loai");
  const paramGiaString = params.get("gia");
  const paramSortBy = params.get("sb");
  const paramsDirection = params.get("direction");

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

  initialParamState = addQueryParams(
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

  const [state, dispatch] = useReducer<Reducer<ParamState, ParamActions>>(
    reducer,
    initialParamState
  );
  const [sachList, setSachList] = useState<SachType[]>([]);

  const { gia, loai, page, ten, sortBy, direction } = state;

  useEffect(() => {
    setIsLoading(true);
    const cancelToken = axios.CancelToken.source();
    const params = addQueryParams({}, state);
    axiosPublic
      .get<ApiResponseSuccess<SachType>>(`${APIURL.SACH_ALL}/user`, {
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
  }, [gia, loai, page, ten, sortBy, direction]);

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

  const handleSearchForm = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      dispatch({ type: "TEN", payload: (e.target as HTMLInputElement).value });
    }
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
    <>
      <Box
        sx={{
          mb: 20,
        }}
      >
        <Header handleSearchForm={handleSearchForm} />
      </Box>
      <Grid
        sx={{ mb: 20, backgroundColor: "#f8f6f0", paddingY: 8 }}
        container
        paddingLeft={60}
        paddingRight={45}
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
              paddingRight={6}
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
            }}
          >
            <Box
              display={"flex"}
              sx={{
                justifyContent: "end",
                paddingX: 5,
                minWidth: 30,
                alignItems: "center",
              }}
            >
              <DropdownSelect
                handleSortByChange={handleSortByChange}
                labels={["Theo Tên", "Theo Giá", "Theo Số Lượng"]}
                values={["ten", "gia", "soLuong"]}
                sortBy={sortBy ? sortBy : "ten"}
              />
              <DropdownSelect
                handleSortByChange={handleDirectionChange}
                labels={["Cao đến thấp", "Thấp đến cao"]}
                values={["desc", "asc"]}
                sortBy={direction ? direction : "asc"}
              />
              <Button
                variant="contained"
                size="medium"
                sx={{ height: 40, marginLeft: 2 }}
                onClick={handleParamsReset}
              >
                Reset
              </Button>
            </Box>
            <Grid
              container
              spacing={2}
              rowSpacing={8}
              mt={0}
              ml={0}
              sx={{ height: "100%", padding: "0 30px 80px 0" }}
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
                  <Grid item xs={3} key={`${sach.id}-grid`}>
                    <Sach sach={sach} key={sach.id} />
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
                    <Typography variant="h3" textAlign={"center"}>
                      Không tìm thấy sách phù hợp
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
            {totalPages > 1 && (
              <Pagination
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default ProductsPage;
