import Box from "@mui/material/Box";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { Loai } from "../../types/SachType";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import { useCallback, useEffect, useState } from "react";
import { axiosPublic } from "../../services/axios";
import { APIURL } from "../../utils/Constants";
import toast from "react-hot-toast";
import axios, { CancelToken } from "axios";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import FormControl from "@mui/material/FormControl";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

function AdminLoai() {
  const [parentList, setParentList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const axiosPrivate = useAxiosPrivate();
  const fetchParentList = useCallback((cancelToken: CancelToken) => {
    axiosPublic
      .get<string[]>(`${APIURL.LOAI_BASE}/parents`, {
        cancelToken: cancelToken,
      })
      .then((res) => {
        console.log(res);
        setParentList(res.data);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          toast("Có lỗi xảy ra", { duration: 2 * 1000 });
          console.log(err);
        }
      });
  }, []);

  const { control, getValues, handleSubmit, formState, reset } = useForm<Loai>({
    defaultValues: {
      ma: "",
      ten: "",
      parent: "",
    },
    values: {
      ma: "",
      parent: "",
      ten: "",
    },
  });

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    fetchParentList(cancelToken.token);
    return () => cancelToken.cancel();
  }, []);

  const { ma, parent, ten } = getValues();

  const onSubmit: SubmitHandler<Loai> = (data, e) => {
    e?.preventDefault();
    console.log(data);
    setIsLoading(true);
    axiosPrivate
      .post(`${APIURL.LOAI_BASE}/new`, data)
      .then((res) => {
        console.log(res);
        toast.success("Thên thành công", { duration: 1.5 * 1000 });
        reset();
      })
      .catch((error) => {
        let message: string | null = null;
        if (axios.isAxiosError(error) && error.response != null) {
          const data = error.response.data;
          if (data && data.message != null) {
            message = data.message;
          } else {
            message = "Có lỗi xảy ra";
          }
          console.log(error);
        } else {
          message = "Có lỗi xảy ra";
          console.log("Error: ", error);
        }
        toast.error(message, { duration: 1.5 * 1000 });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Box sx={{ backgroundColor: "#f8f6f0", paddingY: 6, paddingX: 3 }}>
      <Box
        component="form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          display: "flex",
          paddingX: 5,
          paddingY: 4,
          marginBottom: 3,
          borderRadius: 3,
          border: "1px solid #aaa",
          minWidth: 30,
          backgroundColor: "#fff",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Controller
          name="ma"
          control={control}
          defaultValue={ma}
          rules={{
            required: { value: true, message: "Không bỏ trống" },
            minLength: { value: 4, message: "Không dưới 4 ký tự" },
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              fullWidth
              id="ma"
              label="Mã Loại"
              variant="outlined"
              {...field}
              style={{ marginBottom: 2 }}
              //   InputLabelProps={{ shrink: true }}
              error={error ? true : false}
              helperText={error ? error.message : " "}
            />
          )}
        />
        <Controller
          name="ten"
          control={control}
          defaultValue={ten}
          rules={{
            required: { value: true, message: "Không bỏ trống" },
            minLength: { value: 3, message: "Không dưới 3 ký tự" },
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              fullWidth
              id="ten"
              label="Tên Loại"
              variant="outlined"
              {...field}
              style={{ marginBottom: 2 }}
              //   InputLabelProps={{ shrink: true }}
              error={error ? true : false}
              helperText={error ? error.message : " "}
            />
          )}
        />
        <Controller
          name="parent"
          control={control}
          defaultValue={parent}
          rules={{
            validate: {
              validParent: (v) =>
                (v != null && v.trim() != "" && parentList.includes(v)) ||
                "Chưa chọn nhóm",
            },
          }}
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <InputLabel
                id="parent-select-label"
                {...(error != null && { sx: { color: "#d32f2f" } })}
                // sx={{ color: error ? "#d32f2f" : "inherit" }}
              >
                Nhóm Loại
              </InputLabel>
              <Select
                fullWidth
                id="parent-select"
                labelId="parent-select-label"
                variant="outlined"
                {...field}
                value={value}
                onChange={(e) => {
                  const selectedLoai = parentList.find(
                    (v) => v === e.target.value
                  );
                  if (selectedLoai) {
                    onChange(selectedLoai);
                  }
                }}
                style={{ marginBottom: 2 }}
                error={error ? true : false}
                label="Nhóm Loại"
              >
                {parentList &&
                  parentList.length > 0 &&
                  parentList.map((l) => (
                    <MenuItem
                      value={l}
                      // value={l}
                      key={l}
                    >
                      {l}
                    </MenuItem>
                  ))}
              </Select>
              <FormHelperText sx={{ color: "#d32f2f" }}>
                {error?.message ? error.message : " "}
              </FormHelperText>
            </FormControl>
          )}
        />
        <Stack direction="row" spacing={2} justifyContent="end">
          {formState.isDirty && (
            <>
              <Button variant="contained" color="error" onClick={() => reset()}>
                Hủy
              </Button>
              <LoadingButton
                type="submit"
                loading={isLoading}
                variant="contained"
                sx={{ mt: 3, mb: 2, ml: 3 }}
                // disabled={!formState.isValid}
              >
                <span>Thêm loại</span>
              </LoadingButton>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

export default AdminLoai;
