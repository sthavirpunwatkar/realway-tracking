import { Geolocation } from '@nativescript/geolocation';
import { CoreTypes } from '@nativescript/core';

export class LocationService {
    private static instance: LocationService;
    
    private constructor() {}

    public static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    async getCurrentLocation() {
        const hasPermission = await this.enableLocation();
        if (!hasPermission) {
            throw new Error('Location permission denied');
        }

        return await Geolocation.getCurrentLocation({
            desiredAccuracy: CoreTypes.Accuracy.high,
            maximumAge: 5000,
            timeout: 20000
        });
    }

    private async enableLocation(): Promise<boolean> {
        const hasPermission = await Geolocation.hasPermission();
        if (!hasPermission) {
            return await Geolocation.requestPermission();
        }
        return true;
    }

    async startLocationTracking(callback: (location: any) => void): Promise<number> {
        const hasPermission = await this.enableLocation();
        if (!hasPermission) {
            throw new Error('Location permission denied');
        }

        return Geolocation.watchLocation(
            (location) => {
                callback(location);
            },
            (error) => {
                console.error('Location tracking error:', error);
            },
            {
                desiredAccuracy: CoreTypes.Accuracy.high,
                updateDistance: 50,
                minimumUpdateTime: 20000
            }
        );
    }

    stopLocationTracking(watchId: number) {
        Geolocation.clearWatch(watchId);
    }
}