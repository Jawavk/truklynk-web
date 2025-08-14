import { ComponentType } from 'react';
import { lazy } from 'react';

interface RouteConfig {
  path: string;
  component: ComponentType;
  protected?: boolean;
}

export const routes: RouteConfig[] = [
  // Public routes (no sidebar) - Remove protected: true or set to false
  {
    path: '/login',
    component: lazy(() =>
      import('@pages/LoginPage').then((module) => ({ default: module.default })),
    ),
    protected: false, // Changed from true to false
  },
  {
    path: '/signup',
    component: lazy(() =>
      import('@pages/Signup').then((module) => ({ default: module.default })),
    ),
    protected: false, // Changed from true to false
  },
  
  // Protected routes (with sidebar)
  {
    path: '/',
    component: lazy(() =>
      import('@/pages/AdminDashboard').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/orders',
    component: lazy(() =>
      import('@pages/OrderManagement').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/assign-service-provider',
    component: lazy(() =>
      import('@pages/AssignServiceProvider').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/neworder',
    component: lazy(() =>
      import('@/pages/NewOrder').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/notesInformation',
    component: lazy(() =>
      import('@/pages/NotesInformation').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/insightdashboard',
    component: lazy(() =>
      import('@/pages/insightdashboard').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/customerrequirements',
    component: lazy(() =>
      import('@pages/CustomerRequirements').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/vehicleorder',
    component: lazy(() =>
      import('@pages/VehicleOrder').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/ordertrack',
    component: lazy(() =>
      import('@pages/OrderTrack').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/serviceproviders',
    component: lazy(() =>
      import('@pages/ServiceProviders').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/vehicleverification',
    component: lazy(() =>
      import('@/pages/VehicleVerification').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/vehicleinformation',
    component: lazy(() =>
      import('@/pages/VehicleInformation ').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/driververification',
    component: lazy(() =>
      import('@/pages/DriverVerification').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/userprofile',
    component: lazy(() =>
      import('@pages/UserProfile').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/driverinformation',
    component: lazy(() =>
      import('@/pages/DriverInformation').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/noteAddDetails',
    component: lazy(() =>
      import('@/pages/NoteAddDetails').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/serviceproviderinformation',
    component: lazy(() =>
      import('@/pages/ServiceProviderInformation').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/customerverification',
    component: lazy(() =>
      import('@/pages/CustomerVerification').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/customerinformation',
    component: lazy(() =>
      import('@/pages/CustomerInformation').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/orderinformation',
    component: lazy(() =>
      import('@pages/OrderInformation').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/website',
    component: lazy(() =>
      import('@pages/Website').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/quotation',
    component: lazy(() =>
      import('@pages/quotation').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/quoteconformation',
    component: lazy(() =>
      import('@/pages/QuoteConformation').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/conformbooking',
    component: lazy(() =>
      import('@pages/ConformBooking').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/orderdetails',
    component: lazy(() =>
      import('@pages/OrderDetails').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  {
    path: '/CancelOptions',
    component: lazy(() => 
      import('@pages/CancelOptions').then((module) => ({ default: module.default }))
    ),
    protected: true,
  },
  {
    path: '/bookingDetails',
    component: lazy(() =>
      import('@pages/BookingDetails').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
  
  // Catch-all route should be last and redirect to dashboard if authenticated
  // or to login if not authenticated
  {
    path: '*',
    component: lazy(() =>
      import('@/pages/AdminDashboard').then((module) => ({ default: module.default })),
    ),
    protected: true,
  },
];