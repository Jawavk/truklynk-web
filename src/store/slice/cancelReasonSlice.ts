import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiService, { get } from "@/services/api/apiService";

// Define the type for a single cancel reason
export interface CancelReason {
  cancel_reason_sno: number | null;
  id: string;
  reason: string;
  // Add more fields as needed
}
export interface ServiceProviderPayload {
  role: any;
}
interface UpdateBookingPayload {
  booking_status_name: any;
  service_booking_sno: any;
  user_profile_sno: any;
  updated_by: any | null;
  updated_time: any;
  isSendNotification: any;
  cancelreasonSno: any;
  isCustomer: any;
  cancelreason: any;
}

// Define the state type
interface CancelReasonState {
  json: CancelReason[];
  loading: boolean;
  error: string | null;
}
interface UpdateBookingState {
  data: any;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  loading: boolean;
}
// Initial state
const initialState: CancelReasonState = {
  json: [],
  loading: false,
  error: null,
};

export const fetchServiceBooking: any = createAsyncThunk<ServiceProviderPayload[], ServiceProviderPayload, { rejectValue: string }>(
  'cancel/fetchServiceBooking',
  async ({ role }, { rejectWithValue }) => {
    try {
      const response: any = await apiService.get(`/cancelreason?role=${role}`
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch data');
    }
  }
);
export const updateBookingOrder = createAsyncThunk(
  'order/updateOrder',
  async (data: UpdateBookingPayload, { rejectWithValue }) => {
    try {
      const response: any = await apiService.put('/service/booking', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Something went wrong');
    }
  }
);
export const cancelReasonSlice = createSlice({
  name: "cancelReason",
  initialState: {
    data: [],
    status: 'idle',
    error: null,
    loading: false,
  } as UpdateBookingState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchServiceBooking.fulfilled,
        (state, action: PayloadAction<CancelReason[]>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchServiceBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Something went wrong";
      })
      .addCase(updateBookingOrder.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBookingOrder.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateBookingOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default cancelReasonSlice.reducer;
