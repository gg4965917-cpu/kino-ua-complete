/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'api.themoviedb.org' },
      { protocol: 'https', hostname: 'commondatastorage.googleapis.com' },
    ],
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
