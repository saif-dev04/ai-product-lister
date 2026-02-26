const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prioritize web-specific extensions
config.resolver.sourceExts = ['web.tsx', 'web.ts', 'web.js', ...config.resolver.sourceExts];

module.exports = config;
