use thiserror::Error;
use solana_program::program_error::ProgramError;

#[derive(Error, Debug, Copy, Clone)]
pub enum TypingError {
    #[error("Invalid instruction")]
    InvalidInstruction,
    #[error("Player already initialized")]
    PlayerAlreadyInitialized,
    #[error("Contest not found")]
    ContestNotFound,
    #[error("Contest is full")]
    ContestFull,
    #[error("Contest has already ended")]
    ContestEnded,
    #[error("Player not in contest")]
    PlayerNotInContest,
    #[error("Contest not active")]
    ContestNotActive,
    #[error("Insufficient account balance")]
    InsufficientBalance,
    #[error("Invalid account data")]
    InvalidAccountData,
    #[error("Unauthorized")]
    Unauthorized,
}

impl From<TypingError> for ProgramError {
    fn from(e: TypingError) -> Self {
        ProgramError::Custom(e as u32)
    }
}