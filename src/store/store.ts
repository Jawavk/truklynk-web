import { configureStore } from '@reduxjs/toolkit';
import orderReducer from './slice/orderSlice'
import vehicleReducer from './slice/vehicleSlice';
import serviceProviderReducer from './slice/serviceProviderSlice';
import driverReducer from './slice/driverSlice';
import orderManagementReducer from './slice/orderManagementSlice'
import customerDataReducer from './slice/customerSlice';
import bookingReducer from './slice/bookingSlice';
import quotationReducer from './slice/quotationSlice'
import trackingReducer from './slice/trackingSlice'; 
import cancelReasonReducer from './slice/cancelReasonSlice';
import InsightDashboardSlice from './slice/InsightDashboardSlice';
import notesReducer from './slice/notesSlice';


export const store = configureStore({
  reducer: {
    order: orderReducer,
    vehicles: vehicleReducer,
    serviceProviders: serviceProviderReducer,
    drivers: driverReducer,
    OrdersManagement: orderManagementReducer,
    customer: customerDataReducer,
    notes: notesReducer,
    InsightDashboard : InsightDashboardSlice,
    booking: bookingReducer,
    quotation: quotationReducer,
    tracking: trackingReducer,
    cancelReason: cancelReasonReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
