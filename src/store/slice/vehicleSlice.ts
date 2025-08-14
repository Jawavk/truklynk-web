import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { get, put } from '@/services/api/apiService';

interface VehicleData {
  vehicleSno: number;
  serviceProviderSno: number;
  subCategorySno: number;
  vehicleName: string;
  vehicleModel: string;
  tonCapacity: string;
  vehicleNumber: string;
  documents?: {
    mediaSno: number;
    containerName: string;
    deleteMediaList: any[];
    mediaList: {
      mediaUrl: string;
      contentType: string;
      mediaType: string;
      thumbnailUrl: string;
      mediaSize: number;
      isUploaded: boolean;
      azureId: string;
      documentType: string;
      mediaDetailSno: number;
    }[];
  };
}

// Fetch vehicles
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async () => {
    const response = (await get('serviceproviders/vehicle')) as { data: VehicleData[] };
    return response.data;
  }
);

// Update vehicle
export const UpdateVehicles = createAsyncThunk(
  'vehicles/UpdateVehicles',
  async (payload: VehicleData, { rejectWithValue }) => {
    try {
      console.log(payload)
      const response = await put('users/updatevehicle', payload);
      return response as VehicleData;
    } catch (error: any) {
      console.error('Update vehicle error:', error);
      return rejectWithValue(error.response?.data || 'Failed to update vehicle');
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState: {
    data: [] as VehicleData[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      })
      // Update vehicles
      .addCase(UpdateVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateVehicles.fulfilled, (state, action) => {
        state.loading = false;
        const updatedVehicle = action.payload;
        const index = state.data.findIndex(
          (vehicle) => vehicle.vehicleSno === updatedVehicle.vehicleSno
        );
        if (index !== -1) {
          state.data[index] = updatedVehicle; // Update the vehicle in the array
        }
      })
      .addCase(UpdateVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default vehicleSlice.reducer;
