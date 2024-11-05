export interface User {
    phoneNumber: string;
    isVerified: boolean;
}

export interface Route {
    startLocation: {
        latitude: number;
        longitude: number;
        address: string;
    };
    endLocation: {
        latitude: number;
        longitude: number;
        address: string;
    };
    gatesInRoute: string[]; // Array of gate IDs
}