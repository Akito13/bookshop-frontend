import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";
import { useLocation, useNavigate } from "react-router-dom";
import { NavigationLink } from "../utils/Constants";
import { Account } from "../types/AccountType";
const PUBLIC_KEY =
  "pk_test_51ItEevAXD9G39dhQkqXpbDmFoLDemWpeRy8bfdRLRGfpB5JHyA24SDhUBSNfvTvX086rW3XXf1FBHtBKdMA417nb00bbQsQyU5";

const stripe = loadStripe(PUBLIC_KEY);
type StripeContainerProps = {
  account: Partial<Account>;
};
function StripeContainer({ account }: StripeContainerProps) {
  const { state } = useLocation();
  const navigate = useNavigate();
  if (!state || !state.order) {
    navigate(`${NavigationLink.ACCOUNT_USER_CART}`, { replace: true });
    return;
  }
  return (
    <Elements
      stripe={stripe}
      options={{
        mode: "payment",
        appearance: { theme: "stripe" },
        currency: "vnd",
        amount: +state.order.tongTien,
        paymentMethodCreation: "manual",
      }}
    >
      <PaymentForm order={state.order} account={account} />
    </Elements>
  );
}

export default StripeContainer;
