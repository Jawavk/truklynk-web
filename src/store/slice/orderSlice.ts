import apiService from "@/services/api/apiService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface LatLng {
    latitude: number;
    longitude: number;
}

interface Location {
    address: string;
    latlng: LatLng;
    city: string;
    state: string;
    country: string;
    landmark?: string;
    contact_info?: string;
}

interface CreateOrderPayload {
    booking_type: string;
    booking_person: number;
    sub_category_sno: number;
    landmark: string;
    contact_info: {
        name: string;
        phone: string;
    };
    price: number;
    pickup_location: Location;
    drop_location: Location;
    types_of_goods: string;
    distance: number;
    lat: number;
    lng: number;
    name: string;
    booking_time: string;
    category_name: string;
    weight_type_sno: number | null;
    weight_of_goods: number;
    created_on: string;
    notes: string;
    action_name?: string;
    service_booking_sno?: number;
}

// Add the UpdateBookingPayload interface
interface UpdateBookingPayload {
    service_booking_sno: number;
    booking_status_name: string;
    user_profile_sno: any;
    updated_by: any | null;
    isSendNotification: any;
}

export const createorder = createAsyncThunk(
    'order/createorder',
    async (OrderData: CreateOrderPayload) => {
        console.log(OrderData)
        const response = await apiService.post('service/booking', OrderData);
        console.log(response)
        return response;
    }
);

// Add the updateBookingOrder async thunk
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

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        items: {
            data: []
        },
        status: 'idle',
        error: null,
        loading: false,
        updateLoading: false,
        updateError: null as string | null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createorder.fulfilled, (state: any, action) => {
                if (!state.items.data) {
                    state.items.data = [];
                }
                state.items.data.push(action.payload);
            })
            // Add cases for updateBookingOrder
            .addCase(updateBookingOrder.pending, (state) => {
                state.updateLoading = true;
                state.updateError = null;
            })
            .addCase(updateBookingOrder.fulfilled, (state, action) => {
                state.updateLoading = false;
                state.updateError = null;
                // You can update the specific order in the state if needed
                // For now, we'll just rely on refetching the orders
            })
            .addCase(updateBookingOrder.rejected, (state, action) => {
                state.updateLoading = false;
                state.updateError = (action.payload as string) || 'Update failed';
            });
    },
});

export default orderSlice.reducer;