import { createPublicClient, http, hexToString } from "viem";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import * as dotenv from "dotenv";
dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 1)
    throw new Error("Contract address not provided");
  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Invalid contract address");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  // Create a public client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  console.log("Querying results of the ballot...");

  // Read the number of proposals
  const numProposals = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "numProposals",
  }) as bigint;
  console.log("Number of Proposals:", Number(numProposals));

  // Read the votes for each proposal
  for (let i = 0; i < Number(numProposals); i++) {
    const proposal = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "proposals",
      args: [BigInt(i)],
    }) as [string, bigint];

    const proposalName = hexToString(proposal[0] as `0x${string}`, { size: 32 });
    console.log(`Proposal ${i + 1}: ${proposalName}, Votes: ${proposal[1].toString()}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
