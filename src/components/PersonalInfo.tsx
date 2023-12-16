import { ChangeEvent, Dispatch, useCallback, useEffect, useState } from "react";
import { Account } from "../types/AccountType";
import {
  FieldError,
  FieldPath,
  FieldValues,
  RegisterOptions,
  SubmitHandler,
  UseFormRegister,
  useForm,
} from "react-hook-form";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import {
  AccountMutationVairablesType,
  ParamAction,
  ParamActionString,
} from "../pages/UserInfoPage";
import EditIcon from "@mui/icons-material/BorderColor";
import FirstNameIcon from "@mui/icons-material/Group";
import LastNameIcon from "@mui/icons-material/AccountCircleOutlined";
import PhoneIcon from "@mui/icons-material/PhoneIphoneOutlined";
import AddressIcon from "@mui/icons-material/Home";
import { UseMutateAsyncFunction } from "@tanstack/react-query";
import toast from "react-hot-toast";

type InfoTextFieldProps<T extends FieldValues> = {
  register: UseFormRegister<T>;
  registerOptions: RegisterOptions<T, FieldPath<T>> | undefined;
  handleFormChange: (data: ParamActionString) => void;
  error: FieldError | undefined;
  errorMessage: string;
  label: string;
  icon: any;
  isEditing: boolean;
  field: {
    [P in keyof T]: {
      name: P;
      value: T[P];
      handleType: Pick<ParamActionString, "type">["type"];
    };
  }[keyof T];
};

function InfoTextField({
  register,
  registerOptions,
  handleFormChange,
  error,
  field,
  label,
  errorMessage,
  icon,
  isEditing,
}: InfoTextFieldProps<Account>) {
  return (
    <Paper
      variant="outlined"
      sx={{
        padding: 3,
        paddingBottom: 2,
        borderRadius: 6,
        border: "1px solid #666",
        height: 150,
      }}
    >
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
        marginBottom={2}
      >
        <Typography fontWeight="bold" variant="h6">
          {label}
        </Typography>
        {icon}
      </Box>
      <TextField
        type="text"
        size="small"
        variant="standard"
        placeholder={field.value ? "" : "Chưa có"}
        id={field.name}
        fullWidth
        // style={{
        //   overflow: "auto",
        //   wordBreak: "break-all",
        //   whiteSpace: "unset",
        // }}
        value={field.value ? field.value : ""}
        {...register(field.name, registerOptions)}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleFormChange({
            type: field.handleType,
            payload: e.target.value,
          })
        }
        error={error?.message != null}
        helperText={error ? errorMessage : ""}
        InputProps={{
          disableUnderline: true,
          readOnly: isEditing ? false : true,
        }}
      />
    </Paper>
  );
}
type PersonalInfoProps = {
  handleFormChange: (data: ParamAction) => void;
  account: Partial<Account>;
  reloadHandler: Dispatch<React.SetStateAction<boolean>>;
  handleAccountMutation: UseMutateAsyncFunction<
    any,
    Error,
    AccountMutationVairablesType,
    unknown
  >;
  accountId: number;
};
function PersonalInfo({
  handleFormChange,
  account,
  reloadHandler,
  handleAccountMutation,
  accountId,
}: PersonalInfoProps) {
  const {
    register,
    setValue,
    getValues,
    formState: { isValid, errors, isDirty },
    handleSubmit,
  } = useForm<Account>();

  const [isEditing, setIsEditing] = useState(false);

  const setAccount = useCallback((account: Partial<Account>) => {
    setValue("accountId", account.accountId as number);
    setValue("diaChi", account.diaChi as string, { shouldValidate: true });
    setValue("email", account.email as string);
    setValue("hoLot", account.hoLot as string, { shouldValidate: true });
    setValue("password", account.password);
    setValue("role", account.role as string);
    setValue("sdt", account.sdt as string, { shouldValidate: true });
    setValue("ten", account.ten as string, { shouldValidate: true });
  }, []);

  useEffect(() => {
    setAccount(account);
  }, [account]);

  const { diaChi, hoLot, sdt, ten } = getValues();

  const toggleEditMode = () => setIsEditing((prev) => !prev);

  // const inputHasChange = (inputData: Account) => {
  //   let key: keyof Account;
  //   for (key in inputData) {
  //     // if (inputData[key] !== account[key]) {
  //     //   console.log
  //     //   return true;
  //     // }
  //     console.log(inputData[key], "\t", account[key]);
  //   }
  //   return false;
  // };

  const onSubmit: SubmitHandler<Account> = (data, e) => {
    e?.preventDefault();
    console.log("It was true");
    handleAccountMutation({ id: +accountId, account: data })
      .then((res) => console.log("After udpating account: ", res))
      .catch((err) => {
        console.log("Error khi cập nhật tài khoản");
        console.log(err);
        toast.error(err);
      })
      .finally(() => {
        toggleEditMode();
        reloadHandler((prev) => !prev);
      });
  };

  const cancelChange = () => {
    toggleEditMode();
    reloadHandler((prev) => !prev);
  };

  return (
    <>
      <Box
        sx={{
          mb: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5" fontSize={30} paddingX={2} fontWeight={"bold"}>
          Thông tin cá nhân
        </Typography>
        {!isEditing && (
          <Button
            variant="contained"
            endIcon={<EditIcon />}
            style={{ fontSize: "16px" }}
            onClick={toggleEditMode}
          >
            Sửa
          </Button>
        )}
      </Box>
      <Box>
        <Grid
          container
          columns={{ xs: 4, lg: 6, xl: 12 }}
          spacing={{ xs: 2, md: 3 }}
          marginBottom={3}
        >
          <Grid item xs={2} lg={2} xl={3}>
            <InfoTextField
              key={"hl"}
              label="Họ và Tên Lót"
              error={errors.hoLot}
              field={{ name: "hoLot", value: hoLot, handleType: "HOLOT" }}
              register={register}
              registerOptions={{ minLength: 1, required: true }}
              handleFormChange={handleFormChange}
              errorMessage={"Tối thiểu 1 ký tự"}
              icon={<FirstNameIcon color="primary" fontSize="large" />}
              isEditing={isEditing}
            />
          </Grid>
          <Grid item xs={2} lg={2} xl={3}>
            <InfoTextField
              key={"ten"}
              label="Tên"
              error={errors.ten}
              field={{ name: "ten", value: ten, handleType: "TEN" }}
              handleFormChange={handleFormChange}
              register={register}
              registerOptions={{ minLength: 1, required: true }}
              errorMessage="Tối thiểu 1 ký tự"
              icon={<LastNameIcon color="primary" fontSize="large" />}
              isEditing={isEditing}
            />
          </Grid>
          <Grid item xs={2} lg={2} xl={3}>
            <InfoTextField
              key={"sdt"}
              label="Số Điện Thoại"
              error={errors.sdt}
              field={{ name: "sdt", value: sdt, handleType: "SDT" }}
              handleFormChange={handleFormChange}
              register={register}
              errorMessage="Tối thiểu 10 ký tự số"
              registerOptions={{ pattern: /^0(\d){9,10}$/g }}
              icon={<PhoneIcon color="primary" fontSize="large" />}
              isEditing={isEditing}
            />
          </Grid>
          <Grid item xs={2} lg={2} xl={3}>
            <InfoTextField
              key={"dch"}
              label="Địa chỉ"
              error={errors.diaChi}
              field={{ name: "diaChi", value: diaChi, handleType: "DIACHI" }}
              handleFormChange={handleFormChange}
              register={register}
              errorMessage=""
              registerOptions={{}}
              icon={<AddressIcon color="primary" fontSize="large" />}
              isEditing={isEditing}
            />
          </Grid>
        </Grid>
        {isEditing && (
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={cancelChange}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit(onSubmit)}
              type="submit"
              disabled={isDirty && !isValid}
            >
              Lưu thay đổi
            </Button>
          </Stack>
        )}
      </Box>
    </>
  );
}

export default PersonalInfo;
