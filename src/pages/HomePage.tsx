import Header from "../components/Header";
import { Box, Grid } from "@mui/material";
import ItemList from "../components/ItemList";
import { useQuery } from "@tanstack/react-query";
import { retrieveRandomSach } from "../services/sachApi";
import { SachType } from "../types/SachType";
import toast from "react-hot-toast";
import ErrorPage from "./exceptions/ErrorPage";
import Carousel from "react-material-ui-carousel";
import Image from "mui-image";
import Footer from "../components/Footer";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import LeftSideList from "../components/LeftSideList";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import { CookieKey, NavigationLink } from "../utils/Constants";
import useCookie from "../hooks/useCookie";

type SachByMaLoai = {
  [key: string]: SachType[];
};

const assets = [
  "./assets/home_01.jpg",
  "./assets/home_02.jpg",
  "./assets/home_03.jpg",
  "./assets/home_04.png",
  "./assets/home_05.jpg",
];

function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["randomSach"],
    queryFn: retrieveRandomSach,
    staleTime: 60 * 1000 * 5,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [id] = useCookie(CookieKey.ACCOUNT_ID);
  const [authority] = useCookie(CookieKey.AUTHORITY);

  if (data == undefined && !isLoading) {
    console.log("data bị " + data);
    return <ErrorPage code={500} text="Server đang bảo trì" />;
  }

  if (data != null && "errors" in data && !isLoading) {
    toast.error(data.message);
    console.log("Có errors in data " + data);
    return <ErrorPage code={500} text="Vui lòng thử lại sau" />;
  }

  // const records = !isLoading ? data?.payload?.records : null;

  const createItemList = (sachByLoai: SachByMaLoai) => {
    let itemList = [];
    for (const key in sachByLoai) {
      const sachs = sachByLoai[key];
      itemList.push(
        <ItemList key={key} isLoading sachs={sachs} accountId={id} />
      );
    }
    return itemList;
  };

  let result: JSX.Element[] = [];
  if (data && "payload" in data && !isLoading) {
    const records = data.payload.records;
    if (records && !("id" in records)) {
      const sachByMaLoai = records.reduce<SachByMaLoai>(
        (previousValue, currentValue, currentIndex) => {
          return {
            ...previousValue,
            [currentValue.loaiDto.ma]: [
              ...(previousValue[currentValue.loaiDto.ma] || []),
              currentValue,
            ],
          };
        },
        {}
      );
      result = createItemList(sachByMaLoai);
    } else {
      return (
        <ErrorPage code={503} text="Có lỗi xảy ra. Vui lòng thử lại sau" />
      );
    }
  }

  const loaiChangeHandler = (maLoai: string) => {
    console.log(maLoai);
    navigate(
      {
        pathname: `${
          authority === "ROLE_ADMIN"
            ? NavigationLink.HOME_ADMIN
            : NavigationLink.SACH_BASE
        }`,
        search: createSearchParams({
          loai: maLoai,
        }).toString(),
      },
      { replace: true, state: { from: location } }
    );
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
          state: { from: location },
        }
      );
    }
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
      <Box
        sx={{
          mb: 20,
          backgroundColor: "#f8f6f0",
          paddingY: 5,
          maxWidth: 1440,
          marginX: "auto",
        }}
      >
        <Grid
          container
          style={{
            maxWidth: 800,
            minWidth: 500,
            marginBottom: 80,
            margin: "auto",
          }}
        >
          <Grid item xs={12}>
            <Carousel
              height={300}
              NextIcon={<ArrowForwardIosRoundedIcon />}
              PrevIcon={<ArrowBackIosRoundedIcon />}
              cycleNavigation
            >
              {assets.map((s) => (
                <Image
                  key={s}
                  src={s}
                  style={{
                    objectFit: "contain",
                    height: 300,
                  }}
                  duration={0}
                />
              ))}
            </Carousel>
          </Grid>
        </Grid>
        <Grid
          sx={{ mb: 20 }}
          container
          columnSpacing={2}
          style={{
            maxWidth: "100%",
            minWidth: 400,
            marginBottom: 80,
            margin: "auto",
          }}
        >
          <Grid item xs={3}>
            <LeftSideList loaiChangeHandler={loaiChangeHandler} />
          </Grid>
          <Grid item xs={9}>
            {result.map((s, i) => (
              <Box key={i} mb={12}>
                {s}
              </Box>
            ))}
          </Grid>
        </Grid>
      </Box>
      <Footer />
    </>
  );
}

export default HomePage;
