import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useJsApiLoader, GoogleMap, Marker, InfoWindow, type Libraries } from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchVehiclesData, VehicleData } from '@/store/slice/InsightDashboardSlice';
import { Maximize2, MapPin } from "lucide-react";

// Constants
const libraries: Libraries = ["places", "geometry"];
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c1221" }] },
];

const InsightDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: vehiclesData } = useSelector((state: RootState) => state.InsightDashboard);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [isShowingAllVehicles, setIsShowingAllVehicles] = useState(false);
  const [previousMapState, setPreviousMapState] = useState<{
    center: { lat: number; lng: number };
    zoom: number;
  } | null>(null);
  
  const mapRef = useRef<google.maps.Map | null>(null);
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCq3n0PuZCtun6j0kiLnprf0mEqgQOvGls",
    libraries,
  });

  // Vehicle metrics
  const vehicleMetrics = useMemo(() => {
    const available = vehiclesData?.filter(v => ![77, 73].includes(v.booking_status_cd)).length || 0;
    const busy = vehiclesData?.filter(v => [77, 73].includes(v.booking_status_cd)).length || 0;
    return { available, busy, total: available + busy };
  }, [vehiclesData]);

  // Fetch vehicle data
  useEffect(() => {
    dispatch(fetchVehiclesData());
  }, [dispatch]);

  // Get current location
  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        () => {
          console.warn("Geolocation failed, using default location.");
          setCurrentLocation({ lat: 13.0827, lng: 80.2707 });
        }
      );

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.warn("Error watching position:", error.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        }
      );
    } else {
      setCurrentLocation({ lat: 13.0827, lng: 80.2707 });
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log("Map loaded");
    mapRef.current = map;
  }, []);

  const getMapCenter = useCallback(() => {
    if (currentLocation) return currentLocation;
    if (vehiclesData.length > 0) {
      for (const vehicle of vehiclesData) {
        const lat = Number.parseFloat(vehicle.lat);
        const lng = Number.parseFloat(vehicle.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
    return { lat: 13.0827, lng: 80.2707 };
  }, [currentLocation, vehiclesData]);

  // Save current map state before showing all vehicles
  const saveCurrentMapState = useCallback(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      const zoom = mapRef.current.getZoom();
      if (center && zoom !== undefined) {
        setPreviousMapState({
          center: { lat: center.lat(), lng: center.lng() },
          zoom: zoom
        });
      }
    }
  }, []);

  // Create markers and adjust bounds
  useEffect(() => {
    if (!mapRef.current || vehiclesData.length === 0) {
      console.log("Skipping marker creation: ", { isLoaded, mapExists: !!mapRef.current, hasVehicles: vehiclesData.length });
      return;
    }

    console.log("Creating markers for vehicles: ", vehiclesData.length);

    // Clear existing markers
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
    }
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    infoWindowRef.current = new google.maps.InfoWindow({
      pixelOffset: new google.maps.Size(0, -30),
    });

    const bounds = new google.maps.LatLngBounds();
    const markers = vehiclesData
      .map((vehicle) => {
        const lat = Number.parseFloat(vehicle.lat);
        const lng = Number.parseFloat(vehicle.lng);
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`Skipping marker for vehicle ${vehicle.vehicle_sno} due to invalid coordinates`);
          return null;
        }

        if (currentLocation) {
          bounds.extend(currentLocation);
        }
        bounds.extend({ lat, lng });

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
          if (infoWindowRef.current) {
            infoWindowRef.current.close();
          }

          const content = `
            <div style="padding: 12px; max-width: 200px; color: #1e293b; font-family: system-ui;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${vehicle.vehicle_name}</h3>
              <p style="margin: 4px 0; font-size: 12px;"><strong>Company:</strong> ${vehicle.company_name}</p>
              ${vehicle.vehicle_model ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Model:</strong> ${vehicle.vehicle_model}</p>` : ""}
              ${vehicle.mobile_no ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Mobile:</strong> ${vehicle.mobile_no}</p>` : ""}
              <div style="margin-top: 8px;">
                <span style="background: ${isBusy ? '#f59e0b' : '#10b981'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 10px;">
                  ${isBusy ? 'Busy' : 'Available'}
                </span>
              </div>
            </div>
          `;

          infoWindowRef.current?.setContent(content);
          infoWindowRef.current?.setPosition({ lat, lng });
          infoWindowRef.current?.open(mapRef.current, marker);
          setSelectedVehicle(vehicle);
        });

        return marker;
      })
      .filter((marker): marker is google.maps.Marker => marker !== null);

    markersRef.current = markers;

    clustererRef.current = new MarkerClusterer({
      map: mapRef.current,
      markers,
    });

    // Fit map to bounds only if there are markers and we're not already showing all vehicles
    if (markers.length > 0 && !isShowingAllVehicles) {
      mapRef.current.fitBounds(bounds);
      console.log("Map bounds set with markers: ", markers.length);
    }

    return () => {
      console.log("Cleaning up markers");
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
      }
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [isLoaded, vehiclesData, currentLocation, isShowingAllVehicles]);

  // Handle clicking on vehicle status total with toggle functionality
  // const handleTotalClick = useCallback(() => {
  //   console.log("Total vehicles clicked:", vehicleMetrics.total);
    
  //   if (!mapRef.current || vehiclesData.length === 0) {
  //     console.log("Cannot handle click: ", { mapExists: !!mapRef.current, hasVehicles: vehiclesData.length });
  //     return;
  //   }

  //   if (isShowingAllVehicles) {
  //     // Return to previous view
  //     if (previousMapState) {
  //       mapRef.current.setCenter(previousMapState.center);
  //       mapRef.current.setZoom(previousMapState.zoom);
  //       console.log("Restored previous map state");
  //     } else {
  //       // Fallback to current location or default center
  //       const center = getMapCenter();
  //       mapRef.current.setCenter(center);
  //       mapRef.current.setZoom(12);
  //       console.log("Restored to default view");
  //     }
  //     setIsShowingAllVehicles(false);
  //   } else {
  //     // Save current state and show all vehicles
  //     saveCurrentMapState();
      
  //     const bounds = new google.maps.LatLngBounds();
  //     vehiclesData.forEach((vehicle) => {
  //       const lat = Number.parseFloat(vehicle.lat);
  //       const lng = Number.parseFloat(vehicle.lng);
  //       if (!isNaN(lat) && !isNaN(lng)) {
  //         bounds.extend({ lat, lng });
  //       }
  //     });
      
  //     if (currentLocation) {
  //       bounds.extend(currentLocation);
  //     }
      
  //     mapRef.current.fitBounds(bounds);
  //     setIsShowingAllVehicles(true);
  //     console.log("Showing all vehicles");
  //   }
  // }, [vehiclesData, currentLocation, isShowingAllVehicles, previousMapState, saveCurrentMapState, getMapCenter, vehicleMetrics.total]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold text-white">Insight Dashboard</h1>
            <p className="text-sm text-slate-400">Live vehicle tracking & insights</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">ID</span>
            </div>
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h3 className="font-semibold text-white">Live Vehicle Tracking</h3>
            <Maximize2 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-[600px] relative">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={getMapCenter()}
                zoom={12}
                options={{ styles: darkMapStyle, disableDefaultUI: true }}
                onLoad={onMapLoad}
              >
                {currentLocation && (
                  <Marker
                    position={currentLocation}
                    icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                  />
                )}
              </GoogleMap>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Loading map...</p>
                </div>
              </div>
            )}

            {/* Vehicle Status Overlay */}
            <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 min-w-48">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">Vehicle Status</h4>
                {/* <span
                  className={`text-xs px-2 py-1 rounded-full cursor-pointer transition-colors ${
                    isShowingAllVehicles 
                      ? 'text-blue-400 bg-blue-900/50 hover:bg-blue-800/50' 
                      : 'text-slate-400 bg-slate-800 hover:bg-slate-700'
                  }`}
                  onClick={handleTotalClick}
                  title={isShowingAllVehicles ? "Click to return to previous view" : "Click to show all vehicles"}
                >
                  {vehicleMetrics.total}
                </span> */}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-slate-300">Available</span>
                  </div>
                  <span className="text-emerald-400 font-medium">{vehicleMetrics.available}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
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
  );
};

export default InsightDashboard;