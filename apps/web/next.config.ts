import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: true,  
};

export default nextConfig;
