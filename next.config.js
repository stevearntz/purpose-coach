const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  redirects: async () => {
    return [
      {
        source: '/hr-partnership',
        destination: '/people-leader-needs',
        permanent: true,
      },
      {
        source: '/hr-partnership/:path*',
        destination: '/people-leader-needs/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
