import type { LearningProgressService } from './interfaces.ts'

/**
 * On-chain implementation stub
 * This will interact with the Anchor program on Devnet
 * Reference: github.com/solanabr/superteam-academy
 */
export class SolanaLearningService implements LearningProgressService {
  // TODO: Implement on-chain interactions
  // - Connect to Solana program
  // - Read XP from Token-2022 balance
  // - Read credentials from Metaplex Bubblegum
  // - Submit transactions for lesson completion
  
  // @ts-ignore
  async getProgress() {
    throw new Error('Not implemented - use MockLearningService for now')
  }
  
  // ... other methods
}