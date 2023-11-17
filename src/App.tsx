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
import Layout from "./layouts/Layout";
import RequireAuth from "./components/RequireAuth";
import AdminMenu from "./pages/AdminMainPage";
import { Authority } from "./utils/Constants";
import ErrorPage from "./pages/exceptions/ErrorPage";
import SachDetails from "./pages/SachDetailsPage";
import UserInfo from "./pages/UserInfoPage";
import UserCartPage from "./pages/UserCartPage";
import AdminInfoPage from "./pages/AdminInfoPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "sach",
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <ProductsPage />,
          },
          {
            path: ":sachId",
            element: <SachDetails />,
          },
        ],
      },

      {
        path: "*",
        element: <ErrorPage code={404} text="Trang này không tồn tại" />,
      },
      {
        path: "unauthorized",
        element: <ErrorPage code={403} text="Bạn không có quyền truy cập" />,
      },
      {
        path: "not-found",
        element: <ErrorPage code={404} text="Trang này không tồn tại" />,
      },
      {
        path: "account",
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
          {
            element: <RequireAuth allowedAuthority="ROLE_USER" />,
            children: [
              {
                path: "info",
                element: <UserInfo />,
              },
              {
                path: "cart",
                element: <UserCartPage />,
              },
            ],
          },
        ],
      },
      {
        element: <RequireAuth allowedAuthority="ROLE_ADMIN" />,
        children: [
          {
            path: "admin",
            element: <Outlet />,
            children: [
              { index: true, element: <AdminMenu /> },
              {
                path: "info",
                element: <AdminInfoPage />,
              },
            ],
          },
        ],
      },
    ],
  },
  // { path: "/confirm-password", element: <ConfirmPage /> },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnWindowFocus: false,
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
