const { ethers } = require('ethers');

function getProvider() {
  const url = process.env.ETI_RPC_URL;
  if (!url) throw new Error('ETI_RPC_URL not set');
  return new ethers.JsonRpcProvider(url);
}

function getWallet(provider) {
  const pk = process.env.ETI_PRIVATE_KEY;
  if (!pk) throw new Error('ETI_PRIVATE_KEY not set');
  return new ethers.Wallet(pk, provider);
}

async function sendTip(toAddress, amountETI) {
  // Backwards-compatible simple transfer using native value (fallback)
  const provider = getProvider();
  const wallet = getWallet(provider);
  const decimals = Number(process.env.ETI_DECIMALS || 18);
  const amountWei = ethers.parseUnits(String(amountETI), decimals);
  const tx = await wallet.sendTransaction({ to: toAddress, value: amountWei });
  await tx.wait();
  return tx.hash;
}

// New: ERC-20 contract transfer with platform fee split.
// Returns: { recipientTxHash, platformTxHash }
async function sendETIWithFee({ recipientAddress, amountETI, platformAddress, retry = 1 }) {
  if (!recipientAddress) throw new Error('recipientAddress required');
  const provider = getProvider();
  const wallet = getWallet(provider);

  const contractAddress = process.env.ETI_CONTRACT_ADDRESS;
  if (!contractAddress) throw new Error('ETI_CONTRACT_ADDRESS not set');

  const decimals = Number(process.env.ETI_DECIMALS || 18);
  const amountUnits = ethers.parseUnits(String(amountETI), decimals);

  // Minimal ERC-20 ABI for transfer
  const abi = [
    'function transfer(address to, uint256 value) public returns (bool)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
  ];

  const contract = new ethers.Contract(contractAddress, abi, wallet);

  // Split fee: platformCut = 15%
  const platformCutUnits = amountUnits.mul(15).div(100);
  const recipientUnits = amountUnits.sub(platformCutUnits);

  let recipientTxHash = null;
  let platformTxHash = null;

  // Transfer to recipient first, then platform
  try {
    const tx1 = await contract.transfer(recipientAddress, recipientUnits);
    const receipt1 = await tx1.wait();
    recipientTxHash = receipt1.transactionHash || tx1.hash;
  } catch (err) {
    if (retry > 0) {
      return sendETIWithFee({ recipientAddress, amountETI, platformAddress, retry: retry - 1 });
    }
    throw new Error('Recipient transfer failed: ' + err.message);
  }

  try {
    if (platformAddress && platformCutUnits.gt(0)) {
      const tx2 = await contract.transfer(platformAddress, platformCutUnits);
      const receipt2 = await tx2.wait();
      platformTxHash = receipt2.transactionHash || tx2.hash;
    }
  } catch (err) {
    // If platform transfer fails, we still report recipient success; log the failure.
    console.warn('Platform cut transfer failed', err.message);
    // Don't revert recipient transfer; caller should handle reconciliation.
  }

  return { recipientTxHash, platformTxHash };
}

module.exports = { sendTip, sendETIWithFee };
