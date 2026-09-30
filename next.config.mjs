/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    '/*': ['./prisma/dev.db'],
    '/api/*': ['./prisma/dev.db'],
  },
};

export default nextConfig;
