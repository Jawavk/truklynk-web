import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { get, put, post } from "@/services/api/apiService"

interface Media {
  type?: string
  mediaUrl: string
  mediaType: string
  fileType: string
}

interface Document {
  service_provider_documents_sno: number
  document_type: number
  document_name?: string
  media: Media | Media[]
}

interface Address {
  service_providers_address_sno: number
  service_providers_sno: number
  address_type: number
  address_line_1: string
  address_line_2: string | null
  pin_code: string
  city_name: string
  district_name: string
  country_name: string
  latitude: string
  longitude: string
}

interface SubCategory {
  subcategory_sno?: number
  subcategory_name?: string
  subcategorySno?: number | null
  subcategoryName?: string | null
}

interface Category {
  category_sno?: number
  category_name?: string
  categorySno?: number | null
  categoryName?: string | null
  subCategory: SubCategory
}

interface Service {
  service_sno?: number
  service_name?: string
  serviceSno?: number | null
  serviceName?: string | null
  category: Category
}

interface SelectedService {
  service: Service
}

export interface VerifyServicePayload {
  user_sno: any
  status: any
}

export interface RejectServicePayload {
  user_sno: any
  status: any
  block_reason: any
}

export interface AssignServiceProviderToOrderPayload {
  service_booking_sno: number
  user_profile_sno: number
  vehicle_sno: any
  service_providers_sno: number
}

export interface VehicleData {
  vehicle_sno: number
  service_provider_sno: number
  sub_category_sno: number
  vehicle_number: string
  vehicle_name: string
  lat: string
  lng: string
  status: number
  vehicle_status: string
  updated_on: string
  vehicle_model: string | null
  state: string | null
  rto: string | null
  documents: any
  media: any[]
  distance_from_reference: number | null
}

export interface FetchVehiclesPayload {
  serviceProviderSno: number
  vehicleSno?: number | null
  pickUpLat?: number | null
  pickUpLng?: number | null
  status?: number | null
}

export interface UpdateServiceProviderPayload {
  service_providers_sno: number
  registering_type: number
  first_name: string
  last_name: string
  photo: string | null
  dob: string | null
  gender: number
  selected_service: {
    service: {
      service_sno: number
      service_name: string
      category: {
        category_sno: number
        category_name: string
        subCategory: {
          subcategory_sno: number
          subcategory_name: string
        }
      }
    }
  }
  updated_by: number
  user_profile_sno: number
  company_name: string
  company_register_no: string
  address: {
    address_line_1: string
    city_name: string
    district_name: string
    pin_code: string
    state_name: string
    country_name: string
    latitude: string
    longitude: string
  }
  documents: {
    document_type: number
    media: {
      mediaUrl: string
      type: string | null
      document_type: number
    }[]
  }[]
  created_on: string
  media: any
}

export interface ServiceProviderData {
  users_sno: any
  service_providers_sno: number
  registering_type: number
  first_name: string | null
  last_name: string | null
  company_name: string
  status: any
  mobile_number: string
  reject_reason: any
  dob: string
  gender: number | null
  selected_service: SelectedService
  address: Address[]
  documents: Document[]
  register_type_name: string
}

interface ApiResponse {
  json: Array<{ service_providers: ServiceProviderData[] }>
  isSuccess: boolean
}

export interface CreateServiceProviderPayload {
  name: string
  country_code: number
  mobile_no: string
  address: {
    address_line_1: string
    address_line_2: string
    pin_code: string
    city_name: string
    district_name: string
    state_name: string
    country_name: string
    latitude: string
    longitude: string
  }
  documents: {
    document_type: number
    media: {
      mediaUrl: string
      type: string
      document_type: number
    }[]
  }[]
  location: {
    lat: string
    lng: string
    heading: string
    status: number
  }
  registering_type: number
  first_name: string
  last_name: string
  photo: string | null
  dob: string | null
  gender: number
  selected_service: {
    service: {
      service_sno: number
      service_name: string
      category: {
        category_sno: number
        category_name: string
        subCategory: {
          subcategory_sno: number
          subcategory_name: string
        }
      }
    }
  }
  company_name: string
  company_register_no: string
  updated_by: number
}

export const fetchServiceProviders = createAsyncThunk(
  "serviceProviders/fetchServiceProviders",
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await get<ApiResponse>("/users/serviceproviders")

      if (response.isSuccess && response.json && response.json.length > 0) {
        return response.json[0].service_providers
      }

      return rejectWithValue("Failed to fetch service providers data")
    } catch (error: any) {
      console.error("Error fetching service providers:", error)
      return rejectWithValue(error.message || "An error occurred while fetching service providers")
    }
  },
)

export const fetchAvailableServiceProviders = createAsyncThunk(
  "serviceProviders/fetchAvailableServiceProviders",
  async (_, { rejectWithValue }) => {
    try {
      const response: any = await get<ApiResponse>("/users/serviceproviders?status=1")
        console.log("API Response:", response)
      if (response.isSuccess && response.json && response.json.length > 0) {
        return response.json[0].service_providers
      }

      return rejectWithValue("Failed to fetch available service providers")
    } catch (error: any) {
      console.error("Error fetching available service providers:", error)
      return rejectWithValue(error.message || "An error occurred while fetching available service providers")
    }
  },
)


export const changeServiceProvider = createAsyncThunk(
  "serviceProviders/changeServiceProvider",
  async (serviceBookingSno: number, { rejectWithValue }) => {
    try {
      // Assuming you have an API endpoint to change the service provider
      const response: ApiResponse = await post("/service-bookings/change-provider", {
        serviceBookingSno,
      });

      console.log("API Response:", response);

      if (response.isSuccess) {
        return {
          success: true,
          message: response || "Service provider changed successfully",
        };
      }

      return rejectWithValue({
        success: false,
        message: response || "Failed to change service provider",
      });
    } catch (error: any) {
      console.error("Error changing service provider:", error);
      return rejectWithValue({
        success: false,
        message: error.message || "An error occurred while changing the service provider",
      });
    }
  }
);

export const fetchVehiclesByServiceProvider = createAsyncThunk(
  "serviceProviders/fetchVehiclesByServiceProvider",
  async (payload: FetchVehiclesPayload, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      params.append("serviceProviderSno", payload.serviceProviderSno.toString())
      if (payload.vehicleSno) params.append("vehicleSno", payload.vehicleSno.toString())
      if (payload.pickUpLat) params.append("pickUpLat", payload.pickUpLat.toString())
      if (payload.pickUpLng) params.append("pickUpLng", payload.pickUpLng.toString())
      if (payload.status) params.append("status", payload.status.toString())
        // params.append("status", "1");

      const response: any = await get(`/serviceproviders/vehicle?${params.toString()}`)

      console.log("Full Vehicle API Response:", response)
      console.log("Response type:", typeof response)
      console.log("Response keys:", Object.keys(response))

      // Handle different possible response structures
      if (response) {
        // Case 1: Direct array response (your current data structure)
        if (Array.isArray(response)) {
          console.log("Response is direct array:", response)
          return response
        }

        // Case 2: Response with isSuccess flag
        if (response.isSuccess) {
          // Check for nested data structure
          if (response.data && Array.isArray(response.data)) {
            if (response.data.length > 0 && response.data[0].getvehicles) {
              console.log("Found nested getvehicles:", response.data[0].getvehicles)
              return response.data[0].getvehicles
            }
            console.log("Found direct data array:", response.data)
            return response.data
          }

          // Check for json property
          if (response.json) {
            if (Array.isArray(response.json)) {
              console.log("Found json array:", response.json)
              return response.json
            }
            if (response.json.length > 0 && response.json[0].getvehicles) {
              console.log("Found nested json getvehicles:", response.json[0].getvehicles)
              return response.json[0].getvehicles
            }
          }
        }

        // Case 3: Response has data property with getvehicles
        if (response.data && response.data.length > 0 && response.data[0].getvehicles) {
          console.log("Found data.getvehicles:", response.data[0].getvehicles)
          return response.data[0].getvehicles
        }

        // Case 4: Response has json property
        if (response.json && Array.isArray(response.json)) {
          console.log("Found json array:", response.json)
          return response.json
        }

        // Case 5: Response has vehicles property
        if (response.vehicles && Array.isArray(response.vehicles)) {
          console.log("Found vehicles array:", response.vehicles)
          return response.vehicles
        }
      }

      console.log("No vehicles found in response, returning empty array")
      return []
    } catch (error: any) {
      console.error("Error fetching vehicles:", error)
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response,
      })
      return rejectWithValue(error.message || "An error occurred while fetching vehicles")
    }
  },
)

export const VerifyServiceProvider = createAsyncThunk<any, VerifyServicePayload>(
  "serviceProviders/VerifyServiceProvider",
  async ({ user_sno, status }, { rejectWithValue }) => {
    try {
      console.log(`Calling PUT API with user_sno=${user_sno} and status=${status}`)
      const response = await put("user", { user_sno, status })
      return response
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to update quotation")
    }
  },
)

export const RejectServiceProvider = createAsyncThunk<any, RejectServicePayload>(
  "ServiceProviders/RejectServiceProvider",
  async ({ user_sno, status, block_reason }, { rejectWithValue }) => {
    try {
      const response = await put("user", { user_sno, status, block_reason })
      return response
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to update quotation")
    }
  },
)

export const CreateServiceProvider = createAsyncThunk(
  "ServiceProviders/CreateServiceProvider",
  async (payload: CreateServiceProviderPayload, { rejectWithValue }) => {
    try {
      const response = await post("admin/serviceprovider", { payload })
      return response as ServiceProviderData
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to create service provider")
    }
  },
)

export const AssignServiceProviderToOrder = createAsyncThunk(
  "ServiceProviders/AssignServiceProviderToOrder",
  async (payload: AssignServiceProviderToOrderPayload, { rejectWithValue }) => {
    try {
      const response = await put("service/quotation", {
        service_booking_sno: payload.service_booking_sno,
        user_profile_sno: payload.user_profile_sno,
        service_providers_sno: payload.service_providers_sno,
        vehicle_sno: payload.vehicle_sno,
        booking_status_cd: 73, // Update status to "Accept"
      })
      return response
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to assign service provider to order")
    }
  },
)

export const UpdateServiceProvider = createAsyncThunk(
  "ServiceProviders/UpdateServiceProvider",
  async (payload: UpdateServiceProviderPayload, { rejectWithValue }) => {
    try {
      const response = await put("serviceproviders/updateserviceprovider", payload)
      return response as ServiceProviderData
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  },
)

const serviceProviderSlice = createSlice({
  name: "serviceProviders",
  initialState: {
    data: [] as ServiceProviderData[],
    availableProviders: [] as ServiceProviderData[],
    vehicles: [] as VehicleData[],
    loading: false,
    vehiclesLoading: false,
    availableProvidersLoading: false,
    error: null as string | null,
    vehiclesError: null as string | null,
    availableProvidersError: null as string | null,
  },
  reducers: {
    clearVehicles: (state) => {
      state.vehicles = []
      state.vehiclesError = null
    },
    clearAvailableProviders: (state) => {
      state.availableProviders = []
      state.availableProvidersError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServiceProviders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchServiceProviders.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchServiceProviders.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchAvailableServiceProviders.pending, (state) => {
        state.availableProvidersLoading = true
        state.availableProvidersError = null
      })
      .addCase(fetchAvailableServiceProviders.fulfilled, (state, action) => {
        state.availableProvidersLoading = false
        state.availableProviders = action.payload
      })
      .addCase(fetchAvailableServiceProviders.rejected, (state, action) => {
        state.availableProvidersLoading = false
        state.availableProvidersError = action.payload as string
      })
      .addCase(fetchVehiclesByServiceProvider.pending, (state) => {
        state.vehiclesLoading = true
        state.vehiclesError = null
      })
      .addCase(fetchVehiclesByServiceProvider.fulfilled, (state, action) => {
        state.vehiclesLoading = false
        state.vehicles = action.payload
        console.log("Vehicles stored in state:", action.payload)
      })
      .addCase(fetchVehiclesByServiceProvider.rejected, (state, action) => {
        state.vehiclesLoading = false
        state.vehiclesError = action.payload as string
        console.log("Vehicle fetch error:", action.payload)
      })
      .addCase(CreateServiceProvider.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(CreateServiceProvider.fulfilled, (state, action) => {
        state.loading = false
        state.data = [...state.data, action.payload]
      })
      .addCase(CreateServiceProvider.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearVehicles, clearAvailableProviders } = serviceProviderSlice.actions
export default serviceProviderSlice.reducer
