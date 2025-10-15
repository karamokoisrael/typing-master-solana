use crate::{error::TypingError, instruction::TypingInstruction, state::{Contest, Player}};
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
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
        
        let clock = Clock::get()?;
        let player = Player::new(*payer.key, clock.unix_timestamp);
        
        let rent = Rent::get()?;
        let account_len = Player::SIZE;
        let lamports = rent.minimum_balance(account_len);
        
        // Create the account
        invoke(
            &system_instruction::create_account(
                payer.key,
                player_account.key,
                lamports,
                account_len as u64,
                program_id,
            ),
            &[payer.clone(), player_account.clone(), system_program.clone()],
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