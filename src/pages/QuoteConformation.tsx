import React, { useEffect, useState } from "react";
import { GoogleMap, Libraries, useJsApiLoader } from "@react-google-maps/api";
import { Clock, ChevronRight, Star, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/ui/form/Button";
import { useDispatch } from "react-redux";
import { fetchQuotation } from "@/store/slice/quotationSlice";

const libraries: Libraries = ["places", "geometry"];

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
];

// Define interfaces for the data structure
interface LatLng {
  latitude: number;
  longitude: number;
}

interface Location {
  address: string;
  latlng: LatLng;
  city: string;
  state: string;
  country: string;
  landmark: string;
  contact_info: string;
}

interface BookingDetails {
  booking_time: string;
  pickup_location: Location;
  drop_location: Location;
  notes: string;
  vehicleName: string;
  service_booking_sno: number;
}

interface Ratings {
  overall_rating: number;
  totalOrders: number;
}

interface ServiceProvider {
  service_provider_sno: number;
  vehicle_sno: number;
  service_provider_quotation_sno: number;
  price_breakup: any;
  price: number;
  user_profile_sno: number;
  service_provider_name: string;
  driver_sno: number | null;
  registering_type: string;
  ratings: Ratings;
  city: string;
  driver_name: string | null;
  mobileNo: string | null;
  bookingDetails: BookingDetails;
  quotation_status: string;
  quotation_status_code: string;
  nearby_vehicles: any;
}

interface QuoteData {
  price: number | null;
  service_provider_list: ServiceProvider[];
}

export default function QuoteConformation() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [activeSegment, setActiveSegment] = useState(0);
  const [fillPercent, setFillPercent] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [timerEnded, setTimerEnded] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCq3n0PuZCtun6j0kiLnprf0mEqgQOvGls",
    libraries,
  });
  const location = useLocation();
  let { service_booking_sno, createdOn, booking_person } = location.state || {};

  if (!service_booking_sno || !createdOn) {
    const storedState = localStorage.getItem("quote_conformation_state");
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      service_booking_sno = parsedState.service_booking_sno;
      createdOn = parsedState.createdOn;
    }
  }

  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  // Timer storage key based on serviceBookingId
  const timerStorageKey = `timer_endTime_${service_booking_sno || 'default'}`;

  // Fetch quotation data
  useEffect(() => {
    console.log(createdOn)

    const fetchQuoteData = async () => {
      if (service_booking_sno) {
        try {
          const resultAction: any = await dispatch(fetchQuotation({
            service_booking_sno: service_booking_sno
          })).unwrap();
          if (resultAction && resultAction.isSuccess && resultAction.json && resultAction.json.length > 0) {
            setQuoteData(resultAction.json[0]);
          } else {
            console.error('Failed to fetch quotations:', resultAction?.payload);
          }
        } catch (error) {
          console.error('Error fetching quotation data:', error);
        }
      }
    };

    fetchQuoteData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location", error);
          setLocationError("Please enable location access to continue");
        }
      );
    } else {
      setLocationError("Your browser doesn't support geolocation");
    }
  }, []);

  // Simple error display in your JSX
  {
    locationError && (
      <div className="bg-red-100 text-red-800 p-3 mb-4 rounded">
        {locationError}
      </div>
    )
  }

  // Timer logic
  useEffect(() => {
    if (timerEnded) return;

    let endTime: Date | null = null;
    const storedEndTime = localStorage.getItem(timerStorageKey);

    if (storedEndTime) {
      endTime = new Date(storedEndTime);
      if (isNaN(endTime.getTime())) {
        console.error("Invalid stored endTime:", storedEndTime);
        localStorage.removeItem(timerStorageKey);
        endTime = null;
      }
    }

    if (!endTime && createdOn) {
      const createdOnDate = new Date(createdOn);
      if (isNaN(createdOnDate.getTime())) {
        console.error("Invalid createdOn date:", createdOn);
        setTimerEnded(true);
        setSecondsLeft(0);
        return;
      }
      const durationMs = 10 * 60 * 1000; // 10 minutes in milliseconds
      endTime = new Date(createdOnDate.getTime() + durationMs);
      localStorage.setItem(timerStorageKey, endTime.toISOString());
      // Persist state for refresh
      localStorage.setItem("quote_conformation_state", JSON.stringify({ service_booking_sno, createdOn }));
    }

    if (!endTime) {
      setTimerEnded(true);
      setSecondsLeft(0);
      return;
    }



    const updateTimer = () => {
      const now = new Date();
      const remainingMs = endTime!.getTime() - now.getTime();

      if (remainingMs <= 0) {
        setTimerEnded(true);
        setSecondsLeft(0);
        localStorage.removeItem(timerStorageKey);
        localStorage.removeItem("quote_conformation_state");
        return;
      }

      const remainingSeconds = Math.floor(remainingMs / 1000);
      setSecondsLeft(remainingSeconds);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [createdOn, timerEnded, timerStorageKey, service_booking_sno]);

  // Progress bar animation
  useEffect(() => {
    const animationFrame = setInterval(() => {
      setFillPercent((prev) => {
        if (prev >= 100) {
          setActiveSegment((seg) => (seg + 1) % 4);
          return 0;
        }
        return prev + 0.5;
      });
    }, 15);

    return () => clearInterval(animationFrame);
  }, []);

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60).toString().padStart(2, "0");
    const seconds = (secs % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleView = (serviceProvider: ServiceProvider) => {
    navigate("/conformbooking", {
      state: {
        selectedProvider: serviceProvider,
      },
    });
  };

  const isPopular = (provider: ServiceProvider): boolean => {
    if (!quoteData || !quoteData.service_provider_list || quoteData.service_provider_list.length <= 1) {
      return false;
    }

    const highestRated = quoteData.service_provider_list.reduce((prev, current) =>
      prev.ratings.overall_rating > current.ratings.overall_rating ? prev : current
    );

    const cheapest = quoteData.service_provider_list.reduce((prev, current) =>
      prev.price < current.price ? prev : current
    );

    return (
      provider.service_provider_sno === highestRated.service_provider_sno ||
      provider.service_provider_sno === cheapest.service_provider_sno
    );
  };

  const getMapCenter = (): google.maps.LatLngLiteral | null => {
    if (quoteData && quoteData.service_provider_list && quoteData.service_provider_list.length > 0) {
      const provider: any = quoteData.service_provider_list[0];
      if (provider.bookingDetails && provider.bookingDetails.pickup_location) {
        return {
          lat: provider.bookingDetails.pickup_location.latlng.latitude,
          lng: provider.bookingDetails.pickup_location.latlng.longitude,
        };
      }
    }
    return currentPosition;
  };

  const onCancel = () => {
    const role = "Customer"
    navigate('/CancelOptions', {
      state:
      {
        role,
        booking_person,
        service_booking_sno
      },
    })

  };

  return (
    <div className="bg-black min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoaded && (getMapCenter() || currentPosition) ? (
          (() => {
            const center = getMapCenter() || currentPosition;
            return center ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "500px" }}
                center={center}
                zoom={14}
                options={{ styles: darkMapStyle, disableDefaultUI: true }}
              />
            ) : (
              <div className="w-full h-[500px] flex items-center justify-center bg-gray-800">
                <p className="text-gray-400 text-sm">Waiting for location data...</p>
              </div>
            );
          })()
        ) : (
          <div className="w-full h-[500px] flex items-center justify-center bg-gray-800">
            <p className="text-gray-400 text-sm">
              {isLoaded ? "Waiting for location data..." : "Loading map..."}
            </p>
          </div>
        )}

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-300">Searching for quotes</span>
            <div className="bg-gray-800 px-3 py-1 rounded-lg flex items-center">
              <Clock size={16} className="mr-1 text-gray-200" />
              <span className="font-bold text-gray-200">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-xs text-gray-200 ml-1">Mins</span>
            </div>
          </div>

          <div className="flex space-x-1 mb-6">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="h-2 flex-1 relative rounded-full overflow-hidden bg-white bg-opacity-20"
              >
                {index === activeSegment && (
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-red-600 rounded-full"
                    style={{ width: `${fillPercent}%`, transition: "width 0.15s linear" }}
                  />
                )}
                {index < activeSegment && (
                  <div className="absolute inset-0 bg-white bg-opacity-60 rounded-full" />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Trip Quotes</h2>
            {quoteData && quoteData.service_provider_list && quoteData.service_provider_list.length > 0 && (
              <button className="text-yellow-500 text-sm flex items-center">
                See all <ChevronRight size={16} className="ml-1" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {!quoteData || !quoteData.service_provider_list || quoteData.service_provider_list.length === 0 ? (
              <div className="bg-gray-800 rounded-xl p-5 text-center">
                <p className="text-gray-400">No quotes available at the moment. Please try again later.</p>
              </div>
            ) : (
              quoteData.service_provider_list.map((provider) => (
                <div
                  key={provider.service_provider_sno}
                  className="bg-gray-800 rounded-xl p-3 flex justify-between items-center relative"
                >
                  {isPopular(provider) && (
                    <div className="absolute -top-1 right-4 bg-red-500 text-white text-xs px-2 py-0.5 rounded-md">
                      Popular
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-8 flex items-center justify-center">
                      <img
                        src="assets/images/truck-right.png"
                        alt="Truck"
                        className="object-contain w-10 h-8"
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{provider.service_provider_name}</div>
                      {provider.bookingDetails && provider.bookingDetails.vehicleName && (
                        <div className="text-sm text-gray-400">{provider.bookingDetails.vehicleName}</div>
                      )}
                      <div className="flex items-center mt-1 text-sm text-gray-400">
                        <div className="font-bold text-white">₹{provider.price}</div>
                        {provider.city && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{provider.city}</span>
                          </>
                        )}
                        {provider.ratings && provider.ratings.overall_rating > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <div className="flex items-center">
                              <Star size={12} className="mr-1 text-yellow-500 fill-yellow-500" />
                              <span>{provider.ratings.overall_rating} stars</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-600 p-2 px-4 rounded-md mr-20">
                    <button className="text-sm text-white" onClick={() => handleView(provider)}>
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 flex justify-between items-center border-t border-gray-900 mt-6">
            <Button
              onClick={() => navigate(-1)}
              className="px-8 py-3 bg-transparent hover:bg-gray-900 text-white border border-gray-700 rounded-full flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>

            <Button
              onClick={onCancel}
              className="px-8 py-3 bg-transparent hover:bg-red-600  text-white border border-gray-700 rounded-full flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2 text-white " />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}