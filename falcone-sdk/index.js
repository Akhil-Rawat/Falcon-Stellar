/**
 * Falcone SDK
 * Monetize your APIs with Stellar payments
 *
 * Two Payment Modes:
 * 1. Pay-per-call: Direct payment for each API call
 * 2. Prepaid Escrow: Users prepay to escrow, then consume credits
 *
 * @example Pay-per-call mode
 * const { protect } = require('falcone-sdk');
 *
 * app.get('/api/premium', protect({
 *   price: { amount: '5', asset: 'XLM' },
 *   receiver: 'GXXXXX...'
 * }), (req, res) => {
 *   res.json({ data: 'Premium content!' });
 * });
 *
 * @example Prepaid Escrow mode
 * const { protectWithEscrow } = require('falcone-sdk');
 *
 * app.get('/api/premium', protectWithEscrow({
 *   apiId: 'my-api',
 *   apiOwnerId: 'GXXXXX...',
 *   pricePerCall: 5,
 * }), (req, res) => {
 *   res.json({ data: 'Premium content!', balance: res.locals.escrowBalance });
 * });
 */

const protect = require("./lib/protect");
const protectWithEscrow = require("./lib/protectEscrow");
const { registerAPI } = require("./lib/register");

module.exports = {
  // Pay-per-call mode (direct payments)
  protect,

  // Prepaid escrow mode (prepaid credits)
  protectWithEscrow,

  // API registration
  registerAPI,
};
