const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
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
}

module.exports = nextConfig
