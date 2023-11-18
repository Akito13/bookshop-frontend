import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import { BackgroundBlendedButton } from "./HoverEffect";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { Badge, BadgeProps, Box, styled } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import CheckAuthentication from "./CheckAuthentication";
import useCookie from "../hooks/useCookie";
import { APIURL, CookieKey, NavigationLink } from "../utils/Constants";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { QueryFunctionContext, useQuery } from "@tanstack/react-query";
import TextField from "@mui/material/TextField";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import axios from "axios";

const userSettings = ["Tài khoản", "Đơn hàng", "Thoát"];
const adminSettings = ["Tài khoản", "Thoát"];

type HeaderProps = {
  drawerWidth?: number;
  handleSearchForm: (e: React.KeyboardEvent<HTMLFormElement>) => void;
};

export type CartAmountParam = [string, id: number];

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: -6,
    top: 3,
    border: `2px solid #fff`,
    padding: "0 4px",
    color: "#1976d2 !important",
    fontWeight: "bold",
    backgroundColor: "#fff",
  },
}));

function Header({ drawerWidth = 0, handleSearchForm }: HeaderProps) {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const [id, _, clearId] = useCookie(CookieKey.ACCOUNT_ID);
  const [jwt, __, clearJwt] = useCookie(CookieKey.JWT);
  const [authority, ___, clearAuth] = useCookie(CookieKey.AUTHORITY);
  const axiosPrivate = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();

  const getCartAmount = async (
    param: QueryFunctionContext<CartAmountParam>
  ) => {
    const [_, id] = param.queryKey;
    if (id == null || isNaN(+id) || id === 0) return null;
    console.log("Again " + id);
    try {
      const response = await axiosPrivate.get<number>(
        `${APIURL.CART_BASE}/${id}/amount`
      );
      console.log(response);
      return response.data;
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err) && err.response) {
        return err.response.data;
      }
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["cartAmount", +id],
    queryFn: getCartAmount,
  });

  // React.useEffect(() => {
  //   refetch().then(res => console.log(res)).catch(error => console.log(error))
  // }, [])

  const isLoggedIn = id != null && jwt != null;

  const noCartAmount =
    (!data || (isNaN(data) && "errors" in data)) && !isLoading;

  console.log(`From Header Cart Amount: ${noCartAmount} and the data is:`);
  console.log(`${data}`);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(null);
    const settings = e.currentTarget.id.split(".");
    const setting = settings[0];
    const authority = settings[1];
    if (authority === "admin") {
      handleAdminSetting(setting);
    } else if (authority === "user") {
      handleUserSetting(setting);
    }
  };

  const handleUserSetting = (setting: string) => {
    switch (setting) {
      case userSettings[0]: {
        navigate(NavigationLink.ACCOUNT_USER_INFO, {
          replace: true,
          state: { from: location },
        });
        break;
      }
      // case userSettings[1]: {
      //   navigate(NavigationLink.ACCOUNT_USER_CART, {
      //     replace: true,
      //     state: { from: location },
      //   });
      //   break;
      // }
      case userSettings[2]: {
        clearAuth();
        clearId();
        clearJwt();
        navigate(NavigationLink.SIGN_IN, { replace: true });
        break;
      }
    }
  };

  const handleAdminSetting = (setting: string) => {
    switch (setting) {
      case adminSettings[0]: {
        navigate(NavigationLink.ACCOUNT_ADMIN_INFO, { replace: true });
        break;
      }
    }
  };

  return (
    <AppBar
      sx={{
        width: `calc(100% - ${drawerWidth}px)`,
        ml: `${drawerWidth}px`,
      }}
    >
      <Container maxWidth="xl" sx={{ maxHeight: 150, paddingY: 1 }}>
        <Toolbar disableGutters>
          <NavLink
            to={NavigationLink.HOME_USER}
            color="inherit"
            style={{
              marginRight: 50,
              flexGrow: 0,
              display: "flex",
              textDecoration: "none",
            }}
          >
            <AutoStoriesIcon
              sx={{
                display: { xs: "none", md: "flex" },
                mr: 1,
                color: "#fff",
                marginRight: 3,
              }}
            />
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "#fff",
                textDecoration: "none",
                flexGrow: 1,
                textDecorationLine: "none",
              }}
            >
              BookShop
            </Typography>
          </NavLink>
          <Box flexGrow={1} component={"form"} onKeyDown={handleSearchForm}>
            <TextField
              type="search"
              label="Tìm sách mong muốn"
              variant="filled"
              InputProps={{ sx: { "& fieldset": { borderRadius: 3 } } }}
              sx={{
                input: {
                  color: "#1976d2",
                  backgroundColor: "#fff",
                  paddingLeft: "20px",
                },
                label: {
                  color: "#1976d2",
                  "&.Mui-focused": {
                    color: "#1976d2",
                    backgroundColor: "#fff",
                  },
                  paddingLeft: "10px",
                },
                div: {
                  backgroundColor: "#fff",
                  overflow: "hidden",
                  borderRadius: "18px",
                },
                width: "80%",
              }}
            />
          </Box>
          <CheckAuthentication isShowedWhen={isLoggedIn}>
            <Box sx={{ flexGrow: 0 }}>
              <CssBaseline />
              <NavLink
                to={NavigationLink.ACCOUNT_USER_CART}
                replace
                state={{ from: location }}
              >
                <IconButton
                  aria-label="cart"
                  size="large"
                  sx={{ padding: 2, marginX: 3 }}
                >
                  <StyledBadge
                    badgeContent={
                      noCartAmount ? 0 : typeof data == "object" ? 0 : data
                    }
                  >
                    <ShoppingCartIcon sx={{ color: "#fff" }} fontSize="large" />
                  </StyledBadge>
                </IconButton>
              </NavLink>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px", ml: "50px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {authority == "ROLE_USER"
                  ? userSettings.map((setting) => (
                      <MenuItem
                        id={setting + ".user"}
                        key={setting}
                        onClick={handleCloseUserMenu}
                      >
                        <Typography textAlign="center">{setting}</Typography>
                      </MenuItem>
                    ))
                  : adminSettings.map((setting) => (
                      <MenuItem
                        id={setting + ".admin"}
                        key={setting}
                        onClick={handleCloseUserMenu}
                      >
                        <Typography textAlign="center">{setting}</Typography>
                      </MenuItem>
                    ))}
              </Menu>
            </Box>
          </CheckAuthentication>
          <CheckAuthentication isShowedWhen={!isLoggedIn}>
            <NavLink to={NavigationLink.SIGN_IN} state={{ from: location }}>
              <BackgroundBlendedButton
                customColor="#fff"
                toColor="#1976d2"
                custombgColor="#1976d2"
                toBackgroundColor="#fff"
                variant="contained"
              >
                Đăng nhập
              </BackgroundBlendedButton>
            </NavLink>
          </CheckAuthentication>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Header;
