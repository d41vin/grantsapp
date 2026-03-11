import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "@clerk/nextjs"],
  },
};

export default nextConfig;
