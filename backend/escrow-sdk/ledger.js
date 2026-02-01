// In-memory ledger for prepaid credits and usage tracking
// This can be swapped for a persistent store if needed

class Ledger {
  constructor() {
    // userId => { balance: number, txHashes: Set }
    this.userBalances = new Map();
    // apiOwnerId => amount owed (aggregated usage)
    this.pendingPayouts = new Map();
    // Used txHashes for replay protection
    this.usedTxHashes = new Set();
  }

  // Record a prepayment for a user
  recordPrepayment(userId, txHash, amount) {
    if (!this.userBalances.has(userId)) {
      this.userBalances.set(userId, { balance: 0, txHashes: new Set() });
    }
    const user = this.userBalances.get(userId);
    user.balance += amount;
    user.txHashes.add(txHash);
    this.usedTxHashes.add(txHash);
    return user.balance;
  }

  // Deduct credits for API usage
  consumeCredit(userId, apiOwnerId, amount) {
    const user = this.userBalances.get(userId);
    if (!user || user.balance < amount) {
      throw new Error("Insufficient balance");
    }
    user.balance -= amount;
    // Track usage owed to apiOwnerId
    this.pendingPayouts.set(
      apiOwnerId,
      (this.pendingPayouts.get(apiOwnerId) || 0) + amount,
    );
  }

  // Get user balance
  getUserBalance(userId) {
    const user = this.userBalances.get(userId);
    return user ? user.balance : 0;
  }

  // Get pending payouts per API owner
  getPendingPayouts() {
    const payouts = [];
    for (const [apiOwnerId, amount] of this.pendingPayouts.entries()) {
      payouts.push({ apiOwnerId, amount });
    }
    return payouts;
  }

  // Settle batch payouts and reset ledger
  settleBatch() {
    const payouts = this.getPendingPayouts();
    this.pendingPayouts.clear();
    return payouts;
  }

  // Check if txHash has already been used
  isTxUsed(txHash) {
    return this.usedTxHashes.has(txHash);
  }
}

module.exports = Ledger;
