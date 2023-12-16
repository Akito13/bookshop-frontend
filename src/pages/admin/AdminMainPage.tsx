import {
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import Header from "../../components/Header";
import { Box } from "@mui/material";
import { useState } from "react";
import BookIcon from "@mui/icons-material/ImportContacts";
import OrderIcon from "@mui/icons-material/Receipt";
import StatisticIcon from "@mui/icons-material/Assessment";
import LoaiIcon from "@mui/icons-material/Apps";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { NavigationLink } from "../../utils/Constants";

const drawerWidth = 220;

const listLabels = ["Sách", "Loại", "Đơn hàng", "Thống kê"];
const listIcons = [
  <BookIcon />,
  <LoaiIcon />,
  <OrderIcon />,
  <StatisticIcon />,
];
const listNavigation = [
  NavigationLink.HOME_ADMIN,
  NavigationLink.ADMIN_LOAI,
  NavigationLink.ADMIN_ORDER,
  NavigationLink.ADMIN_STATS,
];

function AdminMenuDrawer() {
  return (
    <>
      <Toolbar sx={{ paddingY: 5 }} />
      <Divider />
      <List>
        {listLabels.map((text, index) => (
          <ListItem
            key={text}
            disablePadding
            component={NavLink}
            to={listNavigation[index]}
            sx={{
              "& *": {
                color: "#666",
              },
              "&.active *": {
                color: "#1976d2",
                fontWeight: "bolder",
              },
            }}
          >
            <ListItemButton key={text + ".btn"}>
              <ListItemIcon key={text + ".icon"}>
                {listIcons[index]}
              </ListItemIcon>
              <ListItemText
                key={text + ".txt"}
                primary={<Typography variant="h6">{text}</Typography>}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {/* <Divider />
      <List>
        {["Thêm đợt giảm giá", "Trash", "Spam"].map((text, index) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List> */}
    </>
  );
}

function AdminMenu() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  console.log(pathname);
  const handleSearchForm = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      navigate(
        {
          pathname: NavigationLink.HOME_ADMIN,
          search: `?ten=${(e.target as HTMLInputElement).value}`,
        },
        {
          replace: true,
        }
      );
    }
  };
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Header drawerWidth={drawerWidth} handleSearchForm={handleSearchForm} />
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          open
          variant="permanent"
          anchor="left"
        >
          <AdminMenuDrawer />
        </Drawer>
      </Box>
      <Box
        component={"main"}
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar sx={{ paddingY: 5 }} />
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminMenu;
