import Box from "@mui/material/Box";
import Header from "../../components/Header";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { NavLink, Navigate, useNavigate } from "react-router-dom";
import { NavigationLink } from "../../utils/Constants";

type ErrorPageProps = {
  code: number;
  text: string;
};

export default function ErrorPage({ code, text }: ErrorPageProps) {
  const navigate = useNavigate();
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
      <Header handleSearchForm={handleSearchForm} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h1" style={{ color: "grey", fontSize: 250 }}>
          {code}
        </Typography>
        <Typography variant="h6" style={{ color: "grey", fontSize: 30 }}>
          {text}
        </Typography>
        <NavLink to={NavigationLink.HOME_USER}>
          <Button variant="contained" sx={{ mt: 5 }}>
            Về trang chủ
          </Button>
        </NavLink>
      </Box>
    </>
  );
}
