/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/:path*',
        },
      ];
    },
  };
  
  module.exports = {
    async rewrites() {
      return [
        {
          source: '/modules/:moduleId/notes/note-title/:noteTitle',
          destination: '/modules/[moduleId]/notes/[noteTitle]',
        },
      ];
    },
  };
  