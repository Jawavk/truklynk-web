import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, put } from '@/services/api/apiService';

// Define the structure based on the actual API response
interface BookingItem {
  price: number;
  driver_sno: number | null;
  pickup_lat: number;
  pickup_lng: number;
  vehicle_sno: number | null;
  booking_time: string;
  booking_type: number;
  types_of_goods: string;
  weight_of_goods: number;
  weight_type: string;
  booking_status_cd: number;
  service_booking_sno: number;
  booking_person: number;
  drop_location_address: string;
  distance_from_provider: number;
  pickup_location_address: string;
  distance_from_pickup_to_drop: number;
  service_provider_quotation_sno: number;
}

interface UpdateQuotationPayload {
  service_provider_quotation_sno: number;
  service_provider_sno: number;
  vehicle_sno: number;
  user_profile_sno: number;
  driver_user_profile_sno: number | null;
  price: number;
  updated_on: string;
  quotation_status_name: string;
}

interface AssignDriverPayload {
  service_provider_quotation_sno: number;
  service_provider_sno: number;
  vehicle_sno: number;
  user_profile_sno: number;
  service_booking_sno: number;
  driver_sno: number;
  driver_user_profile_sno: number | null;
  price: number;
  updated_on: string;
  quotation_status_name: string;
}

interface BookingData {
  getnearbyservicebookings: BookingItem[];
}

interface BookingResponse {
  json: BookingData[];
  isSuccess: boolean;
}

export const fetchBookings = createAsyncThunk<BookingResponse, number>(
  'booking/fetchBookings',
  async (serviceProviderId: number) => {
    const response = (await get(
      `users/servicebooking?service_provider_sno=${serviceProviderId}`,
    )) as BookingResponse;
    return response;
  }
);

export const updateQuotationStatus = createAsyncThunk<
  BookingResponse,
  UpdateQuotationPayload,
  { rejectValue: string }
>(
  'booking/updateQuotationStatus',
  async (payload: UpdateQuotationPayload, { rejectWithValue }) => {
    try {
      const response = (await put(`service/quotation`, payload)) as BookingResponse;
      return response;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to update quotation');
    }
  }
);

export const assignDriverStatus = createAsyncThunk<
  BookingResponse,
  AssignDriverPayload,
  { rejectValue: string }
>(
  'booking/assignDriverStatus',

  async (payload: AssignDriverPayload, { rejectWithValue }) => {
    try {
      const response = (await put(`service/quotation`, payload)) as BookingResponse;
      return response;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to update quotation');
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookingSlice',
  initialState: {
    data: null as BookingResponse | null,
    loading: false,
    error: null as string | null,
    selectedProvider: null as any | null,
  },
  reducers: {
    setSelectedProvider: (state, action) => {
      state.selectedProvider = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch bookings';
      })
      .addCase(updateQuotationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuotationStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update state.data if the API returns updated bookings
        state.data = action.payload;
      })
      .addCase(updateQuotationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(assignDriverStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignDriverStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // Now type-safe
      })
      .addCase(assignDriverStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedProvider } = bookingSlice.actions;
export default bookingSlice.reducer;