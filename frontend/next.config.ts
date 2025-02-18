import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	webpackDevMiddleware: (config: any) => {
		config.watchOptions = {
			poll: 1000,
			aggregateTimeout: 300,
		};
		return config;
	},
	swcMinify: true, // SWC での圧縮を有効化
};

export default nextConfig;
