import axios from 'axios';
import { logger } from '../utils/logger';

export class KarmaService {
    private karmaApiUrl: string;
    private karmaApiKey: string;

    constructor() {
        this.karmaApiUrl = process.env.KARMA_API_URL || 'https://adjutor.lendsqr.com/v2/customers';
        this.karmaApiKey = process.env.KARMA_API_KEY || '';
    }

    async checkBlacklist(email: string): Promise<boolean> {
        try {
            const response = await axios.get(`${this.karmaApiUrl}`, {
                headers: {
                    'Authorization': `Bearer ${this.karmaApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000 
            });

            const users = response.data?.data?.users;

            if (!Array.isArray(users) || users.length === 0) {
                logger.warn(`No users returned from Karma API for ${email}`);
                return false;
            }

            // // Check if any user is blacklisted
            // const blacklisted = users.some((user: any) => Number(user.blacklisted) === 1);
            // if (blacklisted) {
            //     logger.warn(`User ${email} is blacklisted`);
            // }
            // return blacklisted;

            // Filter user by email
            const matchedUser = users.find((user: any) => user.email?.toLowerCase() === email.toLowerCase());

            if (!matchedUser) {
                logger.info(`User ${email} not found in Karma database`);
                return false;
            }

            // Check if the matched user is blacklisted
            const isBlacklisted = Number(matchedUser.blacklisted) === 1;

            if (isBlacklisted) {
                logger.warn(`User ${email} is blacklisted`);
            }

            return isBlacklisted;

        } catch (error) {
            logger.warn(`Karma API check failed for ${email}:`, error);

            if (axios.isAxiosError(error)) {
                const status = error.response?.status;

                if (status === 404) {
                    logger.info(`User ${email} not found in Karma blacklist`);
                    return false;
                }

                if (status === 401) {
                    logger.error('Karma API authentication failed. Check API Key');
                }

                if (status === 403) {
                    logger.error('Karma API access forbidden. Possibly missing permission');
                }
            }

            // Default to false on failure to avoid blocking onboarding
            return false;
        }
    }
}
