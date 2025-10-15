use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::program_error::ProgramError;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum TypingInstruction {
    /// Initialize a new player account
    /// Accounts:
    /// - [signer] Player account
    /// - [writable] Player data account (PDA)
    /// - [] System program
    InitializePlayer,

    /// Create a new typing contest
    /// Accounts:
    /// - [signer] Creator account
    /// - [writable] Contest data account (PDA)
    /// - [] System program
    CreateContest {
        text_id: u32,
        duration: u64,
    },

    /// Join a typing contest
    /// Accounts:
    /// - [signer] Player account
    /// - [writable] Contest data account
    /// - [writable] Player data account
    JoinContest,

    /// Submit typing results
    /// Accounts:
    /// - [signer] Player account
    /// - [writable] Contest data account
    /// - [writable] Player data account
    SubmitResult {
        wpm: u32,
        accuracy: u32,
        time_taken: u64,
    },

    /// Update player statistics after practice
    /// Accounts:
    /// - [signer] Player account
    /// - [writable] Player data account
    UpdatePracticeStats {
        wpm: u32,
        accuracy: u32,
        words_typed: u32,
    },
}

impl TypingInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        Self::try_from_slice(input).map_err(|_| ProgramError::InvalidInstructionData)
    }
}