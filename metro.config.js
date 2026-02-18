const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Добавляем поддержку TypeScript
config.resolver.sourceExts.push('ts', 'tsx');

// Настройка для web platform
config.resolver.platforms = ['ios', 'android', 'web', 'native'];

module.exports = config;