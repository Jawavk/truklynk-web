import { ArrowLeft, ChevronsRight, Circle, Phone, Truck, MapPinned } from 'lucide-react';
import { useState, useEffect, useRef, memo } from 'react'; // Added memo
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { fetchJourneyDetails, fetchVehicleLocation } from '@/store/slice/trackingSlice';
import { AppDispatch, RootState } from '@/store/store';
import { Modal } from '@/components/ui/layout/Modal';
import carIcon from '/assets/images/car_icon.png';
import truckImage from '/assets/images/Truck.png'; // Adjust path relative to the component
import profileImage from '/assets/images/profile.png'; // Adjust path relative to the component

// Custom Stepper Component
interface StepData {
  title: string;
  subtitle: string;
  timestamp: string;
  icon: JSX.Element | null;
  isActive: boolean;
  summary?: {
    title: string;
    description: string;
    succeededOn: string;
  };
}

interface MarkerIcon {
  path: google.maps.SymbolPath | string;
  fillColor: string;
  fillOpacity: number;
  strokeWeight: number;
  strokeColor: string;
  scale: number;
}


const darkThemeStyles = [
  {
    elementType: "geometry",
    stylers: [{ color: "#212121" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "on" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#212121" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d5d5d5" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1b1b1b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#404040" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#484848" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#5c5c5c" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#6e6e6e" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill", // Fixed the elementType
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#121212" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6e6e6e" }],
  },
];

// Memoized CustomStepper to prevent unnecessary re-renders
const CustomStepper = memo(({ steps, activeStep }: { steps: StepData[]; activeStep: number }) => {
  return (
    <div className="ml-2">
      {steps.map((step, index) => (
        <div key={index} className="flex mb-6">
          <div className="relative flex flex-col items-center">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${step.isActive ? 'bg-red-600' : 'bg-white border border-gray-700'
                }`}
            >
              {step.icon || <Truck className="w-5 h-5 text-black" />}
            </div>
            {index < steps.length - 1 && (
              <div className="absolute top-10 bottom-0 left-1/2 w-0.5 bg-gray-700 -translate-x-1/2"></div>
            )}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between">
              <span className="font-medium text-white">{step.title}</span>
              {step.timestamp && (
                <span className={step.isActive ? 'text-green-400' : 'text-red-500'}>
                  {step.timestamp}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-400">{step.subtitle}</span>
            {step.summary && (
              <div className="bg-gray-800 p-4 rounded-lg mt-2">
                <div className="text-xs text-gray-300 mb-1">ERROR SUMMARY</div>
                <div className="font-medium mb-2">{step.summary.title}</div>
                <div className="text-sm mb-4">{step.summary.description}</div>
                <div className="text-xs">Succeeded on</div>
                <div className="text-sm">{step.summary.succeededOn}</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

// Static tracking data defined outside the component to ensure stability
const trackingData: StepData[] = [
  {
    title: 'Order Picked',
    subtitle: 'Process statement 1',
    timestamp: '5:56 AM',
    icon: <Truck className="w-5 h-5 text-white" />,
    isActive: true,
  },
  {
    title: 'Process statement 1',
    subtitle: 'Running 15 mins late',
    timestamp: '10:46 AM',
    icon: <Truck className="w-5 h-5 text-black" />,
    isActive: false,
  },
  {
    title: 'Process statement 1',
    subtitle: '',
    timestamp: '',
    icon: <MapPinned className="w-5 h-5 text-black" />,
    isActive: false,
    summary: {
      title: 'Success Title: On Time',
      description: 'Place holder details and description',
      succeededOn: '2024/08/14 14:30:25',
    },
  },
  {
    title: 'Delivered',
    subtitle: 'Process statement 1',
    timestamp: '',
    icon: null,
    isActive: false,
  },
];

const OrderTrack = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Select only the necessary parts of the state to avoid unnecessary re-renders
  const journeyDetails = useSelector((state: RootState) => state.tracking.journeyDetails);
  const vehicleLocation = useSelector((state: RootState) => state.tracking.vehicleLocation);
  const loading = useSelector((state: RootState) => state.tracking.loading);
  const error = useSelector((state: RootState) => state.tracking.error);

  const [activeTab, setActiveTab] = useState('Tracking');
  const order = location.state?.order;

  const contactInfo = order?.contact_info ? JSON.parse(order.contact_info) : null;
  const driverDetail = order?.driverdetail || null;

  // Google Maps setup
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCq3n0PuZCtun6j0kiLnprf0mEqgQOvGls',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [polyline, setPolyline] = useState<google.maps.LatLngLiteral[]>([]);
  const [vehicleMarker, setVehicleMarker] = useState<google.maps.LatLngLiteral | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [pickupIcon, setPickupIcon] = useState<MarkerIcon | null>(null);
  const [dropoffIcon, setDropoffIcon] = useState<MarkerIcon | null>(null);
  const [vehicleIcon, setVehicleIcon] = useState<google.maps.Icon | google.maps.Symbol | null>(null);
  const [shouldUpdateBounds, setShouldUpdateBounds] = useState(true);
  const mapRef = useRef(null);

  const vehicleIconSize = 40;

  useEffect(() => {
    if (isLoaded && window.google) {
      setPickupIcon({
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#4CAF50',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
        scale: 8,
      });

      setDropoffIcon({
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#F44336',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
        scale: 8,
      });

      setVehicleIcon({
        url: carIcon,
        scaledSize: new window.google.maps.Size(vehicleIconSize, vehicleIconSize),
        anchor: new window.google.maps.Point(vehicleIconSize / 2, vehicleIconSize / 2),
      });

      const img = new Image();
      img.src = carIcon;
      img.onload = () => {
        console.log('Car icon loaded successfully');
      };
      img.onerror = () => {
        console.error('Failed to load car icon, falling back to symbol');
        setVehicleIcon({
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 1,
          scale: 5,
        });
      };
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded && map) {
      if (!window.google) {
        console.error('Google Maps API failed to load');
        return;
      }
      const dirService = new window.google.maps.DirectionsService();
      setDirectionsService(dirService);

      const dirRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5,
          strokeOpacity: 1.0,
        },
      });
      setDirectionsRenderer(dirRenderer);
    }
  }, [isLoaded, map]);

  // Fetch journey details and start vehicle tracking
  useEffect(() => {
    if (order?.service_booking_sno) {
      console.log('Fetching journey details for service_booking_sno:', order.service_booking_sno);
      dispatch(fetchJourneyDetails(order.service_booking_sno));
    } else {
      console.warn('No service_booking_sno found in order');
    }
  
    if (order?.selected_vehicle_sno) {
      console.log('Fetching vehicle location for selected_vehicle_sno:', order.selected_vehicle_sno);
      dispatch(fetchVehicleLocation(order.selected_vehicle_sno));
  
      // Periodic vehicle location updates (every 30 seconds)
      const interval = setInterval(() => {
        console.log('Polling vehicle location for selected_vehicle_sno:', order.selected_vehicle_sno);
        dispatch(fetchVehicleLocation(order.selected_vehicle_sno));
      }, 30000);
  
      return () => clearInterval(interval);
    } else {
      console.warn('No selected_vehicle_sno found in order');
      return undefined; // 👈 explicitly return undefined
    }
  }, [dispatch, order]);
  

  // Calculate and display route using Directions Service
  useEffect(() => {
    if (directionsService && directionsRenderer && isLoaded && map && window.google) {
      const pickup = journeyDetails?.pickupLocation?.latlng
        ? new window.google.maps.LatLng(
          journeyDetails.pickupLocation.latlng.latitude,
          journeyDetails.pickupLocation.latlng.longitude
        )
        : order?.pickup_location?.latlng
          ? new window.google.maps.LatLng(
            order.pickup_location.latlng.latitude,
            order.pickup_location.latlng.longitude
          )
          : null;

      const dropoff = journeyDetails?.dropLocation?.latlng
        ? new window.google.maps.LatLng(
          journeyDetails.dropLocation.latlng.latitude,
          journeyDetails.dropLocation.latlng.longitude
        )
        : order?.drop_location?.latlng
          ? new window.google.maps.LatLng(
            order.drop_location.latlng.latitude,
            order.drop_location.latlng.longitude
          )
          : null;

      if (pickup && dropoff) {
        setRouteLoading(true);
        directionsService.route(
          {
            origin: pickup,
            destination: dropoff,
            travelMode: window.google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK && result) {
              directionsRenderer.setDirections(result);

              const route = result.routes[0];
              const points: google.maps.LatLngLiteral[] = [];
              const path = route?.overview_path;

              path?.forEach((point) => {
                points.push({ lat: point.lat(), lng: point.lng() });
              });

              setPolyline(points);

              const bounds = new window.google.maps.LatLngBounds();
              bounds.extend(pickup);
              bounds.extend(dropoff);
              map.fitBounds(bounds);
            } else {
              console.error('Directions request failed with status:', status);
              setPolyline([
                { lat: pickup.lat(), lng: pickup.lng() },
                { lat: dropoff.lat(), lng: dropoff.lng() },
              ]);
            }
            setRouteLoading(false);
          }
        );
      }
    }
  }, [directionsService, directionsRenderer, journeyDetails, order, isLoaded, map]);

  // Update vehicle marker when location changes
  useEffect(() => {
    if (vehicleLocation) {
      console.log('Updating vehicle marker:', vehicleLocation);
      console.log('Parsed Lat:', parseFloat(vehicleLocation.lat as any));
      console.log('Parsed Lng:', parseFloat(vehicleLocation.lng as any));

      setVehicleMarker({
        lat: parseFloat(vehicleLocation.lat as any),
        lng: parseFloat(vehicleLocation.lng as any),
      });
      setShouldUpdateBounds(false);
    }
  }, [vehicleLocation]);

  // Update map bounds to include all markers only when necessary
  useEffect(() => {
    if (map && shouldUpdateBounds && (vehicleMarker || journeyDetails)) {
      const bounds = new window.google.maps.LatLngBounds();

      if (vehicleMarker) {
        console.log('Adding vehicle marker to bounds:', vehicleMarker);
        bounds.extend(vehicleMarker);
      }

      if (journeyDetails?.pickupLocation?.latlng) {
        bounds.extend({
          lat: journeyDetails.pickupLocation.latlng.latitude,
          lng: journeyDetails.pickupLocation.latlng.longitude,
        });
      }

      if (journeyDetails?.dropLocation?.latlng) {
        bounds.extend({
          lat: journeyDetails.dropLocation.latlng.latitude,
          lng: journeyDetails.dropLocation.latlng.longitude,
        });
      }

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);

        // Prevent over-zooming
        const zoom = map.getZoom();
        if (zoom && zoom > 15) {
          map.setZoom(15);
        }
      }
    }
  }, [map, vehicleMarker, journeyDetails, shouldUpdateBounds]);

  // Map center (prioritize vehicle location, then pickup, then default)
  const center = vehicleMarker
    ? vehicleMarker
    : journeyDetails?.pickupLocation?.latlng
      ? {
        lat: journeyDetails.pickupLocation.latlng.latitude,
        lng: journeyDetails.pickupLocation.latlng.longitude,
      }
      : order?.pickup_location?.latlng
        ? {
          lat: order.pickup_location.latlng.latitude,
          lng: order.pickup_location.latlng.longitude,
        }
        : { lat: 12.8891271, lng: 80.229396 }; // Chennai as default

  // Modal handlers for cancellation
  const openCancelModal = () => setIsCancelModalOpen(true);
  const closeCancelModal = () => setIsCancelModalOpen(false); // Fixed bug
  const confirmCancel = () => {
    navigate('/cancel-order', {
      state: { serviceBookingSno: order?.service_booking_sno },
    });
    closeCancelModal();
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="bg-black text-white p-4 flex items-center text-sm">
        <span className="text-gray-400 text-lg">Order management</span>
        <ChevronsRight className="w-6 h-4" />
        <span className="text-lg">Order Track</span>
      </div>

      <div className="flex flex-1">
        <div className="bg-black text-white min-h-screen p-4">
          <div className="my-4 text-lg font-medium">#{order?.service_booking_sno || 'N/A'}</div>

          <div className="flex w-96 border border-gray-800 rounded-md mb-4">
            {['Tracking', 'Load Info', 'Contacts'].map((tab) => (
              <button
                key={tab}
                className={`flex-1 pb-2 px-4 text-sm font-medium text-center ${activeTab === tab ? 'bg-white text-black rounded-md py-2' : 'text-white py-2'
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-black">
            {activeTab === 'Tracking' && (
              <>
                <div className="border border-gray-800 rounded-xl p-5">
                  <h2 className="text-lg font-bold mb-6">Live Tracking</h2>
                  {loading ? (
                    <div>Loading...</div>
                  ) : error ? (
                    <div className="text-red-500">Error: {error}</div>
                  ) : (
                    <CustomStepper steps={trackingData} activeStep={0} />
                  )}
                </div>
                {journeyDetails?.cancelPermission && (
                  <div className="mt-4">
                    <button
                      onClick={openCancelModal}
                      className="w-full py-3 bg-red-600 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'Load Info' && (
              <div className="border border-gray-800 rounded-xl p-5">
                <div className="bg-black text-white">
                  <h2 className="text-lg mb-1">Delivery Items</h2>
                  <div
                    className="rounded-lg p-4 relative overflow-hidden"
                    style={{ width: '340px', height: '170px' }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 left-0 pointer-events-none">
                      <img
                        src={truckImage}
                        style={{
                          width: '340px',
                          height: '170px',
                          right: '-30px',
                          top: '0',
                          objectFit: 'contain',
                        }}
                        alt="Truck"
                      />
                    </div>
                    <div className="flex items-center mb-4 relative z-10">
                      <span className="bg-yellow-500 text-black text-xs px-2 py-1 mr-2 font-bold rounded">
                        {order?.vehicle_number || 'N/A'}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {order?.vehicle_name || 'Unknown Vehicle'} -{' '}
                        {order?.subcategory_name || 'Unknown Capacity'}
                      </span>
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-white mr-3">
                          <Circle className="w-4 h-4 fill-current" />
                        </div>
                        <span>
                          {order?.weight_of_goods ? `${order.weight_of_goods} ${order.weight_type_name}` : 'N/A'}{' '}
                          {order?.types_of_goods || 'Unknown Goods'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Contacts' && (
              <div>
                <div className="rounded-lg p-3 mb-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-gray-800 p-3 rounded-lg mr-3">
                      <img src={profileImage} alt="Customer Profile" />
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {contactInfo?.name || 'Unknown Customer'}
                      </div>
                      <div className="text-white font-medium">
                        {contactInfo?.phone || 'Unknown Customer'}
                      </div>
                      <div className="text-sm text-gray-400">Customer</div>
                    </div>
                  </div>
                  <a href={`tel:${contactInfo?.phone}`} className="bg-gray-800 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-white" />
                  </a>
                </div>
                <div className="rounded-lg p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-gray-800 p-3 rounded-lg mr-3">
                      <img src={profileImage} alt="Driver Profile" />
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {driverDetail?.name || 'Unknown Driver'}
                      </div>
                      <div className="text-white font-medium">
                        {driverDetail?.number || 'Unknown Driver'}
                      </div>
                      <div className="text-sm text-gray-400">Driver</div>
                    </div>
                  </div>
                  <a href={`tel:${driverDetail?.number}`} className="bg-gray-800 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="bg-black flex justify-end mt-28 items-center">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-3 bg-zinc-800 hover:bg-gray-800 text-white border border-gray-700 rounded-lg flex items-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-900 ml-1 relative">
          {isLoaded ? (
            <GoogleMap
              ref={mapRef}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={center}
              zoom={13}
              onLoad={(map) => setMap(map)}
              options={{
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                styles: darkThemeStyles,
              }}
            >
              {(journeyDetails?.pickupLocation?.latlng || order?.pickup_location?.latlng) && pickupIcon && (
                <Marker
                  position={
                    journeyDetails?.pickupLocation?.latlng
                      ? {
                        lat: journeyDetails.pickupLocation.latlng.latitude,
                        lng: journeyDetails.pickupLocation.latlng.longitude,
                      }
                      : {
                        lat: order.pickup_location.latlng.latitude,
                        lng: order.pickup_location.latlng.longitude,
                      }
                  }
                  title="Pickup Location"
                  icon={pickupIcon}
                  zIndex={2}
                />
              )}

              {(journeyDetails?.dropLocation?.latlng || order?.drop_location?.latlng) && dropoffIcon && (
                <Marker
                  position={
                    journeyDetails?.dropLocation?.latlng
                      ? {
                        lat: journeyDetails.dropLocation.latlng.latitude,
                        lng: journeyDetails.dropLocation.latlng.longitude,
                      }
                      : {
                        lat: order.drop_location.latlng.latitude,
                        lng: order.drop_location.latlng.longitude,
                      }
                  }
                  title="Drop Location"
                  icon={dropoffIcon}
                  zIndex={2}
                />
              )}

              {vehicleMarker && vehicleIcon && (
                <Marker
                  position={vehicleMarker}
                  title="Vehicle Location"
                  icon={vehicleIcon}
                  zIndex={3}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              Loading map...
            </div>
          )}

          {routeLoading && (
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white">Calculating route...</div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isCancelModalOpen}
        onClose={closeCancelModal}
        title="Confirm Cancellation"
        className="bg-gray-800 text-white rounded-lg p-6 max-w-md mx-auto"
      >
        <p className="mb-6">Are you sure you want to cancel this order?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={closeCancelModal}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
          <button
            onClick={confirmCancel}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default OrderTrack;