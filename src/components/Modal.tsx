import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import React from "react";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

type BasicModalProps = {
  open: boolean;
  content: string;
  handleClose: () => void;
  handleConfirm: () => void;
};

export default function BasicModal({
  open,
  handleClose,
  handleConfirm,
  content,
}: BasicModalProps) {
  // const [open, setOpen] = React.useState(false);
  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Xác nhận
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {content}
          </Typography>
          <Box
            sx={{ paddingTop: 2, display: "flex", justifyContent: "flex-end" }}
          >
            <Button variant="contained" onClick={handleClose} color="error">
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              style={{ marginLeft: 10 }}
            >
              Đồng ý
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
