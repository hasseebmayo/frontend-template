import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  reactCompiler: true,

  devIndicators: {
    position: "bottom-right",
  },
  typedRoutes: true,
};

export default nextConfig;
