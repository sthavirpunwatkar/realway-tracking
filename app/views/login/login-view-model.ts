import { Observable } from '@nativescript/core';
import { AuthService } from '../../services/auth.service';
import { Frame } from '@nativescript/core';

export class LoginViewModel extends Observable {
    private authService: AuthService;
    phoneNumber: string = '';
    otp: string = '';
    otpSent: boolean = false;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
    }

    async sendOTP() {
        if (this.phoneNumber && this.phoneNumber.length >= 10) {
            const sent = await this.authService.sendOTP(this.phoneNumber);
            if (sent) {
                this.set('otpSent', true);
            }
        }
    }

    async verifyOTP() {
        if (this.otp && this.phoneNumber) {
            const verified = await this.authService.verifyOTP(this.phoneNumber, this.otp);
            if (verified) {
                Frame.topmost().navigate({
                    moduleName: 'views/route-planner/route-planner-page',
                    clearHistory: true
                });
            }
        }
    }
}