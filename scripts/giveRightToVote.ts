// giveRightToVote.ts

import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const chairpersonPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {
  const parameters = process.argv.slice(2);
  if (parameters.length < 1) throw new Error("Address not provided");
  const contractAddress = parameters[0] as `0x${string}`;
  const voterAddress = parameters[1] as `0x${string}`;

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const chairpersonAccount = privateKeyToAccount(`0x${chairpersonPrivateKey}`);
  const walletClient = createWalletClient({
    account: chairpersonAccount,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  console.log(`Assigning voting rights to address: ${voterAddress}`);
  try {
    const hash = await walletClient.writeContract({
      address: contractAddress,
      abi,
      functionName: "giveRightToVote",
      args: [voterAddress],
    });
    console.log("Transaction hash:", hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Voting rights assigned. Transaction confirmed.");
  } catch (error) {
    console.error("Failed to assign voting rights:", (error as Error).message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
