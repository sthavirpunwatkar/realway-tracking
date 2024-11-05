import { RailwayGate, GateStatus } from '../models/gate.model';

export class GateService {
    private static instance: GateService;
    private gates: RailwayGate[] = [
        {
            id: '1',
            name: 'Central Gate',
            latitude: 12.9716,
            longitude: 77.5946,
            closingTimes: ['08:00', '12:00', '16:00', '20:00'],
            duration: 15
        },
        // Add more gates here
    ];

    private constructor() {}

    public static getInstance(): GateService {
        if (!GateService.instance) {
            GateService.instance = new GateService();
        }
        return GateService.instance;
    }

    getAllGates(): RailwayGate[] {
        return this.gates;
    }

    getGateStatus(gateId: string): GateStatus {
        const gate = this.gates.find(g => g.id === gateId);
        if (!gate) {
            throw new Error('Gate not found');
        }

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const nextClosingTime = this.findNextClosingTime(gate.closingTimes);
        const isOpen = this.isGateOpen(currentTime, gate.closingTimes, gate.duration);

        return {
            isOpen,
            nextClosingTime,
            remainingTime: this.calculateRemainingTime(currentTime, nextClosingTime)
        };
    }

    private findNextClosingTime(closingTimes: string[]): Date {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        for (const timeStr of closingTimes) {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const closeTime = hours * 60 + minutes;

            if (closeTime > currentTime) {
                const nextClose = new Date();
                nextClose.setHours(hours, minutes, 0, 0);
                return nextClose;
            }
        }

        // If no closing time found today, get first closing time for tomorrow
        const [hours, minutes] = closingTimes[0].split(':').map(Number);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(hours, minutes, 0, 0);
        return tomorrow;
    }

    private isGateOpen(currentTime: number, closingTimes: string[], duration: number): boolean {
        return !closingTimes.some(timeStr => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            const closeTime = hours * 60 + minutes;
            return currentTime >= closeTime && currentTime < (closeTime + duration);
        });
    }

    private calculateRemainingTime(currentTime: number, nextClosingTime: Date): number {
        const closeTime = nextClosingTime.getHours() * 60 + nextClosingTime.getMinutes();
        return closeTime - currentTime;
    }
}