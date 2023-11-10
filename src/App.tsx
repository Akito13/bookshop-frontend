import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ConfirmPage from "./pages/ConfirmPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/sach", element: <ProductsPage /> },
  {
    path: "/account",
    children: [
      { path: "sign-in", element: <SignInPage /> },
      {
        path: "sign-up",
        element: <SignUpPage />,
        children: [{ path: "confirmation", element: <ConfirmPage /> }],
      },
    ],
  },
  // { path: "/confirm-password", element: <ConfirmPage /> },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <RouterProvider router={router}></RouterProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
