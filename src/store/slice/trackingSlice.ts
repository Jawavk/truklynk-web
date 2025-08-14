import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get } from '@/services/api/apiService';

// Define API response interface
interface ApiResponse {
  isSuccess: boolean;
  json: any[];
}

// Define interfaces
interface LatLng {
  latitude: number;
  longitude: number;
}

interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  latlng: LatLng;
  landmark: string;
  contact_info: string;
}

interface JourneyDetail {
  status: string;
  createdOn: string;
  icon: string;
  activeIndex?: number;
}

interface JourneyDetails {
  journeyDetails: JourneyDetail[];
  driverName: string;
  totalWeight: number;
  weightType: string;
  plateNumber: string;
  pickupLocation: Location;
  dropLocation: Location;
  cancelPermission: boolean;
}

interface VehicleLocation {
  lat: number;
  lng: number;
  heading: number;
}

interface TrackingState {
  journeyDetails: JourneyDetails | null;
  vehicleLocation: VehicleLocation | null;
  loading: boolean;
  error: string | null;
}

// Fetch journey details
export const fetchJourneyDetails = createAsyncThunk(
  'tracking/fetchJourneyDetails',
  async (serviceBookingSno: number, { rejectWithValue }) => {
    try {
      console.log('Initiating fetchJourneyDetails with service_booking_sno:', serviceBookingSno);
      const response = (await get(`users/get_track_order?service_booking_sno=${serviceBookingSno}`)) as ApiResponse;
      console.log('Journey Details API Full Response:', response);
      console.log('Journey Details API Response Data:', response.json);
      if (response.isSuccess && response.json?.length > 0) {
        console.log('Journey Details Success:', response.json[0]);
        return response.json[0];
      }
      console.warn('Journey Details API returned no data:', response);
      return rejectWithValue('Failed to fetch journey details: No data returned');
    } catch (error: any) {
      console.error('Journey Details API Error:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
      });
      return rejectWithValue(`Failed to fetch journey details: ${error.message}`);
    }
  }
);

// Fetch vehicle location
export const fetchVehicleLocation = createAsyncThunk(
  'tracking/fetchVehicleLocation',
  async (vehicleSno: number, { rejectWithValue }) => {
    try {
      console.log('Initiating fetchVehicleLocation with vehicle_sno:', vehicleSno);
      const response = (await get(`serviceproviders/lastvehiclelocation?vehicle_sno=${vehicleSno}`)) as ApiResponse;
      console.log('Vehicle Location API Full Response:', response);
      console.log('Vehicle Location API Response Data:', response.json);
      if (
        response.isSuccess &&
        response.json?.length > 0 &&
        response.json[0]?.getlastvehiclelocation
      ) {
        console.log('Vehicle Location Success:', response.json[0].getlastvehiclelocation);
        return response.json[0].getlastvehiclelocation as VehicleLocation;
      }
      console.warn('Vehicle Location API returned no data:', response);
      return rejectWithValue('Failed to fetch vehicle location: No data returned');
    } catch (error: any) {
      console.error('Vehicle Location API Error:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
      });
      return rejectWithValue(`Failed to fetch vehicle location: ${error.message}`);
    }
  }
);

const trackingSlice = createSlice({
  name: 'tracking',
  initialState: {
    journeyDetails: null,
    vehicleLocation: null,
    loading: false,
    error: null,
  } as TrackingState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJourneyDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJourneyDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.journeyDetails = action.payload;
      })
      .addCase(fetchJourneyDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch journey details';
      })
      .addCase(fetchVehicleLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleLocation = action.payload;
      })
      .addCase(fetchVehicleLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch vehicle location';
      });
  },
});

export default trackingSlice.reducer;