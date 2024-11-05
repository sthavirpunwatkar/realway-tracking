import { Observable } from '@nativescript/core';
import { RouteService } from '../../services/route.service';
import { AuthService } from '../../services/auth.service';
import { Frame } from '@nativescript/core';

export class RoutePlannerViewModel extends Observable {
    private routeService: RouteService;
    private authService: AuthService;

    startLocation: string = '';
    endLocation: string = '';
    hasRoute: boolean = false;
    gatesInRoute: any[] = [];

    constructor() {
        super();
        this.routeService = RouteService.getInstance();
        this.authService = AuthService.getInstance();
    }

    async planRoute() {
        if (this.startLocation && this.endLocation) {
            const route = await this.routeService.planRoute(
                this.startLocation,
                this.endLocation
            );

            this.set('hasRoute', true);
            this.set('gatesInRoute', route.gatesInRoute.map(gateId => ({
                name: `Gate ${gateId}`,
                status: 'OPEN'
            })));
        }
    }

    startJourney() {
        Frame.topmost().navigate({
            moduleName: 'main-page',
            clearHistory: true
        });
    }

    logout() {
        this.authService.logout();
        Frame.topmost().navigate({
            moduleName: 'views/login/login-page',
            clearHistory: true
        });
    }
}