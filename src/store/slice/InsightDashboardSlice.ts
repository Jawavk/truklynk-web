import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get } from '@/services/api/apiService';

// Define the structure of your vehicle data (same as in your component)
export interface VehicleData {
  vehicle_sno: number;
  vehicle_number: string;
  vehicle_name: string;
  vehicle_model: string | null;
  lat: string;
  lng: string;
  heading: string;
  updated_on: string;
  status: number;
  service_provider_sno: number;
  company_name: string;
  first_name: string | null;
  last_name: string | null;
  mobile_no: string;
  email: string | null;
  booking_status_cd: number;
}

// Define the structure of your API response
interface ApiResponse {
  json: Array<{
    get_vehicle_location_details: VehicleData[];
  }>;
  isSuccess: boolean;
}

// Define the state interface
interface VehicleState {
  data: VehicleData[];
  loading: boolean;
  error: string | null;
}

// Export the fetch vehicles thunk
export const fetchVehiclesData = createAsyncThunk(
  'vehicles/fetchVehicles',
  async () => {
    const response = await get<ApiResponse>('/admin/location');
    console.log(response.json[0])
    return response.json[0]?.get_vehicle_location_details || [];
  }
);

const InsightDashboardSlice = createSlice({
  name: 'vehicles',
  initialState: {
    data: [],
    loading: false,
    error: null,
  } as VehicleState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchVehiclesData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehiclesData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchVehiclesData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'An error occurred while fetching vehicles';
      });
  },
});

export default InsightDashboardSlice.reducer;