import apiService, { put } from '@/services/api/apiService';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface CustomerData {
    users_sno: any;
    reject_reason: any;
    email: any;
    id: number;
    name: string;
    phoneNumber: number;
    user_profile_sno: any;
    status: number;
    documents: any;
}
export interface BookingParams {
    userProfileSno: number;
    status: string;
    skip: number;
    limits: number;
}

export interface RetryQuotationParams {
    service_booking_sno: number;
    lat: number;
    lng: number;
    bookingPerson: number;
    sub_category_sno: number;
}


export interface VerifyCustomerPayload {
    user_sno: any;
    status: any;
}

export interface RejectCustomerPayload {
    user_sno: any;
    status: any;
    block_reason: any
}
interface DataState {
    bookings: BookingParams[];
    loading: boolean;
    error: string | null;
    data: CustomerData[];
    eventStatus: any;
    user_sno: any
}

const initialState: DataState = {
    bookings: [],
    loading: false,
    error: null,
    data: [],
    eventStatus: 0,
    user_sno: null,
};

export const fetchCustomerData = createAsyncThunk<CustomerData[], void, { rejectValue: string }>(
    'customer/fetchCustomerData',
    async (_, { rejectWithValue }) => {
        try {
            const response: any = await apiService.get('users/getprofile');
            return response?.json?.[0]?.getuserprofile?.profiles || [];
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch profiles');
        }
    }
);

export const fetchBookingById: any = createAsyncThunk<BookingParams[], BookingParams, { rejectValue: string }>(
    'customer/fetchBookingById',
    async ({ userProfileSno, status, skip, limits }, { rejectWithValue }) => {
        try {
            const response: any = await apiService.get(
                `service/getallbooking?userProfileSno=${userProfileSno}&status=${status}&skip=${skip}&limits=${limits}`
            );
            console.log(response)
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch data');
        }
    }
);


export const retryQuotation = createAsyncThunk<any, RetryQuotationParams, { rejectValue: string }>(
    'customer/retryQuotation',
    async ({ service_booking_sno, lat, lng, bookingPerson, sub_category_sno }, { rejectWithValue }) => {
        try {
            const response: any = await apiService.put('service/searchQuotationServiceProviderSchedule', {
                service_booking_sno,
                lat,
                lng,
                bookingPerson,
                sub_category_sno
            });
            if (response.isSuccess) {
                if (
                    response.json?.[0]?.searchQuotationServiceProviderSchedule?.[0]?.serviceBookingSno
                ) {
                    return { message: "Quotation retry initiated" };
                } else {
                    return {
                        message: response.json?.[0]?.searchQuotationServiceProviderSchedule?.[0]?.message ||
                            "New Quotation added successfully"
                    };
                }
            } else {
                return rejectWithValue("Please try again");
            }
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to retry quotation");
        }
    }
);

export const VerifyCustomer = createAsyncThunk<any, VerifyCustomerPayload>(
    'customer/VerifyCustomer',
    async ({ user_sno, status }, { rejectWithValue }) => {
        try {
            console.log(`Calling PUT API with user_sno=${user_sno} and status=${status}`);
            const response = await put('user', { user_sno, status });
            return response;
        } catch (err: any) {
            return rejectWithValue(err?.message || 'Failed to update quotation');
        }
    }
);
export const RejectCustomer = createAsyncThunk<any, RejectCustomerPayload>(
    'customer/RejectCustomer',
    async ({ user_sno, status, block_reason }, { rejectWithValue }) => {
        try {
            const response = await put('user', { user_sno, status, block_reason });
            return response;
        } catch (err: any) {
            return rejectWithValue(err?.message || 'Failed to update quotation');
        }
    }
);
const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {
        setEventStatus: (state, action: PayloadAction<number>) => {
            state.eventStatus = action.payload;
        },
      
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomerData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomerData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchCustomerData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
            })
            .addCase(fetchBookingById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBookingById.fulfilled, (state, action) => {
                state.loading = false;
                state.bookings = action.payload;
            })
            .addCase(fetchBookingById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
            })
            .addCase(retryQuotation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(retryQuotation.fulfilled, (state, action) => {
                state.loading = false;
                // Optionally update state if needed
            })
            .addCase(retryQuotation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
            });
    },
});

export const { setEventStatus } = customerSlice.actions;
export default customerSlice.reducer;