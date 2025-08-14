import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, put } from '@/services/api/apiService';

// Define the interface for a single driver
interface Driver {
  driver_sno: number;
  driver_name: string;
  service_providers_sno: number;
  service_provider_name: string;
  profile_sno: number | null;
  driver_mobile_number: string;
  licence_sno: number | null;
  reject_reason: string | null;
  active_flag: boolean;
  profile_media: any[] | null;
  licence_media: any[] | null;
}

// Define the interface for the nested API response
interface DriversResponse {
  getdrivers: Driver[];
}

// Define the interface for the full API response
interface DriverData {
  data: DriversResponse[];
}

export interface VerifyDriverPayload {
  driver_sno: any;
  activeFlag: any;
}

export interface RejectDriverPayload {
  driver_sno: any;
  activeFlag: any;
  block_reason: any;
}

export interface UpdateDriversPayload {
  driverSno: number;
  driverName: string;
  driverMobileNumber: number;
  serviceProviderSno: number;
  activeFlag: any;
  profileSno: {
    mediaSno: number;
    containerName: string;
    deleteMediaList: any[];
    mediaList: {
      mediaUrl: string;
      contentType: string;
      mediaType: string;
      thumbnailUrl: string | null;
      mediaSize: number;
      isUploaded: boolean;
      azureId: string;
      documentType: string;
      mediaDetailSno: number;
    }[];
  };
  licenceSno: {
    mediaSno: number;
    containerName: string;
    deleteMediaList: any[];
    mediaList: {
      mediaUrl: string;
      contentType: string;
      mediaType: string;
      thumbnailUrl: string | null;
      mediaSize: number;
      isUploaded: boolean;
      azureId: string;
      documentType: string;
      mediaDetailSno: number;
    }[];
  };
}

export const fetchDrivers = createAsyncThunk(
  'drivers/fetchDrivers',
  async (params: { serviceProviderSno?: number; driverSno?: number; activeFlag?: boolean }) => {
    const query = new URLSearchParams();

    if (params.serviceProviderSno) query.append('service_provider_sno', String(params.serviceProviderSno));
    if (params.driverSno) query.append('driver_sno', String(params.driverSno));
    if (params.activeFlag !== undefined) query.append('activeFlag', String(params.activeFlag));

    const response = (await get(`serviceproviders/driver?${query.toString()}`)) as DriverData;
    console.log(response);
    return response.data;
  }
);

export const RejectDriver = createAsyncThunk<any, RejectDriverPayload>(
  'Driver/RejectDriver',
  async ({ driver_sno, activeFlag, block_reason }, { rejectWithValue }) => {
    try {
      const response = await put('driver', { driver_sno, activeFlag, block_reason });
      return response;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to update quotation');
    }
  }
);

export const VerifyDriver = createAsyncThunk<any, VerifyDriverPayload>(
  'serviceProviders/VerifyServiceProvider',
  async ({ driver_sno, activeFlag }, { rejectWithValue }) => {
    try {
      console.log(`Calling PUT API with driver_sno=${driver_sno} and activeFlag=${activeFlag}`);
      const response = await put('driver', { driver_sno, activeFlag });
      return response;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to update quotation');
    }
  }
);

export const UpdateDrivers = createAsyncThunk(
  'drivers/UpdateDrivers',
  async (payload: UpdateDriversPayload, { rejectWithValue }) => {
    try {
      const response = await put('users/updatedriver', payload);
      return response as Driver;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

const driverSlice = createSlice({
  name: 'drivers',
  initialState: {
    data: [] as DriversResponse[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDrivers.pending, state => {
        state.loading = true;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      .addCase(UpdateDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateDrivers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const updatedDriver = action.payload as Driver;
          const driverList = state.data[0]?.getdrivers || [];
          const index = driverList.findIndex(driver => driver.driver_name === updatedDriver.driver_name);
          if (index !== -1 && state.data[0]) {
            state.data[0].getdrivers[index] = updatedDriver;
          }
        }
      })
      .addCase(UpdateDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default driverSlice.reducer;