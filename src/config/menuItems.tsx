import { BrickWall } from 'lucide-react';

export const menuItems = [
  {
    name: 'Dashboard',
    icon: BrickWall,
    route: '/AdminDashboard',
    header: 'Dashboard',
  },
  {
    name: 'Bookings',
    icon: BrickWall,
    route: '/orders',
    header: 'Home',
  },
  {
    name: 'Assets & Accounts',
    icon: BrickWall,
    header: 'Assets & Accounts',
    submenu: [
      {
        name: 'Service Providers',
        route: '/serviceproviders',
      },
      {
        name: 'All Vehicles',
        route: '/vehicleverification',
      },
      {
        name: 'All Drivers',
        route: '/driververification',
      },
      {
        name: 'All Customers',
        route: '/customerverification',
      },

    ]
  },
  // {
  //   name: 'Billings',
  //   icon: BrickWall,
  //   route: '/billingsdashboard',
  //   header: 'Billings',
  // },
  {
    name: 'Notes',
    icon: BrickWall,
    route: '/notesInformation',
    header: 'Insights',
  },
  {
    name: 'Insights',
    icon: BrickWall,
    route: '/insightdashboard',
    header: 'Insights',
  },
  {
    name: 'Website',
    icon: BrickWall,
    route: '/website',
    header: 'Website',
  },
];