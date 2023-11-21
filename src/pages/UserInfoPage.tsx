import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  // Theme,
  Typography,
  styled,
  // createStyles,
  // makeStyles,
} from "@mui/material";
import React, {
  ChangeEvent,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import Header from "../components/Header";
import { APIURL, CookieKey, NavigationLink } from "../utils/Constants";
import { NavLink, useNavigate } from "react-router-dom";
import CustomNavLink from "../components/CustomNavLink";
import useCookie from "../hooks/useCookie";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import axios from "axios";
import {
  ApiResponseFieldError,
  ApiResponseSuccess,
} from "../types/ResponseType";
import { Account } from "../types/AccountType";
import { SubmitHandler, useForm } from "react-hook-form";
import PersonalInfo from "../components/PersonalInfo";
import { useMutation } from "@tanstack/react-query";

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
  const [isReload, setIsReload] = useState(false);
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
                  to={NavigationLink.ACCOUNT_USER_INFO}
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
              </List>
            </Grid>
            <Grid item xs={9}>
              <PersonalInfo
                account={account}
                handleFormChange={handleFormChange}
                reloadHandler={setIsReload}
                handleAccountMutation={mutateAsync}
                accountId={id}
              />
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
