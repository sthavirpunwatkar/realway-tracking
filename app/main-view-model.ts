import { Observable, Utils } from '@nativescript/core';
import { LocationService } from './services/location.service';
import { GateService } from './services/gate.service';
import { RailwayGate } from './models/gate.model';

export class MainViewModel extends Observable {
    private locationService: LocationService;
    private gateService: GateService;
    private watchId: number;
    private updateTimer: number;
    private selectedGate: RailwayGate | null = null;

    userLatitude: number = 0;
    userLongitude: number = 0;
    selectedGateName: string = '';
    gateStatus: string = '';
    remainingTime: string = '';
    isTracking: boolean = false;
    hasActiveGate: boolean = false;
    distance: string = '0';

    constructor() {
        super();
        this.locationService = LocationService.getInstance();
        this.gateService = GateService.getInstance();
        this.initializeLocation();
    }

    async initializeLocation() {
        try {
            const location = await this.locationService.getCurrentLocation();
            this.updateLocation(location);
        } catch (error) {
            console.error('Error getting location:', error);
        }
    }

    updateLocation(location: any) {
        this.set('userLatitude', location.latitude);
        this.set('userLongitude', location.longitude);
        
        if (this.selectedGate) {
            this.updateDistanceToGate(location);
        }
    }

    toggleTracking() {
        if (this.isTracking) {
            this.stopTracking();
        } else {
            this.startTracking();
        }
    }

    async startTracking() {
        if (this.isTracking) return;

        try {
            this.set('isTracking', true);
            this.watchId = await this.locationService.startLocationTracking((location) => {
                this.updateLocation(location);
                this.checkNearbyGates(location);
            });

            // Start periodic status updates
            this.updateTimer = setInterval(() => {
                if (this.selectedGate) {
                    this.updateGateStatus(this.selectedGate);
                }
            }, 60000); // Update every minute
        } catch (error) {
            console.error('Error starting tracking:', error);
            this.set('isTracking', false);
        }
    }

    stopTracking() {
        if (this.watchId) {
            this.locationService.stopLocationTracking(this.watchId);
        }
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }
        this.set('isTracking', false);
    }

    private checkNearbyGates(location: any) {
        const gates = this.gateService.getAllGates();
        const nearbyGate = this.findNearestGate(gates, location);
        
        if (nearbyGate && this.calculateDistance(
            location.latitude,
            location.longitude,
            nearbyGate.latitude,
            nearbyGate.longitude
        ) <= 2) { // Only alert if within 2km
            this.selectGate(nearbyGate);
        }
    }

    selectGate(gate: RailwayGate) {
        this.selectedGate = gate;
        this.set('selectedGateName', gate.name);
        this.set('hasActiveGate', true);
        this.updateGateStatus(gate);
        this.updateDistanceToGate({
            latitude: this.userLatitude,
            longitude: this.userLongitude
        });
    }

    private updateDistanceToGate(location: any) {
        if (!this.selectedGate) return;

        const distance = this.calculateDistance(
            location.latitude,
            location.longitude,
            this.selectedGate.latitude,
            this.selectedGate.longitude
        );
        this.set('distance', distance.toFixed(1));
    }

    private updateGateStatus(gate: RailwayGate) {
        const status = this.gateService.getGateStatus(gate.id);
        this.set('gateStatus', status.isOpen ? 'OPEN' : 'CLOSED');
        this.set('remainingTime', status.isOpen ? 
            `Next closing in ${status.remainingTime} minutes` :
            `Opens in ${status.remainingTime} minutes`);
    }

    onNavigate() {
        if (!this.selectedGate) return;

        const lat = this.selectedGate.latitude;
        const lng = this.selectedGate.longitude;
        
        if (Utils.isAndroid) {
            Utils.openUrl(`google.navigation:q=${lat},${lng}`);
        } else {
            Utils.openUrl(`maps://app?daddr=${lat},${lng}`);
        }
    }

    onMapReady(args: any) {
        const mapView = args.object;
        const gates = this.gateService.getAllGates();
        
        gates.forEach(gate => {
            const status = this.gateService.getGateStatus(gate.id);
            mapView.addMarker({
                position: {
                    latitude: gate.latitude,
                    longitude: gate.longitude
                },
                title: gate.name,
                snippet: status.isOpen ? 'Gate is OPEN' : 'Gate is CLOSED',
                icon: status.isOpen ? 'res://marker_green' : 'res://marker_red'
            });
        });
    }

    private findNearestGate(gates: RailwayGate[], location: any): RailwayGate | null {
        let nearest: RailwayGate | null = null;
        let minDistance = Infinity;

        gates.forEach(gate => {
            const distance = this.calculateDistance(
                location.latitude,
                location.longitude,
                gate.latitude,
                gate.longitude
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = gate;
            }
        });

        return nearest;
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    private toRad(value: number): number {
        return value * Math.PI / 180;
    }
}