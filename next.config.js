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
      {
        source: '/lab',
        destination: 'https://connection-lab-production.up.railway.app/lab',
      },
      {
        source: '/lab/:path*',
        destination: 'https://connection-lab-production.up.railway.app/lab/:path*',
      },
      {
        source: '/games',
        destination: 'https://campfire-games-production.up.railway.app/games',
      },
      {
        source: '/games/:path*',
        destination: 'https://campfire-games-production.up.railway.app/games/:path*',
      },
      {
        source: '/from-day-one',
        destination: 'https://from-day-one.vercel.app/from-day-one',
      },
      {
        source: '/from-day-one/:path*',
        destination: 'https://from-day-one.vercel.app/from-day-one/:path*',
      },
    ]
  },
}

module.exports = nextConfig
