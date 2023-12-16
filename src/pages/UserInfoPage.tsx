import {
  Backdrop,
  Box,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import React, {
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import Header from "../components/Header";
import { APIURL, CookieKey, NavigationLink } from "../utils/Constants";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import useCookie from "../hooks/useCookie";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import axios from "axios";
import { ApiResponseSuccess } from "../types/ResponseType";
import { Account } from "../types/AccountType";
import PersonalInfo from "../components/PersonalInfo";
import { useMutation } from "@tanstack/react-query";
import UserOrderPage from "./UserOrderPage";
import UserCartPage from "./UserCartPage";
import UserOrderDetailsPage from "./UserOrderDetailsPage";
import StripeContainer from "../components/StripeContainer";

export type ParamActionString = {
  type: "HOLOT" | "TEN" | "SDT" | "DIACHI";
  payload: string;
};

type ParamActionFetch = {
  type: "FETCH";
  payload: Account;
};

export type ParamAction = ParamActionFetch | ParamActionString;

type ParamState = Partial<Account>;

const reducer: Reducer<ParamState, ParamAction> = (state, action) => {
  switch (action.type) {
    case "HOLOT":
      return { ...state, hoLot: action.payload };
    case "TEN":
      return { ...state, ten: action.payload };
    case "DIACHI":
      return { ...state, diaChi: action.payload };
    case "SDT":
      return { ...state, sdt: action.payload };
    case "FETCH":
      return { ...action.payload };
    default:
      return state;
  }
};

export type AccountMutationVairablesType = {
  id: number;
  account: Account;
};

function UserInfoPage() {
  const navigate = useNavigate();
  const [id] = useCookie(CookieKey.ACCOUNT_ID);
  const [authority] = useCookie(CookieKey.AUTHORITY);
  const [isReload, setIsReload] = useState(false);
  const { pathname } = useLocation();
  const { orderId } = useParams();

  const [account, dispatch] = useReducer<Reducer<ParamState, ParamAction>>(
    reducer,
    {
      accountId: 0,
      diaChi: "",
      email: "",
      hoLot: "",
      password: null,
      role: "",
      sdt: "",
      ten: "",
    }
  );

  const axiosPrivate = useAxiosPrivate();
  const [isLoading, setIsLoading] = useState(true);

  const onReloadNeeded = useCallback(async () => {
    const cancelToken = axios.CancelToken.source();
    try {
      console.log(`${APIURL.ACCOUNT_BASE}/${id}`);
      const res = await axiosPrivate.get<ApiResponseSuccess<Account>>(
        `${APIURL.ACCOUNT_BASE}/${id}`,
        { cancelToken: cancelToken.token }
      );
      return Promise.resolve(res.data);
    } catch (error) {
      return Promise.reject(error);
    }
  }, []);

  const updateAccount = useCallback(
    async ({ id, account }: AccountMutationVairablesType) => {
      if (id == null || isNaN(+id) || id === 0) return null;
      try {
        const response = await axiosPrivate.put(
          `${APIURL.ACCOUNT_BASE}/${id}`,
          account
        );
        console.log("Sent update for account");
        return response.data;
      } catch (err) {
        return err;
      }
    },
    []
  );
  const { mutateAsync, isPending } = useMutation({ mutationFn: updateAccount });

  useEffect(() => {
    setIsLoading(true);
    onReloadNeeded()
      .then((data) => {
        const records = data.payload.records;
        if (records && !("id" in records))
          dispatch({ type: "FETCH", payload: records[0] });
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isReload]);

  const { email, hoLot, ten } = account;

  const handleFormChange = (data: ParamAction) => {
    dispatch(data);
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
          backgroundColor: "#f8f6f0",
          paddingY: 6,
        }}
      >
        <Box
          sx={{
            padding: 5,
            width: "100%",
            maxWidth: 2000,
            minWidth: 500,
            margin: "auto",
            // borderRadius: 8,
            // border: "1px solid #1976d2",
            // backgroundColor: "#fff",
            overflow: "visible",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h5"
                  fontSize={22}
                  paddingX={4}
                  fontWeight={"bold"}
                  mb={2}
                >
                  {hoLot ? hoLot : ""} {ten ? ten : ""}
                </Typography>
                <Typography
                  variant="h5"
                  fontSize={16}
                  paddingX={4}
                  sx={{ color: "#666" }}
                >
                  {email ? email : "Không tìm thấy"}
                </Typography>
              </Box>
              <List>
                <ListItem
                  component={NavLink}
                  to={
                    authority === "ROLE_USER"
                      ? NavigationLink.ACCOUNT_USER_INFO
                      : NavigationLink.ACCOUNT_ADMIN_INFO
                  }
                  sx={{
                    "& *": {
                      color: "#666",
                      fontSize: "20px !important",
                    },
                    "&.active *": {
                      color: "#1976d2",
                      fontWeight: "bolder",
                    },
                  }}
                >
                  <ListItemButton>
                    <ListItemText primary="Thông Tin Cá Nhân" />
                  </ListItemButton>
                </ListItem>
                {authority === "ROLE_USER" ? (
                  <>
                    <ListItem
                      component={NavLink}
                      to={NavigationLink.ACCOUNT_USER_ORDER}
                      sx={{
                        "& *": {
                          color: "#666",
                          fontSize: "20px !important",
                        },
                        "&.active *": {
                          color: "#1976d2",
                          fontWeight: "bolder",
                        },
                      }}
                    >
                      <ListItemButton>
                        <ListItemText primary="Lịch Sử Đặt Hàng" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem
                      component={NavLink}
                      to={NavigationLink.ACCOUNT_USER_CART}
                      sx={{
                        "& *": {
                          color: "#666",
                          fontSize: "20px !important",
                        },
                        "&.active *": {
                          color: "#1976d2",
                          fontWeight: "bolder",
                        },
                      }}
                    >
                      <ListItemButton>
                        <ListItemText primary="Giỏ Hàng" />
                      </ListItemButton>
                    </ListItem>
                  </>
                ) : null}
              </List>
            </Grid>
            <Grid item xs={9}>
              {pathname.includes("info") && (
                <PersonalInfo
                  account={account}
                  handleFormChange={handleFormChange}
                  reloadHandler={setIsReload}
                  handleAccountMutation={mutateAsync}
                  accountId={id}
                />
              )}
              {pathname.includes("order") && orderId != null && (
                <UserOrderDetailsPage orderId={+orderId} accountId={+id} />
              )}
              {pathname.includes("order") && orderId == null && (
                <UserOrderPage />
              )}
              {pathname.includes("cart") && <UserCartPage account={account} />}
              {pathname.includes("payment") && (
                <StripeContainer account={account} />
              )}
            </Grid>
          </Grid>
        </Box>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isPending || isLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </Box>
    </>
  );
}

export default UserInfoPage;
