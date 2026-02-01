// Helper functions for Stellar payment verification
// Uses stellar-sdk and Horizon testnet

const StellarSdk = require("stellar-sdk");
const server = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org",
);

/**
 * Verify a payment transaction on Stellar testnet
 * @param {string} txHash - Transaction hash
 * @param {string} escrowPublicKey - Escrow account public key
 * @param {number} minAmount - Minimum expected amount (in XLM)
 * @returns {Promise<{amount: number, from: string, to: string, asset: string}>}
 * Throws error if not valid
 */
async function verifyStellarPayment({ txHash, escrowPublicKey, minAmount }) {
  // Fetch transaction details
  const tx = await server.transactions().transaction(txHash).call();
  if (!tx || tx.successful !== true) {
    throw new Error("Transaction not found or not successful");
  }

  // Fetch operations for this transaction
  const ops = await server.operations().forTransaction(txHash).call();
  // Find payment to escrowPublicKey in native XLM
  const paymentOp = ops.records.find(
    (op) =>
      op.type === "payment" &&
      op.to === escrowPublicKey &&
      op.asset_type === "native" &&
      parseFloat(op.amount) >= minAmount,
  );
  if (!paymentOp) {
    throw new Error("No valid payment to escrow found");
  }
  return {
    amount: parseFloat(paymentOp.amount),
    from: paymentOp.from,
    to: paymentOp.to,
    asset: paymentOp.asset_type,
  };
}

module.exports = {
  verifyStellarPayment,
};
