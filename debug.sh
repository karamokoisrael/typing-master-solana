#!/bin/bash

# Debugging script for Solana wallet setup

echo "🔍 Solana Development Environment Debug"
echo "======================================"

echo ""
echo "📡 Current Solana Configuration:"
solana config get

echo ""
echo "⛓️ Validator Status:"
if solana epoch-info >/dev/null 2>&1; then
    echo "✅ Validator is running"
    solana epoch-info | head -3
else
    echo "❌ Validator is not responding"
fi

echo ""
echo "💰 Wallet Balance:"
solana balance

echo ""
echo "📋 Program Deployment Check:"
echo "Program ID: BLLAnstcntKVpbHqmfE4qx7SAydKWMs2udMQah5SEw7o"
if solana account BLLAnstcntKVpbHqmfE4qx7SAydKWMs2udMQah5SEw7o >/dev/null 2>&1; then
    echo "✅ Smart contract is deployed"
else
    echo "❌ Smart contract not found"
fi

echo ""
echo "🏗️ Quick Setup Commands:"
echo "1. Start validator: npm run start:validator"
echo "2. Get SOL: npm run setup:localhost"
echo "3. Deploy contract: npm run deploy:localhost"
echo "4. Start frontend: npm run dev:frontend"
echo ""
echo "🔧 Wallet Setup:"
echo "1. Set Phantom to 'Custom RPC': http://localhost:8899"
echo "2. Airdrop SOL to your wallet address"
echo "3. Connect wallet in the app"

echo ""
echo "📊 Recent Transactions:"
solana transaction-history --limit 3 2>/dev/null || echo "No recent transactions found"