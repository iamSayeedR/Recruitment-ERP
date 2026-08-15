/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict React mode for catching issues early
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' http://localhost:8081 http://localhost:8082 http://localhost:8083 http://localhost:8084 http://localhost:8085 http://127.0.0.1:8081 http://127.0.0.1:8082 http://127.0.0.1:8083 http://127.0.0.1:8084 http://127.0.0.1:8085 http://localhost:8180 http://127.0.0.1:8180 ws://localhost:3000 ws://localhost:8085 ws://127.0.0.1:8085",
              "frame-src 'self' http://localhost:8180 http://127.0.0.1:8180 http://localhost:9000",
              "frame-ancestors 'none'",
              "object-src 'self' data:",
              "base-uri 'self'",
              "form-action 'self' http://localhost:3000 http://127.0.0.1:3000 http://localhost:8180 http://127.0.0.1:8180",
            ].join('; '),
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000', // MinIO
      },
    ],
  },

  // Per-service API rewrites — each backend service on its own port
  async rewrites() {
    return [
      // Compliance service (port 8084)
      {
        source: '/api/v1/compliance',
        destination: 'http://127.0.0.1:8084/api/v1/compliance',
      },
      {
        source: '/api/v1/compliance/:path*',
        destination: 'http://127.0.0.1:8084/api/v1/compliance/:path*',
      },
      // Candidate service (port 8083)
      {
        source: '/api/v1/candidates',
        destination: 'http://127.0.0.1:8083/api/v1/candidates',
      },
      {
        source: '/api/v1/candidates/:path*',
        destination: 'http://127.0.0.1:8083/api/v1/candidates/:path*',
      },
      // Requisition service (port 8082)
      {
        source: '/api/v1/requisitions',
        destination: 'http://127.0.0.1:8082/api/v1/requisitions',
      },
      {
        source: '/api/v1/requisitions/:path*',
        destination: 'http://127.0.0.1:8082/api/v1/requisitions/:path*',
      },
      // IAM service / Branches / Clients (port 8081)
      {
        source: '/api/v1/branches',
        destination: 'http://127.0.0.1:8081/api/v1/branches',
      },
      {
        source: '/api/v1/branches/:path*',
        destination: 'http://127.0.0.1:8081/api/v1/branches/:path*',
      },
      {
        source: '/api/v1/clients',
        destination: 'http://127.0.0.1:8081/api/v1/clients',
      },
      {
        source: '/api/v1/clients/:path*',
        destination: 'http://127.0.0.1:8081/api/v1/clients/:path*',
      },
      {
        source: '/api/v1/users',
        destination: 'http://127.0.0.1:8081/api/v1/users',
      },
      {
        source: '/api/v1/users/:path*',
        destination: 'http://127.0.0.1:8081/api/v1/users/:path*',
      },
      {
        source: '/api/v1/iam/:path*',
        destination: 'http://127.0.0.1:8081/api/v1/iam/:path*',
      },
      // Gateway service: dashboard summary + activity + events (port 8085)
      {
        source: '/api/v1/dashboard/:path*',
        destination: 'http://127.0.0.1:8085/api/v1/dashboard/:path*',
      },
      {
        source: '/api/events/:path*',
        destination: 'http://127.0.0.1:8085/api/events/:path*',
      },
    ];
  },
};

import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
