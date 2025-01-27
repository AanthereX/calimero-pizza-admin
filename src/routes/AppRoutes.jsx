import { lazy, Suspense } from "react";
import { Route, Routes, Outlet } from "react-router-dom";
import GridLoader from "react-spinners/GridLoader";
import Sidebar from "../components/Sidebar.jsx";

const routesArray = [
  {
    id: "1",
    path: "/dashboard",
    component: lazy(() => import("../pages/Home.jsx")),
  },
  {
    id: "2",
    path: "/special",
    component: lazy(() => import("../pages/Specials.jsx")),
  },
  {
    id: "3",
    path: "/notification",
    component: lazy(() => import("../pages/Notification.jsx")),
  },
  {
    id: "4",
    path: "/feedback",
    component: lazy(() => import("../pages/FeedBack.jsx")),
  },
  {
    id: "5",
    path: "/store",
    component: lazy(() => import("../pages/Store.jsx")),
  },
];
const Login = lazy(() => import("../pages/Login.jsx"));
const Dashboard = () => (
  <>
    <Sidebar>
      <Outlet />
    </Sidebar>
  </>
);
const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense
            fallback={
              <div className="min-h-screen grid place-content-center">
                <GridLoader size={12} color={"#ED3237"} />
              </div>
            }
          >
            {<Login />}
          </Suspense>
        }
      />

      <Route element={<Dashboard />}>
        {routesArray?.map((item) => (
          <Route
            key={item?.id}
            path={item?.path}
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen grid place-content-center">
                    <GridLoader size={12} color={"#ED3237"} />
                  </div>
                }
              >
                {<item.component />}
              </Suspense>
            }
          ></Route>
        ))}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
