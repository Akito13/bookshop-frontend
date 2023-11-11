import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const navigateToSignUp = () => {
    navigate("/account/sign-up/");
  };
  return (
    <h1>
      Home Page
      <Button type="button" onClick={navigateToSignUp}>
        Đăng ký
      </Button>
    </h1>
  );
}

export default HomePage;
