import { ethers } from "hardhat";

async function main() {
  const platformAddress = "0xD478367Aa81A3ddfF1973738cc90f12F56e7294c";
  
  // Replace with the newly deployed TradeExecutor address
  const newExecutorAddress = process.env.NEW_EXECUTOR_ADDRESS; 
  if (!newExecutorAddress) {
    throw new Error("Please set NEW_EXECUTOR_ADDRESS in environment variables");
  }

  console.log("Connecting to Platform contract at:", platformAddress);
  const Platform = await ethers.getContractFactory("Platform");
  const platform = Platform.attach(platformAddress);

  console.log("Updating TradeExecutor in Platform to:", newExecutorAddress);
  const tx = await platform.updateBotManagerExecutor(newExecutorAddress);
  
  console.log("Waiting for confirmation, tx hash:", tx.hash);
  await tx.wait(1);

  console.log("Update complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
