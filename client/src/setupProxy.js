const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    const proxy = createProxyMiddleware({
        target: 'http://host.docker.internal:3001',
        changeOrigin: true,
    });
    app.use('/auth/coinbase', proxy);
    app.use('/auth/coinbase/callback', proxy);
    app.use('/api', proxy);
};
