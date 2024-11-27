import { ethers } from "ethers";
import abi from "./abi.json";
import tokenabi from "./tokenabi.json";
import { logAnalyticsEvent } from './firebase';

const contract_address = "0xeE47bf2d14773ECdf2025C7176dB8049b693a666";
const usdc_contract = "0x0857a887A3E14E1c7EcD612292E3b1fD57b76551";

const amoyNetwork = {
  chainId: "0x1F",
  chainName: "Amoy Network",
  rpcUrls: ["https://rpc.amoy.network"],
  nativeCurrency: {
    name: "Amoy",
    symbol: "AMOY",
    decimals: 18,
  },
  blockExplorerUrls: ["https://explorer.amoy.network"],
};

const checkMetaMask = () => {
  return (
    typeof window !== "undefined" &&
    window.ethereum &&
    window.ethereum.isMetaMask
  );
};

const switchToAmoyNetwork = async () => {
  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [amoyNetwork],
    });
    console.log("Switched to Amoy network");
  } catch (error) {
    console.error("Failed to switch networks:", error);
    throw error;
  }
};

export const buyRoom = async (_tokenId) => {
  try {
    if (!checkMetaMask()) {
      logAnalyticsEvent('metamask_not_installed');
      throw new Error("Please install MetaMask to continue");
    }

    logAnalyticsEvent('buy_room_initiated', {
      tokenId: _tokenId
    });

    // Get MetaMask provider and signer for transactions
    const metamaskProvider = new ethers.BrowserProvider(window.ethereum);
    const signer = await metamaskProvider.getSigner();

    // Create contract instances 
    const tokenContract = new ethers.Contract(usdc_contract, tokenabi, signer);
    const mainContract = new ethers.Contract(contract_address, abi, signer);

    // Get user address
    const userAddress = await signer.getAddress();
    console.log("User address:", userAddress);
    sessionStorage.setItem("userAddress", userAddress);

    // Improved allowance check
    let allowance;
    try {
      allowance = await tokenContract.allowance(userAddress, contract_address);
      console.log("Allowance:", allowance.toString());
    } catch (allowanceError) {
      console.error("Allowance check failed:", allowanceError);
      // If allowance check fails, proceed with approval
      allowance = ethers.toBigInt(0);
    }

    // Approve tokens if allowance is 0
    if (allowance === ethers.toBigInt(0)) {
      console.log("Approving tokens...");
      const approveAmount = ethers.parseUnits("1000000", 6); // Adjust decimals as needed
      const approvalTx = await tokenContract.approve(contract_address, approveAmount);
      await approvalTx.wait();
      console.log("Approval transaction complete:", approvalTx.hash);
    }

    // Estimate gas for buyRoom
    const gasEstimate = await mainContract.buyRoom.estimateGas(
      _tokenId,
      { from: userAddress }
    );

    // Execute transaction
    const transaction = await mainContract.buyRoom(_tokenId, {
      gasLimit: Math.ceil(Number(gasEstimate) * 1.2), // Add 20% buffer
    });

    console.log("Transaction sent:", transaction.hash);
    logAnalyticsEvent('buy_room_success', {
      tokenId: _tokenId,
      userAddress: userAddress
    });

    sessionStorage.setItem("transactionId", transaction.hash);
    return transaction.hash;

  } catch (error) {
    logAnalyticsEvent('buy_room_error', {
      tokenId: _tokenId,
      error: error.message
    });
    console.error("Error buying room:", error);

    // Improved error handling
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

if (checkMetaMask()) {
  window.ethereum.on("accountsChanged", (accounts) => {
    logAnalyticsEvent('account_changed', {
      newAccount: accounts[0]
    });
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