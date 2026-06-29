export { default } from "next-auth/middleware";

// Public: /  and  /auth/*  and  /api/*
// Everything else requires login
export const config = {
  matcher: ["/user/:path*", "/profile/:path*", "/admin", "/dashboard/:path*"],
};
