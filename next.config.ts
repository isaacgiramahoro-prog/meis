/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.8.115'],
  // Or to allow all local network devices:
  // allowedDevOrigins: ['localhost', '*.local', '192.168.8.*'],
}

module.exports = nextConfig