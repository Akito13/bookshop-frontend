import {
  CardElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  CreatePaymentMethodData,
  CreatePaymentMethodFromElements,
} from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { APIURL, NavigationLink } from "../utils/Constants";
import toast from "react-hot-toast";
import { Box, TextField } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { OrderType } from "../types/OrderType";
import { Account } from "../types/AccountType";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import CustomBackDrop from "./CustomBackdrop";

type PaymentFormProps = {
  order: Partial<OrderType>;
  account: Partial<Account>;
};

function PaymentForm({ order, account }: PaymentFormProps) {
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const [ten, setTen] = useState("");
  const queryCLient = useQueryClient();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  useEffect(() => {
    if (!stripe) {
      return;
    }
  }, [stripe]);

  const handleSubmit = async (e: any) => {
    e?.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    // stripe.createPaymentMethod({elements, params: {type: "card"}} as CreatePaymentMethodFromElements)
    try {
      elements.submit().then((res) => setIsLoading(false));
      const result = await stripe?.createPaymentMethod({
        elements,
        params: { billing_details: { name: ten, email: account.email } },
      } as CreatePaymentMethodFromElements);

      // card: elements.getElement(CardElement),
      // billing_details: { name: ten, email: account.email },
      // } as CreatePaymentMethodData);

      console.log(result);
      if (!result?.error) {
        const paymentMethod = result?.paymentMethod;
        const data = {
          order: order,
          paymentId: paymentMethod.id,
          cardHolder: ten,
          receiptEmail: account.email,
        };
        axiosPrivate
          .post<number>(APIURL.ORDER_CREATE, data)
          .then((res) => {
            toast.success("Đặt hàng thành công");
            const orderId = res.data;
            axiosPrivate
              .delete(`${APIURL.CART_BASE}/${account.accountId}`)
              .then((res) => {
                queryCLient.invalidateQueries({ queryKey: ["cartAmount"] });
                navigate(`${NavigationLink.ACCOUNT_USER_ORDER}/${orderId}`, {
                  replace: true,
                });
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => {
            console.log(err);
            if (err.response && err.response.data) {
              const data = err.response.data;
              toast.error(data.message ? data.message : "Có lỗi xảy ra", {
                duration: 2 * 1000,
              });
            }
          })
          .finally(() => setIsLoading(false));
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  return (
    <Box
      component={"form"}
      onSubmit={handleSubmit}
      sx={{
        width: "30vw",
        minWidth: "500px",
        margin: "auto",
        borderRadius: "7px",
        padding: "40px",
      }}
    >
      <CustomBackDrop isLoading={isLoading} />
      <TextField
        name="ten"
        fullWidth
        required
        id="ten"
        label="TÊN CHỦ THẺ"
        onChange={(e) => setTen(e.target.value)}
        sx={{
          borderRadius: "6px",
          marginBottom: "16px",
          border: "1px solid rgba(50, 50, 93, 0.1)",
          fontSize: "16px",
          width: "100%",
          background: "#fff",
        }}
      />
      <PaymentElement
        options={{
          layout: {
            type: "accordion",
            defaultCollapsed: true,
            radios: true,
            spacedAccordionItems: true,
          },

          fields: {
            billingDetails: {
              name: "auto",
              email: "auto",
            },
          },
          terms: { card: "always" },
        }}
      />
      <LoadingButton
        fullWidth
        type="submit"
        loading={isLoading}
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        <span>Thanh Toán</span>
      </LoadingButton>
    </Box>
  );
}

export default PaymentForm;
