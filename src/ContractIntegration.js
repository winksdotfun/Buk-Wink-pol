import { ethers } from "ethers";
import abi from "./abi.json";
import tokenabi from "./tokenabi.json";

const contract_address = "0x631ac30648af0baa2b8cefcfba463bba8b68a902";
const usdc_contract = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

const polygonMainnet = {
  chainId: "0x89",
  chainName: "Polygon Mainnet",
  nativeCurrency: {
    name: "MATIC",
    symbol: "MATIC",
    decimals: 18,
  },
  rpcUrls: ["https://polygon-rpc.com"],
  blockExplorerUrls: ["https://polygonscan.com"],
};

const checkMetaMask = () => {
  return (
    typeof window !== "undefined" &&
    window.ethereum &&
    window.ethereum.isMetaMask
  );
};

const switchToPolygonNetwork = async () => {
  try {
    // First try to switch to the network
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: polygonMainnet.chainId }],
      });
    } catch (switchError) {
      // If the network doesn't exist in MetaMask, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [polygonMainnet],
        });
      } else {
        throw switchError;
      }
    }
    console.log("Switched to Polygon network");
  } catch (error) {
    console.error("Failed to switch networks:", error);
    throw error;
  }
};

export const buyRoom = async (_tokenId) => {
  try {
    if (!checkMetaMask()) {
      throw new Error("Please install MetaMask to continue");
    }

    // Ensure we're on Polygon network
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (currentChainId !== polygonMainnet.chainId) {
      await switchToPolygonNetwork();
    }

    // Get MetaMask provider and signer for transactions
    const metamaskProvider = new ethers.BrowserProvider(window.ethereum);
    const signer = await metamaskProvider.getSigner();

    // Create contract instances with signer
    const tokenWithProvider = new ethers.Contract(usdc_contract, tokenabi, signer);
    const contractWithProvider = new ethers.Contract(contract_address, abi, signer);

    // Get user address and store it
    const userAddress = await signer.getAddress();
    console.log("useraddress", userAddress);
    console.log("contract_address", contract_address);
    sessionStorage.setItem("userAddress", userAddress);

    // Check allowance
    const allowance = await tokenWithProvider.allowance(userAddress, contract_address);
    console.log("Allowance result:", allowance.toString());

    // Approve if necessary
    if (allowance.toString() === "0") {
      console.log("Approving token...");
      const approve = await tokenWithProvider.approve(
        contract_address,
        "12412521512521521521125"
      );
      await approve.wait();
      console.log("Approval transaction complete:", approve.hash);
    }

    // Estimate gas with a buffer for Polygon's variable gas prices
    const gasEstimate = await contractWithProvider.buyRoom.estimateGas(
      _tokenId,
      { from: userAddress }
    );

    console.log("Estimated gas:", gasEstimate.toString());

    // Execute transaction with higher gas buffer for Polygon
    const transaction = await contractWithProvider.buyRoom(_tokenId, {
      gasLimit: Math.ceil(Number(gasEstimate) * 1.3), // Add 30% buffer for Polygon
    });

    console.log("Transaction sent:", transaction.hash);
    sessionStorage.setItem("transactionId", transaction.hash);
    return transaction.hash;

  } catch (error) {
    console.error("Error executing buyRoom:", error);
    if (error.code === 4001) {
      throw new Error("Transaction rejected by user");
    } else if (error.code === -32603) {
      throw new Error("Internal RPC error. Please check your balance and try again.");
    } else if (error.message.includes("user rejected")) {
      throw new Error("User rejected the connection request");
    } else if (error.message.includes("insufficient funds")) {
      throw new Error("Insufficient funds for transaction");
    } else {
      throw new Error(`Failed to execute buyRoom: ${error.message}`);
    }
  }
};

// Setup MetaMask event listeners
if (checkMetaMask()) {
  window.ethereum.on("accountsChanged", (accounts) => {
    console.log("Account changed:", accounts[0]);
  });

  window.ethereum.on("chainChanged", (chainId) => {
    console.log("Network changed:", chainId);
    window.location.reload();
  });
}

export const isMetaMaskInstalled = checkMetaMask;

export const getCurrentAccount = async () => {
  if (!checkMetaMask()) return null;
  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    return accounts[0];
  } catch (error) {
    console.error("Error getting current account:", error);
    return null;
  }
};