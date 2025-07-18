import { UserRepository } from '@/repositories/user.repository';
import { randomUUID } from 'crypto';


export const generateTransactionReference = (): string => {
  const hrTime = process.hrtime.bigint().toString();
  const random = randomUUID().replace(/-/g, '').slice(0, 8);
  return `TXN_${hrTime}_${random}`.toUpperCase();
};

// Helper to generate 10-digit account number
const generateAccountNumber = (): string => {
  const prefix = Math.random() > 0.5 ? '1' : '2';
  const suffix = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return prefix + suffix;
};

// Generate a unique account number using UserRepository
export const generateUniqueAccountNumber = async (
  userRepository: UserRepository
): Promise<string> => {
   let accountNumber: string = '';
  let isUnique = false;

  while (!isUnique) {
    accountNumber = generateAccountNumber();
    const existingUser = await userRepository.findByAccountNumber(accountNumber);
    if (!existingUser) {
      isUnique = true;
    }
  }

  return accountNumber;
};