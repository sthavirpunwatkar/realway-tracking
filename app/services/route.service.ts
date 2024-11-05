import { Route } from '../models/user.model';
import { GateService } from './gate.service';
import { LocationService } from './location.service';

export class RouteService {
    private static instance: RouteService;
    private currentRoute: Route | null = null;
    private gateService: GateService;
    private locationService: LocationService;

    private constructor() {
        this.gateService = GateService.getInstance();
        this.locationService = LocationService.getInstance();
    }

    public static getInstance(): RouteService {
        if (!RouteService.instance) {
            RouteService.instance = new RouteService();
        }
        return RouteService.instance;
    }

    async planRoute(startAddress: string, endAddress: string): Promise<Route> {
        // In real app, use Google Maps Geocoding API
        const route: Route = {
            startLocation: {
                latitude: 0,
                longitude: 0,
                address: startAddress
            },
            endLocation: {
                latitude: 0,
                longitude: 0,
                address: endAddress
            },
            gatesInRoute: []
        };

        // Find gates along the route
        const allGates = this.gateService.getAllGates();
        route.gatesInRoute = allGates
            .filter(gate => this.isGateInRoute(
                route.startLocation,
                route.endLocation,
                { latitude: gate.latitude, longitude: gate.longitude }
            ))
            .map(gate => gate.id);

        this.currentRoute = route;
        return route;
    }

    private isGateInRoute(start: any, end: any, gateLocation: any): boolean {
        // Simplified check - in real app, use proper route calculation
        const buffer = 0.02; // Roughly 2km buffer
        const minLat = Math.min(start.latitude, end.latitude) - buffer;
        const maxLat = Math.max(start.latitude, end.latitude) + buffer;
        const minLng = Math.min(start.longitude, end.longitude) - buffer;
        const maxLng = Math.max(start.longitude, end.longitude) + buffer;

        return gateLocation.latitude >= minLat &&
               gateLocation.latitude <= maxLat &&
               gateLocation.longitude >= minLng &&
               gateLocation.longitude <= maxLng;
    }

    getCurrentRoute(): Route | null {
        return this.currentRoute;
    }
}