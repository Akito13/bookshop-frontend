export type AccountRegistration = {
  email: string;
  password: string;
  hoLot: string;
  ten: string;
};

export type AccountSignIn = {
  email: string;
  password: string;
};

export type Account = {
  accountId: number;
  hoLot: string;
  ten: string;
  sdt: string;
  email: string;
  password: null;
  role: string;
};
