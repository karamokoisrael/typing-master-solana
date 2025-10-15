use crate::{error::TypingError, instruction::TypingInstruction, state::{Contest, Player}};
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = TypingInstruction::unpack(instruction_data)?;
        
        match instruction {
            TypingInstruction::InitializePlayer => {
                msg!("Instruction: Initialize Player");
                Self::process_initialize_player(program_id, accounts)
            }
            TypingInstruction::CreateContest { text_id, duration } => {
                msg!("Instruction: Create Contest");
                Self::process_create_contest(program_id, accounts, text_id, duration)
            }
            TypingInstruction::JoinContest => {
                msg!("Instruction: Join Contest");
                Self::process_join_contest(program_id, accounts)
            }
            TypingInstruction::SubmitResult { wpm, accuracy, time_taken } => {
                msg!("Instruction: Submit Result");
                Self::process_submit_result(program_id, accounts, wpm, accuracy, time_taken)
            }
            TypingInstruction::UpdatePracticeStats { wpm, accuracy, words_typed } => {
                msg!("Instruction: Update Practice Stats");
                Self::process_update_practice_stats(program_id, accounts, wpm, accuracy, words_typed)
            }
        }
    }
    
    fn process_initialize_player(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let payer = next_account_info(accounts_iter)?;
        let player_account = next_account_info(accounts_iter)?;
        let system_program = next_account_info(accounts_iter)?;
        
        if !payer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        // Create PDA for player account
        let (expected_player_pda, bump_seed) = Pubkey::find_program_address(
            &[b"player", payer.key.as_ref()],
            program_id,
        );
        
        if *player_account.key != expected_player_pda {
            return Err(TypingError::InvalidAccountData.into());
        }
        
        // Check if account already exists
        if player_account.data_len() > 0 {
            return Err(TypingError::PlayerAlreadyInitialized.into());
        }
        
        let clock = Clock::get()?;
        let player = Player::new(*payer.key, clock.unix_timestamp);
        
        let rent = Rent::get()?;
        let account_len = Player::SIZE;
        let lamports = rent.minimum_balance(account_len);
        
        // Create the PDA account using invoke_signed
        let seeds = &[b"player", payer.key.as_ref(), &[bump_seed]];
        let signer_seeds = &[&seeds[..]];
        
        invoke_signed(
            &system_instruction::create_account(
                payer.key,
                player_account.key,
                lamports,
                account_len as u64,
                program_id,
            ),
            &[payer.clone(), player_account.clone(), system_program.clone()],
            signer_seeds,
        )?;
        
        // Serialize and store player data
        player.serialize(&mut &mut player_account.data.borrow_mut()[..])?;
        
        msg!("Player initialized for: {}", payer.key);
        Ok(())
    }
    
    fn process_create_contest(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        text_id: u32,
        duration: u64,
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let creator = next_account_info(accounts_iter)?;
        let contest_account = next_account_info(accounts_iter)?;
        let system_program = next_account_info(accounts_iter)?;
        
        if !creator.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        let clock = Clock::get()?;
        let contest = Contest::new(*creator.key, text_id, duration, clock.unix_timestamp);
        
        let rent = Rent::get()?;
        let account_len = Contest::SIZE;
        let lamports = rent.minimum_balance(account_len);
        
        // Create the contest account
        invoke(
            &system_instruction::create_account(
                creator.key,
                contest_account.key,
                lamports,
                account_len as u64,
                program_id,
            ),
            &[creator.clone(), contest_account.clone(), system_program.clone()],
        )?;
        
        // Serialize and store contest data
        contest.serialize(&mut &mut contest_account.data.borrow_mut()[..])?;
        
        msg!("Contest created with text_id: {}, duration: {}", text_id, duration);
        Ok(())
    }
    
    fn process_join_contest(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let player = next_account_info(accounts_iter)?;
        let contest_account = next_account_info(accounts_iter)?;
        let player_account = next_account_info(accounts_iter)?;
        
        if !player.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        // Verify player account ownership
        let (expected_player_pda, _) = Pubkey::find_program_address(
            &[b"player", player.key.as_ref()],
            program_id,
        );
        
        if *player_account.key != expected_player_pda {
            return Err(TypingError::InvalidAccountData.into());
        }
        
        let mut contest = Contest::try_from_slice(&contest_account.data.borrow())?;
        contest.add_participant(*player.key)
            .map_err(|_| TypingError::ContestFull)?;
        
        // If we have enough players, start the contest
        if contest.participants.len() >= 2 {
            let clock = Clock::get()?;
            contest.start_contest(clock.unix_timestamp);
        }
        
        contest.serialize(&mut &mut contest_account.data.borrow_mut()[..])?;
        
        msg!("Player {} joined contest", player.key);
        Ok(())
    }
    
    fn process_submit_result(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        wpm: u32,
        accuracy: u32,
        time_taken: u64,
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let player = next_account_info(accounts_iter)?;
        let contest_account = next_account_info(accounts_iter)?;
        let player_account = next_account_info(accounts_iter)?;
        
        if !player.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        let mut contest = Contest::try_from_slice(&contest_account.data.borrow())?;
        contest.submit_result(*player.key, wpm, accuracy, time_taken)
            .map_err(|_| TypingError::ContestNotActive)?;
        
        // Update player stats
        let mut player_data = Player::try_from_slice(&player_account.data.borrow())?;
        let clock = Clock::get()?;
        player_data.update_practice_stats(wpm, accuracy, (wpm * time_taken as u32) / 60, clock.unix_timestamp);
        
        // Check if all players have submitted results
        if contest.results.len() == contest.participants.len() {
            contest.end_contest(clock.unix_timestamp);
        }
        
        contest.serialize(&mut &mut contest_account.data.borrow_mut()[..])?;
        player_data.serialize(&mut &mut player_account.data.borrow_mut()[..])?;
        
        msg!("Result submitted: WPM {}, Accuracy {}%", wpm, accuracy);
        Ok(())
    }
    
    fn process_update_practice_stats(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        wpm: u32,
        accuracy: u32,
        words_typed: u32,
    ) -> ProgramResult {
        let accounts_iter = &mut accounts.iter();
        let player = next_account_info(accounts_iter)?;
        let player_account = next_account_info(accounts_iter)?;
        
        if !player.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }
        
        // Verify player account ownership
        let (expected_player_pda, _) = Pubkey::find_program_address(
            &[b"player", player.key.as_ref()],
            program_id,
        );
        
        if *player_account.key != expected_player_pda {
            return Err(TypingError::InvalidAccountData.into());
        }
        
        let mut player_data = Player::try_from_slice(&player_account.data.borrow())?;
        let clock = Clock::get()?;
        player_data.update_practice_stats(wpm, accuracy, words_typed, clock.unix_timestamp);
        
        player_data.serialize(&mut &mut player_account.data.borrow_mut()[..])?;
        
        msg!("Practice stats updated: WPM {}, Accuracy {}%", wpm, accuracy);
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{
        error::TypingError,
        state::Player,
    };
    use borsh::BorshSerialize;
    use solana_program::{
        account_info::AccountInfo,
        program_error::ProgramError,
        pubkey::Pubkey,
        system_program,
    };

    /// Helper function to create test accounts
    fn create_test_accounts() -> (Pubkey, Pubkey, Pubkey) {
        let payer = Pubkey::new_unique();
        let program_id = Pubkey::new_unique();
        
        // Generate the expected PDA
        let (player_pda, _) = Pubkey::find_program_address(
            &[b"player", payer.as_ref()],
            &program_id,
        );
        
        (payer, player_pda, program_id)
    }

    /// Helper function to create AccountInfo from test data
    fn create_account_info<'a>(
        key: &'a Pubkey,
        is_signer: bool,
        is_writable: bool,
        lamports: &'a mut u64,
        data: &'a mut [u8],
        owner: &'a Pubkey,
    ) -> AccountInfo<'a> {
        AccountInfo::new(
            key,
            is_signer,
            is_writable,
            lamports,
            data,
            owner,
            false, // executable
            0,     // rent_epoch
        )
    }

    #[test]
    fn test_initialize_player_missing_signature() {
        let (payer, player_pda, program_id) = create_test_accounts();
        let system_program_id = system_program::id();
        
        let mut payer_lamports = 1_000_000_000;
        let mut payer_data = vec![];
        let mut player_lamports = 0;
        let mut player_data = vec![0; Player::SIZE];
        let mut system_lamports = 0;
        let mut system_data = vec![];
        
        // Create payer account WITHOUT signer flag
        let payer_account = create_account_info(
            &payer,
            false, // is_signer = false (this should cause the error)
            true,
            &mut payer_lamports,
            &mut payer_data,
            &system_program_id,
        );
        
        let player_account = create_account_info(
            &player_pda,
            false,
            true,
            &mut player_lamports,
            &mut player_data,
            &program_id,
        );
        
        let system_account = create_account_info(
            &system_program_id,
            false,
            false,
            &mut system_lamports,
            &mut system_data,
            &system_program_id,
        );
        
        let accounts = vec![payer_account, player_account, system_account];
        
        let result = Processor::process_initialize_player(&program_id, &accounts);
        
        assert_eq!(result.unwrap_err(), ProgramError::MissingRequiredSignature);
    }

    #[test]
    fn test_initialize_player_invalid_pda() {
        let (payer, _player_pda, program_id) = create_test_accounts();
        let wrong_pda = Pubkey::new_unique(); // Wrong PDA
        let system_program_id = system_program::id();
        
        let mut payer_lamports = 1_000_000_000;
        let mut payer_data = vec![];
        let mut player_lamports = 0;
        let mut player_data = vec![0; Player::SIZE];
        let mut system_lamports = 0;
        let mut system_data = vec![];
        
        let payer_account = create_account_info(
            &payer,
            true,
            true,
            &mut payer_lamports,
            &mut payer_data,
            &system_program_id,
        );
        
        // Use wrong PDA address
        let player_account = create_account_info(
            &wrong_pda, // This is not the expected PDA
            false,
            true,
            &mut player_lamports,
            &mut player_data,
            &program_id,
        );
        
        let system_account = create_account_info(
            &system_program_id,
            false,
            false,
            &mut system_lamports,
            &mut system_data,
            &system_program_id,
        );
        
        let accounts = vec![payer_account, player_account, system_account];
        
        let result = Processor::process_initialize_player(&program_id, &accounts);
        
        assert_eq!(
            result.unwrap_err(),
            ProgramError::from(TypingError::InvalidAccountData)
        );
    }

    #[test]
    fn test_initialize_player_already_initialized() {
        let (payer, player_pda, program_id) = create_test_accounts();
        let system_program_id = system_program::id();
        
        let mut payer_lamports = 1_000_000_000;
        let mut payer_data = vec![];
        let mut player_lamports = 0;
        
        // Create player data that's already initialized (non-zero length)
        let existing_player = Player::new(payer, 1234567890);
        let mut player_data = vec![0; Player::SIZE];
        existing_player.serialize(&mut player_data.as_mut_slice()).unwrap();
        
        let mut system_lamports = 0;
        let mut system_data = vec![];
        
        let payer_account = create_account_info(
            &payer,
            true,
            true,
            &mut payer_lamports,
            &mut payer_data,
            &system_program_id,
        );
        
        let player_account = create_account_info(
            &player_pda,
            false,
            true,
            &mut player_lamports,
            &mut player_data,
            &program_id,
        );
        
        let system_account = create_account_info(
            &system_program_id,
            false,
            false,
            &mut system_lamports,
            &mut system_data,
            &system_program_id,
        );
        
        let accounts = vec![payer_account, player_account, system_account];
        
        let result = Processor::process_initialize_player(&program_id, &accounts);
        
        assert_eq!(
            result.unwrap_err(),
            ProgramError::from(TypingError::PlayerAlreadyInitialized)
        );
    }

    #[test]
    fn test_initialize_player_insufficient_accounts() {
        let (payer, _player_pda, program_id) = create_test_accounts();
        let system_program_id = system_program::id();
        
        let mut payer_lamports = 1_000_000_000;
        let mut payer_data = vec![];
        
        let payer_account = create_account_info(
            &payer,
            true,
            true,
            &mut payer_lamports,
            &mut payer_data,
            &system_program_id,
        );
        
        // Only provide one account instead of three
        let accounts = vec![payer_account];
        
        let result = Processor::process_initialize_player(&program_id, &accounts);
        
        assert_eq!(result.unwrap_err(), ProgramError::NotEnoughAccountKeys);
    }

    #[test]
    fn test_pda_generation() {
        let payer = Pubkey::new_unique();
        let program_id = Pubkey::new_unique();
        
        let (pda1, bump1) = Pubkey::find_program_address(
            &[b"player", payer.as_ref()],
            &program_id,
        );
        
        let (pda2, bump2) = Pubkey::find_program_address(
            &[b"player", payer.as_ref()],
            &program_id,
        );
        
        // Same inputs should generate same PDA and bump
        assert_eq!(pda1, pda2);
        assert_eq!(bump1, bump2);
        
        // Different payer should generate different PDA
        let other_payer = Pubkey::new_unique();
        let (pda3, _) = Pubkey::find_program_address(
            &[b"player", other_payer.as_ref()],
            &program_id,
        );
        
        assert_ne!(pda1, pda3);
    }

    #[test]
    fn test_player_data_serialization() {
        let payer = Pubkey::new_unique();
        let timestamp = 1234567890;
        
        let player = Player::new(payer, timestamp);
        
        // Test serialization
        let mut data = vec![0; Player::SIZE];
        player.serialize(&mut data.as_mut_slice()).unwrap();
        
        // Test deserialization
        let deserialized_player = Player::try_from_slice(&data).unwrap();
        
        assert_eq!(player.owner, deserialized_player.owner);
        assert_eq!(player.total_tests, deserialized_player.total_tests);
        assert_eq!(player.best_wpm, deserialized_player.best_wpm);
        assert_eq!(player.average_wpm, deserialized_player.average_wpm);
        assert_eq!(player.best_accuracy, deserialized_player.best_accuracy);
        assert_eq!(player.total_words_typed, deserialized_player.total_words_typed);
        assert_eq!(player.created_at, deserialized_player.created_at);
        assert_eq!(player.last_activity, deserialized_player.last_activity);
    }

    #[test]
    fn test_player_creation() {
        let owner = Pubkey::new_unique();
        let timestamp = 1640995200; // Jan 1, 2022
        
        let player = Player::new(owner, timestamp);
        
        assert_eq!(player.owner, owner);
        assert_eq!(player.total_tests, 0);
        assert_eq!(player.best_wpm, 0);
        assert_eq!(player.average_wpm, 0);
        assert_eq!(player.best_accuracy, 0);
        assert_eq!(player.total_words_typed, 0);
        assert_eq!(player.created_at, timestamp);
        assert_eq!(player.last_activity, timestamp);
    }
}