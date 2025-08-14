import apiService from '@/services/api/apiService';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export interface QuotationParams {
    service_booking_sno: number;

}
interface DataState {
    quotations: QuotationParams[];
    loading: boolean;
    error: string | null;
    eventStatus: any
}

const initialState: DataState = {
    quotations: [],
    loading: false,
    error: null,
    eventStatus: 0,
};


export const fetchQuotation: any = createAsyncThunk<QuotationParams[], QuotationParams, { rejectValue: string }>(
    'quotation/fetchQuotation',
    async ({ service_booking_sno }, { rejectWithValue }) => {
        console.log(service_booking_sno);
        try {
            const response: any = await apiService.get(
                `service/quotation?service_booking_sno=${service_booking_sno}`
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch data');
        }
    }
);


const customerSlice = createSlice({
    name: 'quotation',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchQuotation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchQuotation.fulfilled, (state, action) => {
                state.loading = false;
                state.quotations = action.payload;
            })
            .addCase(fetchQuotation.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Unknown error';
            });
    },
});

export default customerSlice.reducer;