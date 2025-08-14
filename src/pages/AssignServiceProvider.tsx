import Button from "@/components/ui/form/Button"
import { Card } from "@/components/ui/layout/Card"
import { Modal } from "@/components/ui/layout/Modal"
import {
    Truck,
    MapPin,
    Phone,
    Building,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    ArrowLeft,
    Car,
    Info,
    Search,
    Calendar,
    User,
    Star,
    Shield,
    Zap,
    Loader2,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import type { AppDispatch, RootState } from "@/store/store"
import {
    fetchAvailableServiceProviders,
    fetchVehiclesByServiceProvider,
    AssignServiceProviderToOrder,
    clearVehicles,
    type ServiceProviderData,
    type VehicleData,
} from "@/store/slice/serviceProviderSlice"
import { toast, Toaster } from "react-hot-toast"
import {  useReverseGeocoding } from "@/utils/geocoding"

interface TransformedServiceProvider {
    id: number
    name: string
    companyName: string
    mobile_number: string
    addressLine: string
    city: string
    district: string
    pincode: string
    rating?: number
    completedOrders?: number
    isVerified?: boolean
    originalData: ServiceProviderData
}

export default function AssignServiceProvider() {
    const dispatch = useDispatch<AppDispatch>()
    const location = useLocation()
    const navigate = useNavigate()

    const {
        availableProviders,
        vehicles,
        availableProvidersLoading,
        vehiclesLoading,
        availableProvidersError,
        vehiclesError,
    } = useSelector((state: RootState) => state.serviceProviders)

    const orderData = location.state?.order
    const fromOrderManagement = location.state?.fromOrderManagement

    const [selectedProvider, setSelectedProvider] = useState<TransformedServiceProvider | null>(null)
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [serviceProviders, setServiceProviders] = useState<TransformedServiceProvider[]>([])
    const [assigning, setAssigning] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        dispatch(fetchAvailableServiceProviders())
        return () => {
            console.log(orderData)
            dispatch(clearVehicles())
        }
    }, [dispatch])

    useEffect(() => {
        if (availableProviders && availableProviders.length > 0) {
            const transformedProviders = availableProviders.map((provider): TransformedServiceProvider => {
                const address = provider.address && provider.address.length > 0 ? provider.address[0] : null
                return {
                    id: provider.service_providers_sno,
                    name: provider.company_name || `${provider.first_name || ""} ${provider.last_name || ""}`.trim(),
                    companyName: provider.company_name || "",
                    mobile_number: provider.mobile_number || "",
                    addressLine: address?.address_line_1 || "",
                    city: address?.city_name || "",
                    district: address?.district_name || "",
                    pincode: address?.pin_code || "",
                    isVerified: provider.status === 1,
                    originalData: provider,
                }
            })
            setServiceProviders(transformedProviders)
        }
    }, [availableProviders])


    

    const handleProviderSelect = (provider: TransformedServiceProvider) => {
        setSelectedProvider(provider)
        setSelectedVehicle(null)


        dispatch(
            fetchVehiclesByServiceProvider({
                serviceProviderSno: provider.id,
                status: 1, // Always send status as 1 as requested
            }),
        )
    }

    const handleVehicleSelect = (vehicle: VehicleData) => {
        if (vehicle.status === 1) {
            setSelectedVehicle(vehicle)
        }
    }

    const handleAssignConfirm = async () => {
        if (!selectedProvider || !orderData) return

        setAssigning(true)
        try {
            await dispatch(
                AssignServiceProviderToOrder({
                    service_booking_sno: orderData.service_booking_sno,
                    service_providers_sno: selectedProvider.id,
                    user_profile_sno: orderData.user_profile_sno,
                    vehicle_sno: selectedVehicle?.vehicle_sno,
                }),
            ).unwrap()

            toast.success("Service provider assigned successfully!", {
                duration: 3000,
                position: "top-right",
                style: {
                    background: "#10b981",
                    color: "#ffffff",
                    border: "1px solid #059669",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.2)",
                },
            })

            setTimeout(() => {
                navigate("/ordermanagement", {
                    state: { assignmentSuccess: true },
                })
            }, 1500)
        } catch (error: any) {
            toast.error(error.message || "Failed to assign service provider", {
                duration: 4000,
                position: "top-right",
                style: {
                    background: "#ef4444",
                    color: "#ffffff",
                    border: "1px solid #dc2626",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.2)",
                },
            })
        } finally {
            setAssigning(false)
            setShowConfirmModal(false)
        }
    }

    const getVehicleStatusInfo = (status: string) => {
        switch (status?.toLowerCase()) {
            case "available":
                return {
                    label: "Available",
                    color: "bg-emerald-500",
                    bgColor: "bg-emerald-900/50",
                    textColor: "text-emerald-400",
                    icon: CheckCircle,
                }
            case "occupied":
                return {
                    label: "Occupied",
                    color: "bg-red-500",
                    bgColor: "bg-red-900/50",
                    textColor: "text-red-400",
                    icon: XCircle,
                }
            case "maintenance":
                return {
                    label: "Maintenance",
                    color: "bg-amber-500",
                    bgColor: "bg-amber-900/50",
                    textColor: "text-amber-400",
                    icon: AlertTriangle,
                }
            default:
                return {
                    label: "Unknown",
                    color: "bg-gray-500",
                    bgColor: "bg-gray-700",
                    textColor: "text-gray-400",
                    icon: Clock,
                }
        }
    }

    const filteredProviders = serviceProviders.filter(provider =>
        provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const ServiceProviderCard = ({ provider }: { provider: TransformedServiceProvider }) => {
        const isSelected = selectedProvider?.id === provider.id

        return (
            <div
                className={`group relative overflow-hidden rounded-lg border transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${isSelected
                        ? "border-blue-500 bg-gradient-to-r from-gray-800 to-gray-700 shadow-xl"
                        : "border-gray-700 bg-gray-800 hover:border-gray-600 hover:shadow-lg"
                    }`}
                onClick={() => handleProviderSelect(provider)}
            >
                <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className={`relative p-3 rounded-full ${isSelected ? "bg-blue-900/50" : "bg-gray-700"} group-hover:bg-blue-900/50 transition-colors`}>
                                <Building className={`h-6 w-6 ${isSelected ? "text-blue-400" : "text-gray-400"} group-hover:text-blue-400`} />
                                {provider.isVerified && (
                                    <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                                        <Shield className="h-3 w-3 text-white" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{provider.companyName}</h3>
                                <p className="text-sm font-medium text-gray-400 flex items-center">
                                    <User className="h-4 w-4 mr-1" />
                                    {provider.name}
                                </p>
                            </div>
                        </div>
                        {isSelected && (
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                                <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center text-gray-400 text-sm">
                            <Phone className="h-4 w-4 mr-2 text-blue-400" />
                            <span className="font-medium">{provider.mobile_number}</span>
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-red-400" />
                            <span>{provider.city && provider.district ? `${provider.city}, ${provider.district}` : "Location not available"}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div className="flex items-center space-x-4">
                            {provider.rating && (
                                <div className="flex items-center">
                                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                    <span className="text-sm font-semibold text-gray-300">{provider.rating}</span>
                                </div>
                            )}
                            {provider.completedOrders && (
                                <div className="text-sm text-gray-400">
                                    {provider.completedOrders} orders
                                </div>
                            )}
                        </div>
                        {provider.isVerified && (
                            <div className="flex items-center text-green-400 text-xs font-medium bg-green-900/50 px-2 py-1 rounded-full">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified
                            </div>
                        )}
                    </div>
                </div>
                {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 pointer-events-none" />
                )}
            </div>
        )
    }

    const VehicleCard = ({ vehicle }: { vehicle: VehicleData }) => {
        const { address, loading: locationLoading } = useReverseGeocoding(vehicle.lat, vehicle.lng);
        
        const statusInfo = getVehicleStatusInfo(vehicle.vehicle_status);
        const isAvailable = vehicle.vehicle_status?.toLowerCase() === "available";
        const StatusIcon = statusInfo.icon;
        const isSelected = selectedVehicle?.vehicle_sno === vehicle.vehicle_sno;
    
        return (
            <div
                className={`group relative overflow-hidden rounded-lg border transition-all duration-300 cursor-pointer ${isSelected
                        ? "border-blue-500 bg-gradient-to-r from-gray-800 to-gray-700 shadow-lg"
                        : isAvailable
                            ? "border-gray-700 bg-gray-800 hover:border-gray-600 hover:shadow-md"
                            : "border-gray-700 bg-gray-800/50"
                    } ${!isAvailable && "opacity-75"}`}
                onClick={() => handleVehicleSelect(vehicle)}
            >
                <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${isSelected ? "bg-blue-900/50" : isAvailable ? "bg-gray-700" : "bg-gray-600"}`}>
                                <Car className={`h-5 w-5 ${isSelected ? "text-blue-400" : isAvailable ? "text-gray-400" : "text-gray-500"}`} />
                            </div>
                            <div>
                                <h4 className={`text-lg font-bold ${isAvailable ? "text-white" : "text-gray-400"}`}>
                                    {vehicle.vehicle_number}
                                </h4>
                                <p className={`text-sm ${isAvailable ? "text-gray-400" : "text-gray-500"}`}>
                                    {vehicle.vehicle_name} {vehicle.vehicle_model && `• ${vehicle.vehicle_model}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isSelected && <CheckCircle className="h-5 w-5 text-blue-400" />}
                        </div>
                    </div>
    
                    <div className="flex items-center justify-between mb-3">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                        </div>
                        
                        {/* Location Display - This replaces the commented section */}
                        <div className="flex items-center text-xs text-gray-400 max-w-[200px]">
                            {locationLoading ? (
                                <div className="flex items-center">
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    <span>Loading...</span>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="truncate" title={address}>
                                        {address}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
    
                    {vehicle.distance_from_reference && (
                        <div className="flex items-center text-xs text-gray-400 mb-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            {vehicle.distance_from_reference} km away
                        </div>
                    )}
    
                    {!isAvailable && (
                        <div className={`mt-3 p-3 rounded-lg border ${statusInfo.bgColor} border-current/20`}>
                            <div className={`flex items-start ${statusInfo.textColor} text-xs`}>
                                <Info className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                                <span>
                                    {vehicle.vehicle_status?.toLowerCase() === "occupied" && "Currently assigned to another booking. Will be available after completion."}
                                    {vehicle.vehicle_status?.toLowerCase() === "maintenance" && "Under maintenance. Expected to be available soon."}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (!fromOrderManagement || !orderData) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center bg-gray-800 rounded-lg shadow-lg p-8">
                    <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="h-8 w-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Invalid Access</h2>
                    <p className="text-gray-400 mb-6">This page can only be accessed from order management.</p>
                    <Button
                        onClick={() => navigate("/ordermanagement")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                    >
                        Go to Order Management
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black">
            <Toaster position="top-right" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={() => navigate("/ordermanagement")}
                            className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow p-0 border border-gray-700"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-400" />
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">Assign Service Provider</h1>
                            <p className="text-gray-400 mt-1">
                                Order #{orderData.service_booking_sno} • Select provider and vehicle
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Zap className="h-5 w-5 text-blue-400" />
                        <span className="text-sm font-medium text-gray-400">Quick Assignment</span>
                    </div>
                </div>

                {/* Order Summary Card */}
                <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                        Order Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gray-700 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">From</p>
                            <p className="text-sm font-semibold text-white">{orderData.pickup_location?.address?.split(",")[0] || "N/A"}</p>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">To</p>
                            <p className="text-sm font-semibold text-white">{orderData.drop_location?.address?.split(",")[0] || "N/A"}</p>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Date</p>
                            <p className="text-sm font-semibold text-white">{orderData.booking_time?.split(" ")[0] || "N/A"}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Service Providers Section */}
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                            <h2 className="text-xl font-bold text-white">Available Providers</h2>
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search providers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-700 bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white text-sm"
                                />
                            </div>
                        </div>

                        {availableProvidersLoading ? (
                            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-400">Loading providers...</p>
                            </div>
                        ) : availableProvidersError ? (
                            <div className="bg-gray-800 rounded-lg shadow-sm border border-red-900/50 p-12 text-center">
                                <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="h-8 w-8 text-red-400" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">Error Loading Providers</h3>
                                <p className="text-red-400 mb-4">{availableProvidersError}</p>
                                <Button
                                    onClick={() => dispatch(fetchAvailableServiceProviders())}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : filteredProviders.length === 0 ? (
                            <div className="bg-gray-800 rounded-lg shadow-sm border-2 border-dashed border-gray-700 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Building className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">No Providers Found</h3>
                                <p className="text-gray-400">
                                    {searchTerm ? "No providers match your search" : "No available service providers found"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredProviders.map((provider) => (
                                    <ServiceProviderCard key={provider.id} provider={provider} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Vehicles Section */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">
                            {selectedProvider ? `${selectedProvider.companyName} Fleet` : "Select Provider First"}
                        </h2>

                        {!selectedProvider ? (
                            <div className="bg-gray-800 rounded-lg shadow-sm border-2 border-dashed border-gray-700 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Truck className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">No Provider Selected</h3>
                                <p className="text-gray-400">Choose a service provider to view their available vehicles</p>
                            </div>
                        ) : vehiclesLoading ? (
                            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                                <p className="text-gray-400">Loading vehicles...</p>
                            </div>
                        ) : vehiclesError ? (
                            <div className="bg-gray-800 rounded-lg shadow-sm border border-red-900/50 p-12 text-center">
                                <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="h-8 w-8 text-red-400" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">Error Loading Vehicles</h3>
                                <p className="text-red-400 mb-4">{vehiclesError}</p>
                                <Button
                                    onClick={() =>
                                        selectedProvider &&
                                        dispatch(
                                            fetchVehiclesByServiceProvider({
                                                serviceProviderSno: selectedProvider.id,
                                            }),
                                        )
                                    }
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                >
                                    Try Again
                                </Button>
                            </div>
                        ) : vehicles.length === 0 ? (
                            <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-12 text-center">
                                <div className="w-16 h-16 bg-amber-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Car className="h-8 w-8 text-amber-400" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">No Vehicles Available</h3>
                                <p className="text-gray-400">This provider doesn't have any vehicles registered</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {vehicles.map((vehicle) => (
                                    <VehicleCard key={vehicle.vehicle_sno} vehicle={vehicle} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                {selectedProvider && (
                    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 sm:relative sm:bg-transparent sm:border-0 sm:mt-8 sm:p-0 z-10">
                        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 max-w-7xl mx-auto">
                            <Button
                                onClick={() => navigate("/ordermanagement")}
                                className="w-full sm:w-auto px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium bg-gray-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => setShowConfirmModal(true)}
                                disabled={!selectedProvider}
                                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                Assign Provider
                            </Button>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal */}
                <Modal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    title="Confirm Assignment"
                    size="lg"
                    className="bg-gray-800"
                >
                    <div className="p-6">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-4">Assignment Summary</h3>

                            <div className="bg-gray-700 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-400">Order ID</span>
                                    <span className="text-sm font-bold text-white">#{orderData.service_booking_sno}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-400">Provider</span>
                                    <span className="text-sm font-bold text-white">{selectedProvider?.companyName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-400">Contact</span>
                                    <span className="text-sm font-bold text-white">{selectedProvider?.mobile_number}</span>
                                </div>
                                {selectedVehicle && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-400">Vehicle</span>
                                        <span className="text-sm font-bold text-white">{selectedVehicle.vehicle_number}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                onClick={() => setShowConfirmModal(false)}
                                disabled={assigning}
                                className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors font-medium bg-gray-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAssignConfirm}
                                disabled={assigning}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center"
                            >
                                {assigning ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        Assigning...
                                    </>
                                ) : (
                                    "Confirm Assignment"
                                )}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d3748;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
        </div>
    )
}