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
  rewrites: async () => {
    return [
      {
        source: '/sales',
        destination: 'https://campfire-sales-production.up.railway.app/sales',
      },
      {
        source: '/sales/:path*',
        destination: 'https://campfire-sales-production.up.railway.app/sales/:path*',
      },
    ]
  },
}

module.exports = nextConfig
