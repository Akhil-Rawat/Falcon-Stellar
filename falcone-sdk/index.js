/**
 * Falcone SDK
 * Monetize your APIs with Stellar payments
 * 
 * @example
 * const { protect } = require('falcone-sdk');
 * 
 * app.get('/api/premium', protect({
 *   price: { amount: '5', asset: 'XLM' },
 *   receiver: 'GXXXXX...'
 * }), (req, res) => {
 *   res.json({ data: 'Premium content!' });
 * });
 */

const protect = require('./lib/protect');
const { registerAPI } = require('./lib/register');

module.exports = {
    protect,
    registerAPI,
};
