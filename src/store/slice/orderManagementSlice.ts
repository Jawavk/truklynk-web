import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get } from '@/services/api/apiService';

// Define the structure of your API response
interface OrderResponse {
  json: any[];
  isSuccess: boolean;
}

// Export the fetch orders thunk
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => {
    const response = await get('/service/booking') as OrderResponse;
    console.log(response)
    return response; 
  }
);

const orderManagementSlice = createSlice({
  name: 'ordersManagement',
  initialState: {
    data: null as OrderResponse | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOrders.pending, state => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

export default orderManagementSlice.reducer;