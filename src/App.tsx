import "./App.css";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ConfirmPage from "./pages/ConfirmPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { duration } from "@mui/material";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/sach", element: <ProductsPage /> },
  {
    path: "/account",
    children: [
      { path: "sign-in", element: <SignInPage /> },
      {
        path: "sign-up",
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <SignUpPage />,
          },
          { path: "confirmation", element: <ConfirmPage /> },
        ],
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
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
            style: {
              fontSize: "16px",
              maxWidth: "500px",
              padding: "16px 24px",
              // backgroundColor: "#363636",
              // color: "#fff",
            },
          }}
        />
      </QueryClientProvider>
    </>
  );
}

export default App;
