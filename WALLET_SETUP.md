# 🔧 Phantom Wallet Setup for Localhost Development

## 🚨 **Important: Transaction Error Fix**

If you're getting a "Transaction Error" when trying to initialize your account, follow these steps:

### **Step 1: Configure Phantom for Localhost**

1. **Open Phantom Wallet Extension**
2. **Click Settings** (gear icon)
3. **Go to "Developer Settings"**
4. **Enable "Testnet Mode"**
5. **Change Network**:
   - Click the network dropdown (usually shows "Mainnet")
   - Select **"Custom RPC"**
   - Enter RPC URL: `http://localhost:8899`
   - Enter Network Name: `Localhost`
   - Click **"Save"**

### **Step 2: Get Localhost SOL**

Since you're on localhost, you need SOL for transactions:

1. **Copy your wallet address** from Phantom
2. **Run this command** in your terminal:
   ```bash
   solana airdrop 10 YOUR_WALLET_ADDRESS
   ```
   Replace `YOUR_WALLET_ADDRESS` with your actual Phantom wallet address

3. **Or use our npm script**:
   ```bash
   npm run setup:localhost
   ```

### **Step 3: Verify Setup**

1. **Check Network**: Phantom should show "Localhost" in the network dropdown
2. **Check Balance**: You should see some SOL in your wallet
3. **Check Connection**: The typing game should show your wallet as connected

### **Step 4: Initialize Account**

Now try clicking "Initialize Account" again. The transaction should work!

## 🔍 **Debugging Steps**

If you're still having issues:

### **Check Browser Console**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for error messages when you click "Initialize Account"

### **Common Error Messages & Fixes**

| Error | Solution |
|-------|----------|
| "Transaction Error" | Follow wallet setup steps above |
| "Network Error" | Make sure Solana validator is running |
| "Insufficient Funds" | Get SOL via airdrop |
| "Program Not Found" | Make sure smart contract is deployed |

### **Verify Solana Setup**
```bash
# Check if validator is running
solana epoch-info

# Check current network
solana config get

# Check balance
solana balance

# Check program deployment
solana account BLLAnstcntKVpbHqmfE4qx7SAydKWMs2udMQah5SEw7o
```

## 🎯 **Quick Reset**

If nothing works, try this complete reset:

```bash
# Stop everything
pkill -f solana-test-validator
pkill -f "npm run dev"

# Restart everything
npm run full:deploy
```

This will rebuild, redeploy, and restart everything fresh.

## 📱 **Alternative Wallets**

If Phantom doesn't work, try:
- **Solflare** (also needs localhost configuration)
- **Backpack** (newer, might have better localhost support)

## ✅ **Success Indicators**

You'll know it's working when:
1. ✅ Phantom shows "Localhost" network
2. ✅ Phantom shows SOL balance > 0
3. ✅ Typing game shows "Connected" status
4. ✅ "Initialize Account" button works without errors
5. ✅ Browser console shows "Player initialized: [signature]"

---

**Need more help?** Check the browser console for specific error messages and search for the error online.