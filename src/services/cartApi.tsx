import axios from "axios";
import { APIURL } from "../utils/Constants";
import { QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

type CartAmountParam = [string, id: number];

export const getCartAmount = async (
  param: QueryFunctionContext<CartAmountParam>
) => {
  const [_, id] = param.queryKey;
  if (id == null || isNaN(+id) || id === 0) return null;
  console.log("Again " + id);
  const axiosPrivate = useAxiosPrivate();
  try {
    const response = await axiosPrivate.get<number>(
      `${APIURL.CART_BASE}/${id}/amount`
    );
    console.log(response);
    return response.data;
  } catch (err) {
    console.log(err);
    if (axios.isAxiosError(err) && err.response) {
      return err.response.data;
    }
  }
};
