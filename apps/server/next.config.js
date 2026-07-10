const nextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  async rewrites() {
    return [
      {
        source: "/auth/:path*",
        destination: "/api/auth/:path*",
      },
    ];
  },
};

export default nextConfig;
