/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/channels/me',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
