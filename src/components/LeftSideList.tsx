import List from "@mui/material/List";
import React, { useEffect, useState } from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ListSubheader from "@mui/material/ListSubheader";
import { axiosPublic } from "../services/axios";
import { APIURL, NavigationLink } from "../utils/Constants";
import axios from "axios";

// interface LoaiListChildComponentProps extends ListChildComponentProps {
//   ten: string;
// }

// function renderRow(props: LoaiListChildComponentProps) {
//     const {index, style} = props;
//     return <ListItem>
//         <ListItemButton>
//             <ListItemText primary/>
//         </ListItemButton>
//     </ListItem>
// }

type LoaiParentOpenType = {
  [key: string]: boolean;
};

type LoaiChangeHandlerProps = {
  loaiChangeHandler: (maLoai: string) => void;
};

function LeftSideList({ loaiChangeHandler }: LoaiChangeHandlerProps) {
  const [tenLoaiParents, setTenLoaiParents] = useState<LoaiParentOpenType[]>();
  const [data, setData] = useState();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  //   const { data, error, isLoading } = useQuery({
  //     queryKey: ["loaiParent"],
  //     queryFn: retrieveLoaiByParent,
  //     staleTime: 1000 * 60 * 20,
  //   });
  const [distance, setDistance] = useState<number[]>([]);
  const handleListItemClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
  };

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    async function retrieveLoaiByParentGroup() {
      try {
        const response = await axiosPublic.get(`${APIURL.LOAI_BASE}/all`, {
          cancelToken: cancelToken.token,
        });
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    }
    retrieveLoaiByParentGroup()
      .then((res) => {
        const tempDistance = [0];
        let sum = 0;
        res.data.forEach((l: any) => {
          sum += l.loais.length;
          tempDistance.push(sum);
        });
        setDistance(tempDistance);
        setData(res.data);
      })
      .catch((err) => {
        if (axios.isCancel(err)) {
        }
      });

    return () => {
      cancelToken.cancel();
    };
  }, []);
  useEffect(() => {
    if (data) {
      console.log(data);
      const loais: LoaiParentOpenType[] = [];

      data.forEach((l: any) => {
        loais.push({ [l.parent]: false });
      });
      setTenLoaiParents(loais);
    }
  }, [data]);
  return (
    <List
      sx={{
        width: "100%",
        maxWidth: 360,
        minHeight: 400,
        bgcolor: "background.paper",
        overflow: "visible",
        borderRadius: "9px 9px 8px 8px",
        borderBottom: "1px solid #1976d2",
        borderLeft: "1px solid #1976d2",
        borderRight: "1px solid #1976d2",
      }}
      component="nav"
      aria-labelledby="loai-subheader"
      subheader={
        <ListSubheader
          component="div"
          id="loai-subheader"
          sx={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#fff",
            background: "#1976d2",
            borderRadius: "8px 8px 0 0",
          }}
        >
          Thể loại sách
        </ListSubheader>
      }
    >
      {data &&
        tenLoaiParents?.length > 0 &&
        tenLoaiParents.map((l: any, i: number) => (
          <>
            <ListItemButton
              key={`${data[i].parent}`}
              onClick={() => {
                const copyTenLoaiParents = (
                  tenLoaiParents as LoaiParentOpenType[]
                ).slice();
                const currentState = copyTenLoaiParents[i][data[i].parent];
                copyTenLoaiParents[i][data[i].parent] = !currentState;
                setTenLoaiParents(copyTenLoaiParents);
              }}
            >
              <ListItemText
                key={`${data[i].parent + "listItemText"}`}
                primary={`${data[i].parent}`}
              />
              {tenLoaiParents[i][data[i].parent] ? (
                <ExpandLess key={`${data[i].parent + "expandLess"}`} />
              ) : (
                <ExpandMore key={`${data[i].parent + "expandMore"}`} />
              )}
            </ListItemButton>
            {data[i].loais.map((loai: any, index: number) => (
              <Collapse
                key={loai.ma}
                in={tenLoaiParents[i][data[i].parent]}
                timeout="auto"
                unmountOnExit
              >
                <List
                  key={loai.ma + "list"}
                  component="div"
                  disablePadding
                  onClick={() => loaiChangeHandler(loai.ma)}
                >
                  <ListItemButton
                    key={loai.ma + "listItemBtn"}
                    sx={{ pl: 4 }}
                    selected={selectedIndex === index + distance[i]}
                    onClick={(event) => {
                      handleListItemClick(event, index + distance[i]);
                    }}
                  >
                    <ListItemText
                      key={loai.ma + "listItemText"}
                      primary={loai.ten}
                    />
                  </ListItemButton>
                </List>
              </Collapse>
            ))}
          </>
        ))}
    </List>
  );
}

export default LeftSideList;
