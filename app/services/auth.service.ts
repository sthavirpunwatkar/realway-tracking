import { Observable } from '@nativescript/core';
import { User } from '../models/user.model';

export class AuthService extends Observable {
    private static instance: AuthService;
    private currentUser: User | null = null;

    private constructor() {
        super();
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async sendOTP(phoneNumber: string): Promise<boolean> {
        // In a real app, integrate with SMS gateway
        // For demo, we'll simulate OTP send
        console.log(`OTP sent to ${phoneNumber}`);
        return true;
    }

    async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
        // For demo, accept any 6-digit OTP
        if (otp.length === 6 && /^\d+$/.test(otp)) {
            this.currentUser = {
                phoneNumber,
                isVerified: true
            };
            return true;
        }
        return false;
    }

    isLoggedIn(): boolean {
        return this.currentUser !== null && this.currentUser.isVerified;
    }

    logout() {
        this.currentUser = null;
    }
}