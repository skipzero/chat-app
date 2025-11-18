import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,

  allowedDevOrigins: ['192.168.68.71', '*.local-origin.dev'], // future proofing for dev environments
};

export default nextConfig;
