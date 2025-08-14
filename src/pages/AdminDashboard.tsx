import type React from "react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useJsApiLoader, GoogleMap, Marker, type Libraries } from "@react-google-maps/api";
import {
  MapPin,
  Car,
  Users,
  Clock,
  DollarSign,
  Navigation,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  UserCheck,
  Maximize2,
  Search,
  Filter,
  TrendingUp,
  Menu,
} from "lucide-react";
import { fetchOrders } from "@/store/slice/orderManagementSlice";
import { fetchVehiclesData } from "@/store/slice/InsightDashboardSlice";
import { fetchServiceProviders } from "@/store/slice/serviceProviderSlice";
import { fetchDrivers } from "@/store/slice/driverSlice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { fetchBookingById, fetchCustomerData, setEventStatus } from "@/store/slice/customerSlice";
import { useNavigate } from "react-router-dom";
import MetricCard from "./MetricCard";

// Interfaces
interface Booking {
  id: number;
  customer: string;
  pickup: string;
  destination: string;
  status: string;
  timestamp: string;
  amount: number;
  distance: string;
  vehicle_type: string;
  phone: string;
  driver?: string;
  vehicle?: string;
  booking_status_cd: number;
  user_profile_sno: number;
}

interface Vehicle {
  vehicle_sno: number;
  name: string;
  driver: string;
  status: string;
  location?: string;
  booking_status_cd: number;
  lat: string;
  lng: string;
}

// Constants
const libraries: Libraries = ["places", "geometry"]; // Define libraries once, including all needed
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c1221" }] },
];

// Status helpers
const statusConfig = {
  request_pending: { color: "bg-amber-500/10 text-amber-400 border-amber-400/20", icon: Clock },
  accept: { color: "bg-blue-500/10 text-blue-400 border-blue-400/20", icon: CheckCircle },
  started: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-400/20", icon: Navigation },
  completed: { color: "bg-purple-500/10 text-purple-400 border-purple-400/20", icon: CheckCircle },
  cancel: { color: "bg-rose-500/10 text-rose-400 border-rose-400/20", icon: XCircle },
};

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data: ordersData } = useSelector((state: RootState) => state.OrdersManagement);
  const { data: serviceProviderData } = useSelector((state: RootState) => state.serviceProviders);
  const { data: vehiclesData } = useSelector((state: RootState) => state.InsightDashboard);
  const { data: driversData } = useSelector((state: RootState) => state.drivers);
  const { data: CustomerData } = useSelector((state: RootState) => state.customer);

  // State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<"bookings" | "map">("bookings");

  const isOngoingBooking = (status: string) => {
    const ongoingStatuses = ["processing", "accept", "request_pending", "started"];
    return ongoingStatuses.includes(status.toLowerCase());
  };

  // Refs
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Load Google Maps API with environment variable
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyCq3n0PuZCtun6j0kiLnprf0mEqgQOvGls",
    libraries,
  });

  // Transform data
  const bookings: Booking[] = useMemo(() => {
    console.log(ordersData)
    const result =
      ordersData?.json?.map((order: any) => ({
        id: order.service_booking_sno,
        customer: order.name || "N/A",
        pickup: order.pickup_location?.address || "N/A",
        destination: order.drop_location?.address || "N/A",
        status: order.booking_status_name.toLowerCase().replace(" ", "_"),
        timestamp: new Date(order.booking_time).toLocaleDateString(),
        amount: order.price || 0,
        distance: `${order.distance} km`,
        vehicle_type: order.subcategory_name || "N/A",
        phone: order.contact_info ? JSON.parse(order.contact_info).phone : "N/A",
        driver: order.driverdetail?.name,
        vehicle: order.vehicle_number,
        booking_status_cd: order.booking_status_cd,
        user_profile_sno: order.user_profile_sno,
      })) || [];
    return result;
    console.log(result)
  }, [ordersData?.json]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.customer.toLowerCase().includes(query) ||
          booking.pickup.toLowerCase().includes(query) ||
          booking.destination.toLowerCase().includes(query),
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }
    return filtered;
  }, [bookings, searchQuery, statusFilter]);

  // Vehicle metrics
  const vehicleMetrics = useMemo(() => {
    const available = vehiclesData?.filter((v) => ![77, 73].includes(v.booking_status_cd)).length || 0;
    const busy = vehiclesData?.filter((v) => [77, 73].includes(v.booking_status_cd)).length || 0;
    return { available, busy, total: available + busy };
  }, [vehiclesData]);

  // Initialize data and location
  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchServiceProviders());
    dispatch(fetchVehiclesData());
    dispatch(fetchCustomerData());
    dispatch(fetchDrivers({ activeFlag: true }));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        () => setCurrentLocation({ lat: 13.0827, lng: 80.2707 }),
      );
    }
  }, [dispatch]);

  const handleMetricCardClick = (route: string) => {
    navigate(route);
  };

  const handleViewDetails = async (booking: Booking) => {
    try {
      const isOngoing = isOngoingBooking(booking.status);
      const newStatus = isOngoing ? 0 : 1;

      dispatch(setEventStatus(newStatus));

      const resultAction = await dispatch(
        fetchBookingById({
          userProfileSno: booking.user_profile_sno,
          status: isOngoing ? '{"Processing","Accept","Request_Pending","Started"}' : '{"Completed","Cancel"}',
          skip: 0,
          limits: 10,
        }),
      );

      if (fetchBookingById.fulfilled.match(resultAction)) {
        navigate("/orderdetails", {
          state: {
            data: { id: booking.user_profile_sno },
            bookingStatus: booking.status,
            eventStatus: newStatus,
          },
        });
      } else {
        console.error("Failed to fetch booking:", resultAction.payload);
      }
    } catch (error) {
      console.error("Error fetching booking data:", error);
    }
  };

  // Map setup
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const getMapCenter = useCallback(() => {
    return currentLocation || { lat: 13.0827, lng: 80.2707 };
  }, [currentLocation]);

  // Vehicle markers
  useEffect(() => {
    if (!mapRef.current || !vehiclesData?.length) return;

    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }

    infoWindowRef.current = new google.maps.InfoWindow();

    const markers = vehiclesData
      .filter((vehicle) => {
        const lat = Number.parseFloat(vehicle.lat);
        const lng = Number.parseFloat(vehicle.lng);
        return !isNaN(lat) && !isNaN(lng);
      })
      .map((vehicle) => {
        const lat = Number.parseFloat(vehicle.lat);
        const lng = Number.parseFloat(vehicle.lng);
        const isBusy = [77, 73].includes(vehicle.booking_status_cd);

        const marker = new google.maps.Marker({
          position: { lat, lng },
          icon: isBusy
            ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
            : "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          title: vehicle.vehicle_name,
          map: mapRef.current,
        });

        marker.addListener("click", () => {
          const content = `
            <div style="padding: 12px; max-width: 200px; color: #1e293b; font-family: system-ui;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${vehicle.vehicle_name}</h3>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Company:</strong> ${vehicle.company_name}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Model:</strong> ${vehicle.vehicle_model}</p>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Mobile:</strong> ${vehicle.mobile_no}</p>
              <div style="margin-top: 8px;">
                <span style="background: ${isBusy ? "#f59e0b" : "#10b981"}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px;">
                  ${isBusy ? "Busy" : "Available"}
                </span>
              </div>
            </div>
          `;

          infoWindowRef.current?.setContent(content);
          infoWindowRef.current?.setPosition({ lat, lng });
          infoWindowRef.current?.open(mapRef.current, marker);
        });

        return marker;
      });

    clustererRef.current = new MarkerClusterer({
      map: mapRef.current,
      markers,
    });

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [vehiclesData]);

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status as keyof typeof statusConfig] || {
      color: "bg-slate-500/10 text-slate-400 border-slate-400/20",
      icon: AlertCircle,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{status.replace("_", " ")}</span>
      </span>
    );
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div
      className={`group p-3 sm:p-4 border border-slate-800 rounded-lg hover:border-slate-700 hover:bg-slate-800/30 cursor-pointer transition-all duration-200 ${
        selectedBooking?.id === booking.id ? "border-indigo-500/50 bg-indigo-950/20" : ""
      }`}
      onClick={() => setSelectedBooking(booking)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-white text-sm sm:text-base truncate">{booking.customer}</h4>
            <p className="text-xs text-slate-400">{booking.timestamp}</p>
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0"></div>
          <span className="text-slate-300 truncate">{booking.pickup}</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-2 h-2 bg-rose-400 rounded-full flex-shrink-0"></div>
          <span className="text-slate-300 truncate">{booking.destination}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="text-slate-400">{booking.distance}</span>
        <span className="font-semibold text-emerald-400">₹{booking.amount}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">Dashboard</h1>
              <p className="text-xs sm:text-sm text-slate-400 hidden sm:block">Live monitoring & analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${showFilters ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-300"}`}
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="px-3 pb-3 sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-3 sm:mt-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="request_pending">Pending</option>
                <option value="accept">Accepted</option>
                <option value="started">Started</option>
                <option value="completed">Completed</option>
                <option value="cancel">Cancelled</option>
              </select>

              <span className="px-3 py-2 bg-slate-800 rounded-lg text-sm text-slate-300">
                {filteredBookings.length} results
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Metrics */}
      <div className="p-3 sm:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <MetricCard
            title="Bookings"
            value={filteredBookings.length}
            icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
            trend={8.5}
            color="indigo"
            onClick={() => handleMetricCardClick('/orders')}
          />
          <MetricCard
            title="Vehicles"
            value={vehicleMetrics.total}
            icon={<Car className="w-4 h-4 sm:w-5 sm:h-5" />}
            trend={2.3}
            color="emerald"
            onClick={() => handleMetricCardClick('/vehicleverification')}
          />
          <MetricCard
            title="Revenue"
            value={`₹${bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}`}
            icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}
            trend={12.7}
            color="amber"
          />
          <MetricCard
            title="Drivers"
            value={driversData?.[0]?.getdrivers?.length || 0}
            icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
            trend={-1.2}
            color="purple"
            onClick={() => handleMetricCardClick('/driververification')}
          />
          <MetricCard
            title="Providers"
            value={serviceProviderData?.length || 0}
            icon={<Building2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            trend={5.8}
            color="emerald"
            onClick={() => handleMetricCardClick('/serviceproviders')}
          />
          <MetricCard
            title="Customers"
            value={CustomerData?.length || 0}
            icon={<UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />}
            trend={15.3}
            color="rose"
            onClick={() => handleMetricCardClick('/customerverification')}
          />
        </div>

        {/* Mobile View Toggle */}
        <div className="lg:hidden mb-4">
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveView("bookings")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeView === "bookings" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Recent Bookings
            </button>
            <button
              onClick={() => setActiveView("map")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeView === "map" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-300"
              }`}
            >
              Live Tracking
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Bookings */}
          <div
            className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden ${
              activeView === "map" ? "hidden lg:block" : ""
            }`}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm sm:text-base">Recent Bookings</h3>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>

            <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto p-3 sm:p-4 space-y-3">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm sm:text-base">No bookings found</p>
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div
            className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden ${
              activeView === "bookings" ? "hidden lg:block" : ""
            }`}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm sm:text-base">Live Tracking</h3>
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </div>

            <div className="h-[400px] sm:h-[600px] relative">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={getMapCenter()}
                  zoom={12}
                  options={{ styles: darkMapStyle, disableDefaultUI: true }}
                  onLoad={onMapLoad}
                >
                  {currentLocation && (
                    <Marker position={currentLocation} icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" />
                  )}
                </GoogleMap>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm sm:text-base">Loading map...</p>
                  </div>
                </div>
              )}

              {/* Vehicle Status Overlay */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-700/50 p-3 sm:p-4 min-w-[160px] sm:min-w-[200px]">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-white">Vehicle Status</h4>
                  <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
                    {vehicleMetrics.total}
                  </span>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-slate-300">Available</span>
                    </div>
                    <span className="text-emerald-400 font-medium">{vehicleMetrics.available}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                      <span className="text-slate-300">Busy</span>
                    </div>
                    <span className="text-amber-400 font-medium">{vehicleMetrics.busy}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800">
              <h3 className="text-base sm:text-lg font-semibold text-white">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-300 transition-colors"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Customer Info */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm sm:text-base">{selectedBooking.customer}</h4>
                  <p className="text-xs sm:text-sm text-slate-400">{selectedBooking.phone}</p>
                </div>
              </div>

              {/* Journey Details */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex gap-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full mt-1"></div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-300">Pickup</p>
                    <p className="text-xs sm:text-sm text-slate-400">{selectedBooking.pickup}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-3 h-3 bg-rose-400 rounded-full mt-1"></div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-300">Destination</p>
                    <p className="text-xs sm:text-sm text-slate-400">{selectedBooking.destination}</p>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-800/50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-400">Amount</p>
                  <p className="text-base sm:text-lg font-bold text-emerald-400">₹{selectedBooking.amount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Distance</p>
                  <p className="text-xs sm:text-sm text-slate-300">{selectedBooking.distance}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Vehicle</p>
                  <p className="text-xs sm:text-sm text-slate-300">{selectedBooking.vehicle_type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <StatusBadge status={selectedBooking.status} />
                </div>
              </div>

              {/* Driver Info */}
              {selectedBooking.driver && [77].includes(selectedBooking.booking_status_cd) && (
                <div className="p-3 sm:p-4 bg-slate-800/30 rounded-lg">
                  <p className="text-xs sm:text-sm font-medium text-slate-300 mb-2">Driver Assigned</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-white">{selectedBooking.driver}</p>
                      <p className="text-xs text-slate-400">{selectedBooking.vehicle}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-4 sm:p-6 border-t border-slate-800">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors text-sm"
              >
                Close
              </button>
              <button
                onClick={() => handleViewDetails(selectedBooking)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;