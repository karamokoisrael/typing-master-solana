#!/bin/bash

# Deploy typing master Solana program
echo "Building Solana program..."
cd program

# Build the program
cargo build-sbf

if [ $? -eq 0 ]; then
    echo "Build successful!"
    
    # Deploy to devnet
    echo "Deploying to devnet..."
    solana program deploy target/deploy/typing_master_program.so --url devnet
    
    if [ $? -eq 0 ]; then
        echo "Deployment successful!"
        echo "Program deployed to devnet"
        
        # Get the program ID
        PROGRAM_ID=$(solana address -k target/deploy/typing_master_program-keypair.json)
        echo "Program ID: $PROGRAM_ID"
        
        # Update the frontend with the program ID
        cd ../app/src/hooks
        sed -i.bak "s/YOUR_PROGRAM_ID_HERE/$PROGRAM_ID/g" useSolanaProgram.tsx
        echo "Updated frontend with Program ID: $PROGRAM_ID"
    else
        echo "Deployment failed!"
        exit 1
    fi
else
    echo "Build failed!"
    exit 1
fi