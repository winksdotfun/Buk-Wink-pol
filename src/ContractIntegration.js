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

    // Create RPC provider for reading state
    //const rpcProvider = new ethers.JsonRpcProvider(RPC_URL);
    
    // Get MetaMask provider and signer for transactions
    const metamaskProvider = new ethers.BrowserProvider(window.ethereum);
    const signer = await metamaskProvider.getSigner();

    // Create contract instances with RPC provider for reading
    const tokenWithProvider = new ethers.Contract(usdc_contract, tokenabi, signer);
    const contractWithProvider = new ethers.Contract(contract_address, abi, signer);

    // Create contract instances with signer for transactions
    const token = tokenWithProvider.connect(signer);
    const contract = contractWithProvider.connect(signer);

    // Check allowance using RPC provider (faster read)
    const userAddress = await signer.getAddress();
    console.log("useraddress",userAddress);
    console.log("contract_address",contract_address);
    sessionStorage.setItem("userAddress", userAddress);

    console.log(
      "token provider", tokenWithProvider
    );
    
    const res = await tokenWithProvider.allowance(userAddress, contract_address);
    console.log("Allowance result:", res.toString());


    console.log("Approving token...");
    const approve = await tokenWithProvider.approve(
      contract_address,
      "12412521512521521521125"
    );
    await approve.wait();
    console.log("Approval transaction complete:", approve.hash);
    if (res.toString() === "0"  ) {
      console.log("Approving token...");
      const approve = await token.approve(
        contract_address,
        "12412521512521521521125"
      );
      await approve.wait();
      console.log("Approval transaction complete:", approve.hash);
    }

   
    // Get gas estimate using RPC provider
    const gasEstimate = await contractWithProvider.buyRoom.estimateGas(
      _tokenId,
      { from: userAddress }
    );

    console.log("Estimated gas:", gasEstimate.toString());

    // Execute transaction with signer and estimated gas
    const transaction = await contractWithProvider.buyRoom(_tokenId, {
      gasLimit: Math.ceil(Number(gasEstimate) * 1.2), // Add 20% buffer
    });

    console.log("Transaction sent:", transaction.hash);
    logAnalyticsEvent('buy_room_success', {
      tokenId: _tokenId,
      userAddress: userAddress
    });
    // const receipt = await transaction.wait();
    // console.log("Transaction successful:", receipt);
    sessionStorage.setItem("transactionId", transaction.hash);
    return  transaction.hash;

  } catch (error) {
    logAnalyticsEvent('buy_room_error', {
      tokenId: _tokenId,
      error: error.message
    });
    console.error("Error buying room:", error);
    //0xad4414c8ca792284cf42e0a91fe805c21bd3e048ea33171a4d9f2f294b37b55c
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