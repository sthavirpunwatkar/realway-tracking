export interface RailwayGate {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    closingTimes: string[];
    duration: number; // Duration in minutes for which gate remains closed
}

export interface GateStatus {
    isOpen: boolean;
    nextClosingTime: Date | null;
    remainingTime: number; // in minutes
}