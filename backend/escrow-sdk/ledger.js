const EscrowBalance = require("../models/EscrowBalance");
const PendingPayout = require("../models/PendingPayout");
const UsedTransaction = require("../models/UsedTransaction");

class Ledger {
  // Record a prepayment for a user
  async recordPrepayment(userId, txHash, amount) {
    try {
      await UsedTransaction.create({ userId, txHash, amount });
    } catch (error) {
      if (error && error.code === 11000) {
        throw new Error("Transaction hash already used");
      }
      throw error;
    }

    const updatedBalance = await EscrowBalance.findOneAndUpdate(
      { userId },
      {
        $inc: { balance: amount },
        $addToSet: { txHashes: txHash },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    return updatedBalance.balance;
  }

  // Deduct credits for API usage
  async consumeCredit(userId, apiOwnerId, amount) {
    const updatedBalance = await EscrowBalance.findOneAndUpdate(
      { userId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true },
    );

    if (!updatedBalance) {
      throw new Error("Insufficient balance");
    }

    // Track usage owed to apiOwnerId
    await PendingPayout.findOneAndUpdate(
      { apiOwnerId },
      { $inc: { amount } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    return updatedBalance.balance;
  }

  // Get user balance
  async getUserBalance(userId) {
    const user = await EscrowBalance.findOne({ userId }).select("balance");
    return user ? user.balance : 0;
  }

  // Get pending payouts per API owner
  async getPendingPayouts() {
    return PendingPayout.find({ amount: { $gt: 0 } })
      .select("apiOwnerId amount -_id")
      .lean();
  }

  // Settle batch payouts and reset ledger
  async settleBatch() {
    const payouts = await this.getPendingPayouts();
    if (payouts.length > 0) {
      await PendingPayout.updateMany(
        { apiOwnerId: { $in: payouts.map((p) => p.apiOwnerId) } },
        { $set: { amount: 0 } },
      );
    }
    return payouts;
  }

  // Check if txHash has already been used
  async isTxUsed(txHash) {
    const tx = await UsedTransaction.findOne({ txHash }).select("_id");
    return Boolean(tx);
  }
}

module.exports = Ledger;
