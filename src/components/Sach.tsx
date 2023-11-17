import { useState } from "react";

import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { SachType } from "../types/SachType";
import formatNumber from "../utils/numberFormatter";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { NavLink, Navigate } from "react-router-dom";
import { NavigationLink } from "../utils/Constants";

type SachProps = {
  sach: SachType;
};

export default function Sach({ sach }: SachProps) {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card
      sx={{
        maxWidth: 225,
        margin: "auto",
        minHeight: 280,
        boxShadow: "0 2px 10px 1px #888",
        borderRadius: 2,
      }}
    >
      <CardMedia
        component="img"
        height="150"
        image={sach.anh}
        alt="Paella dish"
        sx={{
          objectFit: "contain",
        }}
      />
      <CardContent
        sx={{
          padding: "10px 5px 10px 10px",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginTop: 3,
        }}
      >
        <Typography
          color="text.secondary"
          height={20}
          minWidth={200}
          fontSize={14}
        >
          NXB: {sach.nxb}
        </Typography>
        <Typography
          height={30}
          minWidth={200}
          noWrap
          sx={{
            fontSize: "17px",
          }}
          color="text.secondary"
        >
          {sach.ten}
        </Typography>
        <Typography
          color="#C92127"
          height={20}
          minWidth={200}
          fontSize={18}
          fontWeight={"bold"}
          mt={2}
        >
          {formatNumber(sach.giaSach.giaBan)} đ
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="Thêm vào cart">
          <AddShoppingCartRoundedIcon />
        </IconButton>
        <NavLink to={NavigationLink.SACH_BASE + `/${sach.id}`}>
          <IconButton aria-label="Xem chi tiết">
            <InfoOutlinedIcon />
          </IconButton>
        </NavLink>
        {/* <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore> */}
      </CardActions>
      {/* <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>Method:</Typography>
          <Typography paragraph>
            Heat 1/2 cup of the broth in a pot until simmering, add saffron and
            set aside for 10 minutes.
          </Typography>
          <Typography paragraph>
            Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet
            over medium-high heat. Add chicken, shrimp and chorizo, and cook,
            stirring occasionally until lightly browned, 6 to 8 minutes.
            Transfer shrimp to a large plate and set aside, leaving chicken and
            chorizo in the pan. Add pimentón, bay leaves, garlic, tomatoes,
            onion, salt and pepper, and cook, stirring often until thickened and
            fragrant, about 10 minutes. Add saffron broth and remaining 4 1/2
            cups chicken broth; bring to a boil.
          </Typography>
          <Typography paragraph>
            Add rice and stir very gently to distribute. Top with artichokes and
            peppers, and cook without stirring, until most of the liquid is
            absorbed, 15 to 18 minutes. Reduce heat to medium-low, add reserved
            shrimp and mussels, tucking them down into the rice, and cook again
            without stirring, until mussels have opened and rice is just tender,
            5 to 7 minutes more. (Discard any mussels that don&apos;t open.)
          </Typography>
          <Typography>
            Set aside off of the heat to let rest for 10 minutes, and then
            serve.
          </Typography>
        </CardContent>
      </Collapse> */}
    </Card>
  );
}
