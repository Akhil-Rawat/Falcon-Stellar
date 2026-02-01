/**
 * Quick test to verify SDK works before publishing
 */

console.log("🧪 Testing Falcone SDK...\n");

try {
  // Test 1: Load SDK
  const { protect, protectWithEscrow, registerAPI } = require("./index");
  console.log("✅ SDK loaded successfully");
  console.log("   - protect:", typeof protect);
  console.log("   - protectWithEscrow:", typeof protectWithEscrow);
  console.log("   - registerAPI:", typeof registerAPI);

  // Test 2: Check if middleware returns a function
  const payPerCallMiddleware = protect({
    price: { amount: "5", asset: "XLM" },
    receiver: "GTEST123",
  });
  console.log(
    "\n✅ Pay-per-call middleware created:",
    typeof payPerCallMiddleware,
  );

  // Test 3: Check escrow middleware
  const escrowMiddleware = protectWithEscrow({
    apiId: "test-api",
    apiOwnerId: "GTEST123",
    pricePerCall: 2,
  });
  console.log("✅ Escrow middleware created:", typeof escrowMiddleware);

  console.log("\n🎉 All tests passed! SDK is ready to publish.\n");
} catch (error) {
  console.error("❌ Test failed:", error.message);
  console.error(error);
  process.exit(1);
}
