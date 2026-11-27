import { createBrowserRouter } from "react-router";

// Each page is loaded only when its route is visited
export const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => ({ Component: (await import("@/pages/Home")).default }),
  },
  {
    path: "*",
    lazy: async () => ({ Component: (await import("@/pages/NotFound")).default }),
  },
]);
