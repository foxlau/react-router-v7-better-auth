import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  // User routes
  layout("routes/layout.tsx", [
    route("dashboard", "routes/dashboard.tsx"),
    route("todos", "routes/todos.tsx"),
    route("change-password", "routes/change-password.tsx"),
  ]),

  // Better Auth
  ...prefix("auth", [
    layout("routes/auth/layout.tsx", [
      route("sign-in", "routes/auth/sign-in.tsx"),
      route("sign-up", "routes/auth/sign-up.tsx"),
      route("sign-out", "routes/auth/sign-out.tsx"),
      route("reset-password", "routes/auth/reset-password.tsx"),
      route("forget-password", "routes/auth/forget-password.tsx"),
    ]),
  ]),

  // Better Auth API
  route("api/auth/error", "routes/auth/better-error.tsx"),
  route("api/auth/*", "routes/auth/better.tsx"),
] satisfies RouteConfig;
