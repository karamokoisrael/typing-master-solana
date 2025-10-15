use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Player {
    pub owner: Pubkey,
    pub total_tests: u32,
    pub best_wpm: u32,
    pub average_wpm: u32,
    pub best_accuracy: u32,
    pub total_words_typed: u64,
    pub created_at: i64,
    pub last_activity: i64,
}

impl Player {
    pub const SIZE: usize = 32 + 4 + 4 + 4 + 4 + 8 + 8 + 8;
    
    pub fn new(owner: Pubkey, timestamp: i64) -> Self {
        Self {
            owner,
            total_tests: 0,
            best_wpm: 0,
            average_wpm: 0,
            best_accuracy: 0,
            total_words_typed: 0,
            created_at: timestamp,
            last_activity: timestamp,
        }
    }
    
    pub fn update_practice_stats(&mut self, wpm: u32, accuracy: u32, words_typed: u32, timestamp: i64) {
        self.total_tests += 1;
        if wpm > self.best_wpm {
            self.best_wpm = wpm;
        }
        if accuracy > self.best_accuracy {
            self.best_accuracy = accuracy;
        }
        self.total_words_typed += words_typed as u64;
        self.average_wpm = (self.average_wpm * (self.total_tests - 1) + wpm) / self.total_tests;
        self.last_activity = timestamp;
    }
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum ContestStatus {
    Waiting,
    Active,
    Ended,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Contest {
    pub creator: Pubkey,
    pub text_id: u32,
    pub duration: u64,
    pub status: ContestStatus,
    pub participants: Vec<Pubkey>,
    pub results: Vec<ContestResult>,
    pub created_at: i64,
    pub started_at: Option<i64>,
    pub ended_at: Option<i64>,
    pub max_participants: u8,
}

impl Contest {
    pub const SIZE: usize = 32 + 4 + 8 + 1 + (32 * 10) + (64 * 10) + 8 + 9 + 9 + 1; // Base size for 10 participants
    
    pub fn new(creator: Pubkey, text_id: u32, duration: u64, timestamp: i64) -> Self {
        Self {
            creator,
            text_id,
            duration,
            status: ContestStatus::Waiting,
            participants: Vec::new(),
            results: Vec::new(),
            created_at: timestamp,
            started_at: None,
            ended_at: None,
            max_participants: 10,
        }
    }
    
    pub fn can_join(&self) -> bool {
        self.status == ContestStatus::Waiting && 
        self.participants.len() < self.max_participants as usize
    }
    
    pub fn add_participant(&mut self, player: Pubkey) -> Result<(), &'static str> {
        if !self.can_join() {
            return Err("Cannot join contest");
        }
        if self.participants.contains(&player) {
            return Err("Player already in contest");
        }
        self.participants.push(player);
        Ok(())
    }
    
    pub fn start_contest(&mut self, timestamp: i64) {
        if self.status == ContestStatus::Waiting {
            self.status = ContestStatus::Active;
            self.started_at = Some(timestamp);
        }
    }
    
    pub fn end_contest(&mut self, timestamp: i64) {
        if self.status == ContestStatus::Active {
            self.status = ContestStatus::Ended;
            self.ended_at = Some(timestamp);
        }
    }
    
    pub fn submit_result(&mut self, player: Pubkey, wpm: u32, accuracy: u32, time_taken: u64) -> Result<(), &'static str> {
        if self.status != ContestStatus::Active {
            return Err("Contest not active");
        }
        if !self.participants.contains(&player) {
            return Err("Player not in contest");
        }
        
        // Check if player already submitted
        if self.results.iter().any(|r| r.player == player) {
            return Err("Result already submitted");
        }
        
        self.results.push(ContestResult {
            player,
            wpm,
            accuracy,
            time_taken,
            position: 0, // Will be calculated after all results are in
        });
        
        Ok(())
    }
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct ContestResult {
    pub player: Pubkey,
    pub wpm: u32,
    pub accuracy: u32,
    pub time_taken: u64,
    pub position: u32,
}