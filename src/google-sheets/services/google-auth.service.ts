import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GoogleAuthService {
    private readonly logger = new Logger(GoogleAuthService.name);
    private jwtClient: JWT;

    constructor() {
        this.initializeAuth();
    }

    /**
     * Initialize Google authentication with service account
     */
    private initializeAuth() {
        try {
            // Path to service account key file
            const keyFilePath = path.join(
                process.cwd(),
                'config',
                'goolgesheet-shezad-1caaf1efdd95.json',
            );

            // Check if key file exists
            if (!fs.existsSync(keyFilePath)) {
                this.logger.warn(
                    'Google service account key file not found. Please add it to config/google-service-account.json',
                );
                return;
            }

            // Read service account credentials
            const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));

            // Create JWT client
            this.jwtClient = new google.auth.JWT({
                email: credentials.client_email,
                key: credentials.private_key,
                scopes: [
                    'https://www.googleapis.com/auth/spreadsheets',
                    'https://www.googleapis.com/auth/drive.readonly',
                ],
            });

            this.logger.log('Google authentication initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Google authentication', error);
            throw error;
        }
    }

    /**
     * Get authenticated JWT client
     */
    async getAuthClient(): Promise<JWT> {
        if (!this.jwtClient) {
            throw new Error('Google authentication not initialized');
        }

        // Authorize the client
        await this.jwtClient.authorize();
        return this.jwtClient;
    }

    /**
     * Get Google Sheets API instance
     */
    async getSheetsAPI() {
        const auth = await this.getAuthClient();
        return google.sheets({ version: 'v4', auth });
    }

    /**
     * Test authentication
     */
    async testAuth(): Promise<boolean> {
        try {
            await this.getAuthClient();
            this.logger.log('Google authentication test successful');
            return true;
        } catch (error) {
            this.logger.error('Google authentication test failed', error);
            return false;
        }
    }
}
