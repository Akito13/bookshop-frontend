import { styled } from "@mui/material";
import Button from "@mui/material/Button";
interface BackgroundBlendedButtonProps {
  toBackgroundColor: string;
  toColor: string;
  custombgColor: string;
  customColor: string;
}

export const BackgroundBlendedButton = styled(Button, {
  shouldForwardProp: (prop) => {
    return (
      prop !== "toBackgroundColor" &&
      prop !== "toColor" &&
      prop !== "custombgColor" &&
      prop !== "customColor"
    );
  },
})((prop: BackgroundBlendedButtonProps) => ({
  backgroundColor: prop.custombgColor,
  color: prop.customColor,
  boxShadow: "none",
  ":hover": {
    color: prop.toColor,
    backgroundColor: prop.toBackgroundColor,
    boxShadow: "none",
  },
}));
// export { BackgroundBlendedButton };
