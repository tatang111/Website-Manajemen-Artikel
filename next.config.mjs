/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            's3.sellerpintar.com',
            'another-domain.com',
            'cdn.example.com'
        ],
    }
};

export default nextConfig;
