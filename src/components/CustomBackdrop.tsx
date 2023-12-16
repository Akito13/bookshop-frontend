import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

type CustomBackdropProps = {
  isLoading: boolean;
};

function CustomBackDrop({ isLoading }: CustomBackdropProps) {
  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

export default CustomBackDrop;
