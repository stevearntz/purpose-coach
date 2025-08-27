import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  redirects: async () => {
    return [
      {
        source: '/people-leader-needs',
        destination: '/hr-partnership',
        permanent: false,
      },
      {
        source: '/people-leader-needs/:path*',
        destination: '/hr-partnership/:path*',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;