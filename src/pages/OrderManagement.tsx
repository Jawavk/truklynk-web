import Button from "@/components/ui/form/Button"
import { DateInput } from "@/components/ui/form/DateInput"
import { fetchOrders } from "@/store/slice/orderManagementSlice"
import { fetchServiceProviders } from "@/store/slice/serviceProviderSlice"
import { createorder } from "@/store/slice/orderSlice"
import type { AppDispatch, RootState } from "@/store/store"
import { ClockIcon, TruckIcon, Calendar, Package, ArrowRight, Plus, Truck, Search, AlertCircle, AlertTriangle, X, MoreVertical } from 'lucide-react'
import type React from "react"
import { useEffect, useState, useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast, Toaster } from "react-hot-toast"
import { updateBookingOrder } from "@/store/slice/orderSlice"


// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

type UserData = {
  name: string
  mobileNumber: string
  [key: string]: any
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center">
      <div className="bg-zinc-950 rounded-xl shadow-xl max-w-md w-full mx-4 transform transition-all duration-300">
        <div className="p-6 flex items-center justify-between border-b border-gray-800">
          {title && <h2 className="text-white text-xl font-semibold">{title}</h2>}
          <button onClick={onClose}>
            <X className="w-6 h-6 text-white hover:text-gray-400 transition-colors" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Interface for service provider response
interface SearchServiceProviderResponse {
    json?: {
      searchserviceproviderschedule: {
        isNoResult?: boolean;
        service_booking_id?: number;
      }[];
    }[];
    isSuccess?: boolean;
}

export default function OrderManagement() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { data: orderData, loading, error } = useSelector((state: RootState) => state.OrdersManagement)
  const { data: serviceProviderData, loading: providerLoading } = useSelector(
    (state: RootState) => state.serviceProviders,
  )

  const [activeTab, setActiveTab] = useState<
    "allOrder" | "pending" | "requestPending" | "processing" | "accept" | "started" | "completed"
  >("pending")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [applyDateFilter, setApplyDateFilter] = useState<boolean>(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [selectedBooking, setSelectedBooking] = useState({
    booking_person: null,
    service_booking_sno: null,
  })

  // Modal state for service provider check
  const [showNoServiceModal, setShowNoServiceModal] = useState(false)
  const [pendingOrder, setPendingOrder] = useState<any>(null)
  const [isCheckingService, setIsCheckingService] = useState(false)

  // Menu dropdown states
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const menuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  const tabColors = ["bg-gray-600", "bg-blue-600", "bg-green-600", "bg-yellow-600", "bg-red-600"]

  const getBookingDate = (dateTimeString: string) => {
    if (!dateTimeString) return ""
    return dateTimeString.split(" ")[0]
  }

  const getOrderCounts = () => {
    if (!orderData || !orderData.json)
      return {
        all: 0,
        pending: 0,
        processing: 0,
        accept: 0,
        started: 0,
        completed: 0,
      }

    const orders = orderData.json
    return {
      all: orders.length,
      pending: orders.filter((order) => order.booking_status_cd === 106).length,
      requestPending: orders.filter((order) => order.booking_status_cd === 105).length,
      processing: orders.filter((order) => order.booking_status_cd === 72).length,
      accept: orders.filter((order) => order.booking_status_cd === 73).length,
      started: orders.filter((order) => order.booking_status_cd === 77).length,
      completed: orders.filter((order) => order.booking_status_cd === 78).length,
    }
  }

  const orderCounts = getOrderCounts()

  const tabs = [
    { id: "pending", label: "Pending", count: orderCounts.pending },
    { id: "requestPending", label: "Request Pending", count: orderCounts.requestPending },
    { id: "processing", label: "Processing", count: orderCounts.processing },
    { id: "accept", label: "Accept", count: orderCounts.accept },
    { id: "started", label: "Started", count: orderCounts.started },
    { id: "completed", label: "Completed", count: orderCounts.completed },
    { id: "allOrder", label: "All Order", count: orderCounts.all },
  ]

  const methods = useForm({
    defaultValues: {
      date: "",
      company: "",
    },
  })



  const getCompanyOptions = () => {
    if (!serviceProviderData || serviceProviderData.length === 0) {
      console.log("serviceProviderData is empty or undefined")
      return []
    }
    const companyNames = new Set(serviceProviderData.map((provider) => provider.company_name).filter((name) => name))
    console.log("Company options:", Array.from(companyNames))
    return Array.from(companyNames) as string[]
  }

  const companyOptions = getCompanyOptions()

  const getTabColor = (index: number) => {
    return tabColors[index % tabColors.length]
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const menuRef = menuRefs.current[openMenuId]
        if (menuRef && !menuRef.contains(event.target as Node)) {
          setOpenMenuId(null)
        }
      }
    }

    const storedData = localStorage.getItem("userData")
    if (storedData) {
      const parsedData: UserData = JSON.parse(storedData)
      setUserData(parsedData)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    
  }, [openMenuId])

  // Toggle menu dropdown
  const toggleMenu = (orderId: number) => {
    setOpenMenuId(openMenuId === orderId ? null : orderId)
  }

  // Handle change service provider
  const handleChangeServiceProvider = async (order: any) => {
    setOpenMenuId(null)
    
    try {
      // Show loading toast
      toast.loading("Updating service provider assignment...", {
        id: 'updating-service-provider',
        duration: 2000,
        position: "top-right",
        style: {
          background: "#1f2937",
          color: "#ffffff",
          border: "1px solid #374151",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
          padding: "12px 16px",
        },
      })
  
      // Prepare the update payload

      const updatePayload = {
        booking_status_name: "Pending",
        service_booking_sno: order.service_booking_sno,
        user_profile_sno: userData?.user_profile_sno,
        updated_by: null,
        updated_time: new Date().toISOString(),
        isSendNotification: true,
      };
  
      // Call the update API
      const response = await dispatch(updateBookingOrder(updatePayload)).unwrap()
      
      // Dismiss loading toast and show success
      toast.dismiss('updating-service-provider')
      toast.success("Service provider assignment reset successfully!", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#065f46",
          color: "#ffffff",
          border: "1px solid #059669",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
          padding: "12px 16px",
        },
      })
  
      // Refresh the orders list to show updated status
      dispatch(fetchOrders())
  
      // Navigate to assign service provider page
      setTimeout(() => {
        navigate("/assign-service-provider", {
          state: {
            order: {
              ...order,
              booking_status_cd: 106 // Pending status code
            },
            fromOrderManagement: true,
            sourceAction: "changeServiceProvider",
            isReassignment: true,
          },
        })
      }, 1000)
  
    } catch (error: any) {
      // Dismiss loading toast and show error
      toast.dismiss('updating-service-provider')
      toast.error(error || "Failed to update service provider assignment", {
        duration: 4000,
        position: "top-right",
        style: {
          background: "#7f1d1d",
          color: "#ffffff",
          border: "1px solid #dc2626",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
          padding: "12px 16px",
        },
      })
      console.error('Error updating service provider:', error)
    }
  }

  // Handle cancel order from menu
  const handleCancelFromMenu = (order: any) => {
    setOpenMenuId(null)
    handleCancelClick(order.service_booking_sno, order.booking_person)
  }
  // Function to check service provider availability
  const checkServiceProviderAvailability = async (order: any) => {
    setIsCheckingService(true)
        
    try {
      // Parse contact info
      let contactInfo = { name: "N/A", phone: "N/A" }
      try {
        if (order.contact_info && typeof order.contact_info === "string") {
          contactInfo = JSON.parse(order.contact_info)
        }
      } catch (e) {
        console.error("Error parsing contact info:", e)
      }

      // Create order data for checking availability
      const orderData = {
        booking_type: 'Schedule', // Keep as string, not enum code
        booking_person: parseInt(order.booking_person),
        sub_category_sno: order.sub_category_sno,
        landmark: order.landmark || '',
        contact_info: {
            name: contactInfo.name,
            phone: contactInfo.phone.toString(),
        },
        price: order.price || 0,
        pickup_location: {
            address: order.pickup_location?.address || '',
            latlng: {
                latitude: parseFloat(order.pickup_location?.latlng?.latitude || order.lat) || 0,
                longitude: parseFloat(order.pickup_location?.latlng?.longitude || order.lng) || 0,
            },
            city: order.pickup_location?.city || '',
            state: order.pickup_location?.state || '',
            country: order.pickup_location?.country || '',
            landmark: order.pickup_location?.landmark || '',
            contact_info: order.pickup_location?.contact_info || '',
        },
        drop_location: {
            address: order.drop_location?.address || '',
            latlng: {
                latitude: parseFloat(order.drop_location?.latlng?.latitude) || 0,
                longitude: parseFloat(order.drop_location?.latlng?.longitude) || 0,
            },
            city: order.drop_location?.city || '',
            state: order.drop_location?.state || '',
            country: order.drop_location?.country || '',
            landmark: order.drop_location?.landmark || '',
            contact_info: order.drop_location?.contact_info || '',
        },
        types_of_goods: order.types_of_goods || '',
        distance: parseFloat(order.distance) || 0,
        lat: parseFloat(order.pickup_location?.latlng?.latitude || order.lat) || 0,
        lng: parseFloat(order.pickup_location?.latlng?.longitude || order.lng) || 0,
        name: order.name || contactInfo.name,
        booking_time: order.booking_time,
        category_name: order.category_name || 'Long Trip',
        weight_type_sno: order.weight_type_sno ? parseInt(order.weight_type_sno) : null, // Handle null properly
        weight_of_goods: order.weight_of_goods ? parseFloat(order.weight_of_goods) : 0,
        created_on: order.created_on,
        notes: typeof order.notes === 'object' ? (order.notes?.notes || '') : (order.notes || ''),
        // Only include these for existing order checks
        action_name: 'check_availability',
        service_booking_sno: order.service_booking_sno
    };

      console.log('Checking service availability for order:', orderData)
      const response = await dispatch(createorder(orderData)).unwrap()
      const typedRes = response as SearchServiceProviderResponse
            
      console.log('Service availability check response:', typedRes)
            
      const noResult = typedRes?.json?.[0]?.searchserviceproviderschedule?.[0]?.isNoResult ?? false
            
      setIsCheckingService(false)
            
      if (noResult) {
        // No service providers available, show modal
        setPendingOrder(order)
        setShowNoServiceModal(true)
      } else {
        // Service providers available, proceed to assign page
        toast.success("Service providers found! Redirecting...", {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#065f46",
            color: "#ffffff",
            border: "1px solid #059669",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            padding: "12px 16px",
          },
        })
                
        navigate("/assign-service-provider", {
          state: {
            order,
            fromOrderManagement: true,
            sourceAction: "assignServiceProvider",
          },
        })
      }
    } catch (error) {
      console.error('Error checking service availability:', error)
      setIsCheckingService(false)
      toast.error("Error checking service availability. Please try again.", {
        duration: 4000,
        position: "top-right",
        style: {
          background: "#7f1d1d",
          color: "#ffffff",
          border: "1px solid #dc2626",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
          padding: "12px 16px",
        },
      })
    }
  }

  // Updated handleAssignServiceProviderClick
  const handleAssignServiceProviderClick = (order: any) => {
    console.log("Checking service provider availability for order:", order.service_booking_sno)
    checkServiceProviderAvailability(order)
  }

  // Modal handlers
  const handleModalContinue = () => {
    setShowNoServiceModal(false)
    toast.success("Redirecting to service provider assignment...", {
      duration: 2000,
      position: "top-right",
      style: {
        background: "#065f46",
        color: "#ffffff",
        border: "1px solid #059669",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        padding: "12px 16px",
      },
    })
        
    navigate("/assign-service-provider", {
      state: {
        order: pendingOrder,
        fromOrderManagement: true,
        sourceAction: "assignServiceProvider",
      },
    })
  }

  const handleModalCancel = () => {
    setShowNoServiceModal(false)
    setPendingOrder(null)
  }

  const handleAssignVehicleClick = (order: any) => {
    console.log("service_provider_sno:", order.service_providers_sno)
    if (!order.service_providers_sno) {
      toast.error("Please assign a service provider first", {
        duration: 4000,
        position: "top-right",
        style: {
          background: "#7f1d1d",
          color: "#ffffff",
          border: "1px solid #dc2626",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
          padding: "12px 16px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        iconTheme: {
          primary: "#ef4444",
          secondary: "#ffffff",
        },
      })
      return
    }
    toast.success("Redirecting to vehicle assignment...", {
      duration: 2000,
      position: "top-right",
      style: {
        background: "#065f46",
        color: "#ffffff",
        border: "1px solid #059669",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        padding: "12px 16px",
      },
      iconTheme: {
        primary: "#10b981",
        secondary: "#ffffff",
      },
    })
    navigate("/vehicleverification", {
      state: {
        order,
        fromOrderManagement: true,
        sourceAction: "assignVehicle",
      },
    })
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value
    setSelectedDate(date)
    setApplyDateFilter(date !== "")
  }

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompany(e.target.value)
  }

  const clearFilters = () => {
    setSelectedDate("")
    setSelectedCompany("")
    setApplyDateFilter(false)
  }

  const handleCancelClick = (service_booking_sno, booking_person) => {
    setSelectedBooking({ booking_person, service_booking_sno })
    console.log(booking_person, service_booking_sno)
    const role = "Admin"
    navigate("/CancelOptions", {
      state: {
        role,
        booking_person,
        service_booking_sno,
      },
    })
  }

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "No Date Available"
    const parts = dateString.split(" ")
    const datePart = parts[0] || dateString
    return datePart.replace(/-/g, "/")
  }

  const getStatusInfo = (statusCode: number) => {
    switch (statusCode) {
      case 72:
        return { display: "Processing", color: "bg-indigo-800" }
      case 73:
        return { display: "Accept", color: "bg-green-800" }
      case 77:
        return { display: "Started", color: "bg-blue-800" }
      case 78:
        return { display: "Completed", color: "bg-yellow-800" }
      case 105:
        return { display: "Request Pending", color: "bg-indigo-800" }
      case 106:
        return { display: "Pending", color: "bg-blue-800" }
      case 75:
        return { display: "Cancel", color: "bg-red-800" }
      default:
        return { display: "Unknown", color: "bg-gray-800" }
    }
  }

  const getFilteredOrders = () => {
    if (!orderData || !orderData.json) return []
    return orderData.json
      .filter((order) => {
        if (activeTab === "allOrder") {
          return true
        } else if (activeTab === "pending" && order.booking_status_cd === 106) {
          return true
        } else if (activeTab === "requestPending" && order.booking_status_cd === 105) {
          return true
        } else if (activeTab === "processing" && order.booking_status_cd === 72) {
          return true
        } else if (activeTab === "accept" && order.booking_status_cd === 73) {
          return true
        } else if (activeTab === "started" && order.booking_status_cd === 77) {
          return true
        } else if (activeTab === "completed" && order.booking_status_cd === 78) {
          return true
        }
        return false
      })
      .filter((order) => {
        if (!applyDateFilter) {
          return true
        }
        const orderDate = getBookingDate(order.booking_time)
        return orderDate === selectedDate
      })
      .filter((order) => {
        const matchesCompany = !selectedCompany || order.company_name === selectedCompany
        return matchesCompany
      })
  }

  const filteredOrders = getFilteredOrders()

  const NoDataFound = () => {
    const hasActiveFilters = selectedDate || selectedCompany || activeTab !== "allOrder"
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border border-gray-800 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-800 rounded-full p-4">
              {hasActiveFilters ? (
                <Search className="h-12 w-12 text-gray-400" />
              ) : (
                <Package className="h-12 w-12 text-gray-400" />
              )}
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">
            {hasActiveFilters ? "No Bookings Found" : "No Bookings Available"}
          </h3>
          <p className="text-gray-400 mb-6 leading-relaxed">
            {hasActiveFilters
              ? "We couldn't find any orders matching your current filters. Try adjusting your search criteria or clearing the filters."
              : "You don't have any orders yet. Create your first order to get started with Booking management."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg transition-colors text-sm"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Active filters:
              {activeTab !== "allOrder" && (
                <span className="ml-1 text-white bg-gray-800 px-2 py-1 rounded text-xs">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </span>
              )}
              {selectedCompany && (
                <span className="ml-1 text-white bg-gray-800 px-2 py-1 rounded text-xs">{selectedCompany}</span>
              )}
              {selectedDate && (
                <span className="ml-1 text-white bg-gray-800 px-2 py-1 rounded text-xs">
                  {formatDateForDisplay(selectedDate)}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    )
  }

  const findProviderByCompany = (companyName: string) => {
    if (!serviceProviderData || serviceProviderData.length === 0) return null
    return serviceProviderData.find((provider) => provider.company_name === companyName)
  }

  const OrderCard = ({ order }: { order: any }) => {
    const statusInfo = getStatusInfo(order.booking_status_cd)
    let contactInfo = { name: "N/A", phone: "N/A" }
    try {
      if (order.contact_info && typeof order.contact_info === "string") {
        contactInfo = JSON.parse(order.contact_info)
      }
    } catch (e) {
      console.error("Error parsing contact info:", e)
    }

    // Check if this order can show menu options
    const canShowMenu = order.booking_status_cd === 73 || order.booking_status_cd === 77

    return (
      <div className="bg-gray-950 rounded-lg overflow-hidden w-full border border-gray-800 transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-gray-900/20">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <div>
            <span className="text-white font-medium text-sm tracking-wider">#{order.service_booking_sno}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`${statusInfo.color} text-white px-3 py-1 rounded-full text-xs font-medium`}>
              {statusInfo.display}
            </span>
            {canShowMenu && (
              <div className="relative" ref={(el) => menuRefs.current[order.service_booking_sno] = el}>
                <button
                  onClick={() => toggleMenu(order.service_booking_sno)}
                  className="p-1 hover:bg-gray-800 rounded-md transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
                {openMenuId === order.service_booking_sno && (
                  <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 min-w-[160px]">
                    <div className="py-1">
                      {order.booking_status_cd === 73 && (
                        <button
                          onClick={() => handleChangeServiceProvider(order)}
                          className="block w-full px-4 py-2 text-sm text-white hover:bg-gray-700 text-left transition-colors"
                        >
                          Change Service Provider
                        </button>
                      )}
                      {order.booking_status_cd === 77 && (
                        <button
                          onClick={() => handleCancelFromMenu(order)}
                          className="block w-full px-4 py-2 text-sm text-white hover:bg-gray-700 text-left transition-colors"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mx-4 my-3 bg-gray-900 rounded-lg px-2 py-3">
          <div className="flex items-center text-white font-medium">
            <Truck className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="ml-2 text-sm sm:text-base">{order.name || contactInfo.name}</span>
          </div>
        </div>

        <div className="mx-4 my-3 bg-gray-900 rounded-lg px-2 py-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs">Origin</span>
            <span className="text-white font-medium text-sm sm:text-base truncate max-w-[80px] sm:max-w-none">
              {order.pickup_location?.city ||
                order.pickup_location?.state ||
                order.pickup_location?.address.split(",")[0] ||
                "N/A"}
            </span>
          </div>
          <div className="relative">
            <div className="h-px w-6 sm:w-8 bg-gray-700"></div>
            <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-white absolute -top-1.5 sm:-top-2 left-1/2 transform -translate-x-1/2 bg-gray-900 p-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-400 text-xs">Destination</span>
            <span className="text-white font-medium text-sm sm:text-base truncate max-w-[80px] sm:max-w-none">
              {order.drop_location?.city || "N/A"}
            </span>
          </div>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="relative">
              <div className="h-2 w-2 sm:h-3 sm:w-3 bg-white rounded-full"></div>
              <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                Pickup
              </span>
            </div>
            <div className="flex-1 mx-2 h-px bg-gray-800 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                <div className="p-1 bg-gray-900 rounded-full border border-gray-800">
                  <TruckIcon className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full border-2 border-gray-600"></div>
              <span className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                Delivery
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center px-4 py-3 bg-gray-800 mx-2 my-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
            <span className="text-white font-semibold text-base sm:text-lg">
              {formatDateForDisplay(order.booking_time)}
            </span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 ml-4 sm:ml-6">
            <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
            <span className="text-white text-xs sm:text-sm">
              {order.booking_time ? order.booking_time.split(" ")[1].substring(0, 5) : "N/A"}
            </span>
          </div>
        </div>

        <div className="px-4 py-3 flex justify-between items-center border-t border-gray-800">
          <div className="flex items-center">
            <div className="text-gray-400 mr-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="text-white text-xs sm:text-sm">{order.types_of_goods || "N/A"}</span>
          </div>
          <div className="flex items-center px-2 py-1 rounded-lg">
            <div className="mr-2">
              <span className="text-white text-xs sm:text-sm">
                {order.weight_of_goods ? `${order.weight_of_goods} ${order.weight_type_name}` : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex p-4 gap-3 sm:gap-4">
          <div className="flex flex-row w-full gap-3 sm:gap-4 flex-wrap">
            {order.booking_status_cd !== 78 && order.booking_status_cd !== 75 && (
              <div className="flex-1 min-w-[120px]">
                {order.booking_status_cd === 77 ? (
                  <Button
                    className="w-full h-10 sm:h-12 py-2 px-3 sm:px-5 text-white font-semibold rounded-md bg-blue-800 hover:bg-blue-700 hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-105 text-xs sm:text-sm"
                    onClick={() => navigate(`/ordertrack`, { state: { order } })}
                  >
                    Track Order
                  </Button>
                ) : order.booking_status_cd === 106 ? (
                  <div className="flex flex-row gap-2 sm:gap-2 flex-1">
                    <div className="flex-1 min-w-[100px] sm:min-w-[120px]">
                      <Button
                        className={`w-full h-10 sm:h-12 py-2 px-2 sm:px-4 text-white font-semibold rounded-md transition-all duration-300 ease-in-out text-xs sm:text-sm ${
                          isCheckingService
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-indigo-800 hover:bg-indigo-700 hover:shadow-lg hover:scale-105'
                        }`}
                        onClick={() => handleAssignServiceProviderClick(order)}
                        disabled={isCheckingService}
                      >
                        {isCheckingService ? 'Checking...' : 'Assign Service Provider'}
                      </Button>
                    </div>
                    <div className="flex-1 min-w-[100px] sm:min-w-[120px]">
                      <Button
                        className="w-full h-10 sm:h-12 py-2 px-2 sm:px-4 text-white font-semibold rounded-md bg-red-800 hover:bg-red-700 hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-105 text-xs sm:text-sm"
                        onClick={() => handleCancelClick(order.service_booking_sno, order.booking_person)}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row gap-2 sm:gap-3 w-full">
                    {order.booking_status_cd === 73 && order.selected_vehicle_sno === null && (
                      <div className="flex-1 min-w-[120px]">
                        <Button
                          className="w-full h-10 sm:h-12 py-2 px-3 sm:px-5 text-white font-semibold rounded-md bg-green-800 hover:bg-green-700 hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-105 text-xs sm:text-sm"
                          onClick={() => handleAssignVehicleClick(order)}
                        >
                          Assign Vehicle
                        </Button>
                      </div>
                    )}
                    {(order.booking_status_cd === 73 ||
                      (!(order.quotations == null && order.booking_status_cd === 72) &&
                        order.booking_status_cd !== 106 &&
                        order.booking_status_cd !== 77)) && (
                        <div className="flex-1 min-w-[120px]">
                          <div className="w-full h-10 sm:h-12 flex items-center justify-center bg-gray-900 rounded-lg shadow-md border border-gray-600">
                            <span className="text-white font-medium text-xs sm:text-base tracking-wide text-center">
                              Ongoing Booking
                            </span>
                          </div>
                        </div>
                      )}
                    {(order.booking_status_cd === 72 || order.booking_status_cd === 105) && (
                      <div className="flex-1 min-w-[120px]">
                        <Button
                          className="w-full h-10 sm:h-12 py-2 px-3 sm:px-5 text-white font-semibold rounded-md bg-red-800 hover:bg-red-700 hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-105 text-xs sm:text-sm"
                          onClick={() => handleCancelClick(order.service_booking_sno, order.booking_person)}
                        >
                          Cancel Order
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    dispatch(fetchOrders())
    dispatch(fetchServiceProviders())
  }, [dispatch])

  if (loading || providerLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl text-red-500">Error loading orders: {error}</div>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-black text-white">
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "#f9fafb",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              padding: "12px 16px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            },
          }}
        />

        <div className="container mx-auto px-4 py-6">
          <header className="mb-8">
            <h1 className="text-5xl md:text-4xl font-bold">Booking Management</h1>
          </header>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
            <div className="w-full overflow-x-auto pb-2 no-scrollbar">
              <div className="inline-flex bg-gray-900 rounded-lg p-1 shadow-sm border border-gray-800 min-w-max">
              <div className="flex whitespace-nowrap space-x-1">
  {tabs.map((tab, index) => (
    <Button
      key={tab.id}
      className={`px-3 py-2 sm:px-4 sm:py-3 rounded-md text-xs sm:text-sm font-medium flex items-center transition-colors ${
        activeTab === tab.id 
          ? "bg-black text-white border border-gray-700 shadow-lg"
          : "bg-white text-black border border-gray-200"
      }`}
      onClick={() => setActiveTab(tab.id as typeof activeTab)}
    >
      <span className="truncate">{tab.label}</span>
      <span
        className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 text-xs rounded-md ${
          activeTab === tab.id 
            ? "bg-gray-700 text-white"
            : `${getTabColor(index)} text-white`
        }`}
      >
        {tab.count}
      </span>
    </Button>
  ))}
</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex items-center w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                </div>
                <select
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                  className="bg-gray-900 border border-gray-800 text-white text-sm rounded-lg block w-full pl-9 sm:pl-10 pr-8 sm:pr-10 p-2.5 shadow-sm transition-colors hover:border-gray-700"
                  name="company"
                >
                  <option value="">Select Providers</option>
                  {companyOptions.map((company, index) => (
                    <option key={index} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex items-center w-full sm:w-auto">
                <DateInput
                  value={selectedDate}
                  onChange={handleDateChange}
                  isFutureDateAllowed={true}
                  isPastDateAllowed={true}
                  className="bg-gray-900 border border-gray-800 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 sm:pl-10 pr-8 p-2.5"
                  name="date"
                />
                {(selectedDate || selectedCompany) && (
                  <button
                    onClick={clearFilters}
                    className="absolute right-2 text-gray-400 hover:text-gray-200 text-lg sm:text-xl"
                    title="Clear filters"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex-shrink-0 w-full sm:w-auto">
                <Button
                  onClick={() => navigate("/neworder")}
                  className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 py-3 sm:py-4 rounded-full shadow-sm transition-colors whitespace-nowrap w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  <span className="text-sm sm:text-base">CREATE NEW BOOKING</span>
                </Button>
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <NoDataFound />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredOrders.map((order) => (
                <OrderCard key={order.service_booking_sno} order={order} />
              ))}
            </div>
          )}
        </div>

        {/* No Service Available Modal */}
        <Modal 
          isOpen={showNoServiceModal}
          onClose={handleModalCancel}
          title="Service Unavailable"
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-100 rounded-full p-3">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              No Service Available
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              We couldn't find any available service providers for this booking at this time. 
              Would you like to manually assign a service provider or cancel this action?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleModalCancel}
                className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleModalContinue}
                className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                Continue & Assign Provider
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </FormProvider>
  )
}