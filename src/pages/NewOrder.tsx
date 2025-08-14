import type React from "react"
import { ChevronsRight, MapPin } from 'lucide-react'
import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom" // Import useLocation
import { useJsApiLoader, Autocomplete, type Libraries, GoogleMap, Marker } from "@react-google-maps/api"
import Button from "@/components/ui/form/Button"
import { Input } from "@/components/ui/form/Input"
import { FormProvider, useForm } from "react-hook-form"

// Define Booking interface to match the data passed from Website
interface Booking {
    user_booking_sno: number;
    pickup_location: {
        address: string;
        latlng: {
            latitude: number;
            longitude: number;
        };
        city: string;
        state: string;
        country: string;
        landmark: string;
        contact_info: string;
    };
    drop_location: {
        address: string;
        latlng: {
            latitude: number;
            longitude: number;
        };
        city: string;
        state: string;
        country: string;
        landmark: string;
        contact_info: string;
    };
    name: string;
    mobile_number: string;
    types_of_goods: string;
    weight_of_goods: string;
    created_on: string;
    status?: string;
    ignore_reason?: string;
}

const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a3646" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
]
const libraries: Libraries = ["places", "geometry"]

// Map district names to standardized city names (updated with your new districts)
const cityNameMap: { [key: string]: string } = {
    // City names
    Namakkal: "Namakkal",
    Salem: "Salem",
    Erode: "Erode",
    Chennai: "Chennai",
    Coimbatore: "Coimbatore",
    Karur: "Karur",
    // District names mapping
    "Namakkal District": "Namakkal",
    "Salem District": "Salem",
    "Erode District": "Erode",
    Kanchipuram: "Chennai",
    Chengalpattu: "Chennai",
    "Coimbatore District": "Coimbatore",
    "Karur District": "Karur",
    "Madurai District": "Madurai",
}

// Updated list of allowed cities for pickup restriction
const allowedPickupCities = ["Namakkal", "Salem", "Erode", "Chennai", "Coimbatore", "Karur"]

// Function to fetch district from pincode (client-side, via proxy)
const fetchDistrictFromPincode = async (pincode: string): Promise<string | null> => {
    try {
        // Replace with your server-side proxy endpoint
        const response = await fetch(`/api/pincode/${pincode}`)
        const data = await response.json()
        if (data[0]?.Status === "Success") {
            const district = data[0].PostOffice[0]?.District
            return cityNameMap[district] || district
        }
        return null
    } catch (error) {
        console.error("Failed to fetch pincode data:", error)
        return null
    }
}

export default function NewOrder() {
    const navigate = useNavigate()
    const location = useLocation(); // Get location object
    const { initialBooking, initialTypesOfGoods, initialWeightOfGoods } = location.state as {
        initialBooking?: Booking;
        initialTypesOfGoods?: string;
        initialWeightOfGoods?: string;
    } || {}; // Destructure initialBooking and new properties

    const [pickupLocation, setPickupLocation] = useState(initialBooking?.pickup_location.address || "");
    const [locationError, setLocationError] = useState<string>("")
    const [dropLocation, setDropLocation] = useState(initialBooking?.drop_location.address || "");
    const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
    const [pickupCoordinates, setPickupCoordinates] = useState<{ lat: number; lng: number } | null>(
        initialBooking?.pickup_location.latlng ? { lat: initialBooking.pickup_location.latlng.latitude, lng: initialBooking.pickup_location.latlng.longitude } : null
    );
    const [dropAutocomplete, setDropAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
    const [dropCoordinates, setDropCoordinates] = useState<{ lat: number; lng: number } | null>(
        initialBooking?.drop_location.latlng ? { lat: initialBooking.drop_location.latlng.latitude, lng: initialBooking.drop_location.latlng.longitude } : null
    );
    const [distance, setDistance] = useState<number | null>(null)
    const [showDirections, setShowDirections] = useState(false)
    const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
    const [pickupDetails, setPickupDetails] = useState<any>(
        initialBooking ? {
            name: initialBooking.name,
            mobilenumber: initialBooking.mobile_number,
            address: initialBooking.pickup_location.address,
            lat: initialBooking.pickup_location.latlng.latitude,
            lng: initialBooking.pickup_location.latlng.longitude,
            city: initialBooking.pickup_location.city,
            state: initialBooking.pickup_location.state,
            country: initialBooking.pickup_location.country,
            landmark: initialBooking.pickup_location.landmark,
            contact_info: initialBooking.pickup_location.contact_info,
        } : null
    );
    const [dropDetails, setDropDetails] = useState<any>(
        initialBooking ? {
            name: initialBooking.name,
            mobilenumber: initialBooking.mobile_number,
            address: initialBooking.drop_location.address,
            lat: initialBooking.drop_location.latlng.latitude,
            lng: initialBooking.drop_location.latlng.longitude,
            city: initialBooking.drop_location.city,
            state: initialBooking.drop_location.state,
            country: initialBooking.drop_location.country,
            landmark: initialBooking.drop_location.landmark,
            contact_info: initialBooking.drop_location.contact_info,
        } : null
    );
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

    // Map reference
    const mapRef = useRef<google.maps.Map | null>(null)
    // DirectionsRenderer reference for direct control
    const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null)

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: "AIzaSyCq3n0PuZCtun6j0kiLnprf0mEqgQOvGls",
        libraries,
    })

    const methods = useForm({
        defaultValues: {
            pickingPoint: initialBooking?.pickup_location.address || "",
            dropPoint: initialBooking?.drop_location.address || "",
        },
    })

    useEffect(() => {
        if (!locationError) return
        const timer = setTimeout(() => {
            setLocationError("")
        }, 10000) // 10 seconds
        return () => clearTimeout(timer)
    }, [locationError])

    // Effect to trigger route calculation when coordinates and map are ready
    useEffect(() => {
        console.log("NewOrder useEffect: isLoaded", isLoaded, "pickupCoordinates", pickupCoordinates, "dropCoordinates", dropCoordinates, "mapRef.current", mapRef.current);
        if (isLoaded && pickupCoordinates && dropCoordinates && mapRef.current) {
            console.log("All conditions met for calculateRoute. Calling it now.");
            calculateRoute();
        } else if (isLoaded && initialBooking && (!pickupCoordinates || !dropCoordinates)) {
            console.warn("Initial booking present but coordinates not fully set. Check initialBooking data:", initialBooking);
        }
    }, [isLoaded, pickupCoordinates, dropCoordinates, mapRef.current, initialBooking]);


    const calculateRoute = async () => {
        console.log("calculateRoute called with:", { pickupCoordinates, dropCoordinates, isLoaded, mapRefCurrent: mapRef.current });
        if (!pickupCoordinates || !dropCoordinates || !window.google || !mapRef.current) {
            console.log("calculateRoute prerequisites not met. Returning.");
            return
        }
        const directionsService = new window.google.maps.DirectionsService() // Use window.google
        try {
            const result = await directionsService.route({
                origin: pickupCoordinates,
                destination: dropCoordinates,
                travelMode: window.google.maps.TravelMode.DRIVING, // Use window.google
            })
            console.log("Directions result:", result);
            // Set up a new DirectionsRenderer directly
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null)
            }
            const directionsRenderer = new window.google.maps.DirectionsRenderer({ // Use window.google
                directions: result,
                map: mapRef.current, // This is crucial
                polylineOptions: {
                    strokeColor: "#FF0000",
                    strokeOpacity: 1.0,
                    strokeWeight: 4,
                },
                suppressMarkers: true, // Keep custom markers visible
            })
            directionsRendererRef.current = directionsRenderer
            setDirectionsResponse(result)
            setShowDirections(true)
            // Update distance from directions result
            if (result.routes[0]?.legs[0]?.distance) {
                setDistance(result.routes[0].legs[0].distance.value / 1000) // Convert meters to km
            }
        } catch (error) {
            console.error("Directions request failed: ", error)
            // Fallback to straight-line distance
            if (window.google?.maps?.geometry) {
                const pickupLatLng = new window.google.maps.LatLng(pickupCoordinates.lat, pickupCoordinates.lng) // Use window.google
                const dropLatLng = new window.google.maps.LatLng(dropCoordinates.lat, dropCoordinates.lng) // Use window.google
                const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(pickupLatLng, dropLatLng) // Use window.google
                setDistance(distanceInMeters / 1000)
            }
        }
    }

    const handlePlaceSelect = (
        autocomplete: google.maps.places.Autocomplete | null,
        setLocation: (value: string) => void,
        setCoordinates: (coords: { lat: number; lng: number } | null) => void,
        setDetails: (value: any) => void,
        label: "Pickup" | "Drop",
    ) => {
        if (autocomplete) {
            const place = autocomplete.getPlace()
            if (place && place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat()
                const lng = place.geometry.location.lng()
                const address = place.formatted_address || place.name || ""
                const addressComponents = place.address_components || []
                console.log("Address Components:", addressComponents)
                const getComponent = (type: string) =>
                    addressComponents.find((component) => component.types.includes(type))?.long_name || ""
                const locality = getComponent("locality")
                const sublocality = getComponent("sublocality") || getComponent("sublocality_level_1")
                const adminAreaLevel2 = getComponent("administrative_area_level_2")
                const state = getComponent("administrative_area_level_1")
                const country = getComponent("country")
                const possibleCityNames = [locality, sublocality, adminAreaLevel2].filter(Boolean)
                const standardizedCity = possibleCityNames
                    .map((name) => cityNameMap[name] || name)
                    .find((city) => allowedPickupCities.includes(city))

                // Use initialBooking's name and mobile number if available, otherwise use hardcoded values or allow user input
                const customerName = initialBooking?.name || "Dhanush";
                const customerMobileNumber = initialBooking?.mobile_number || "56564165665";

                // Only apply city restriction for Pickup locations
                if (label === "Pickup") {
                    const isValidCity =
                        country === "India" &&
                        (state === "Tamil Nadu" || state === "Tamilnadu") &&
                        standardizedCity &&
                        allowedPickupCities.includes(standardizedCity)
                    if (isValidCity) {
                        setLocation(address)
                        setCoordinates({ lat, lng })
                        setDetails({
                            name: customerName,
                            mobilenumber: customerMobileNumber,
                            address,
                            lat,
                            lng,
                            city: standardizedCity || locality || sublocality || "Unknown",
                            state,
                            country,
                        })
                        setLocationError("") // Clear any previous error
                    } else {
                        // Clear input and show error for pickup
                        setLocation("")
                        setCoordinates(null)
                        setDetails(null)
                        setLocationError(
                            `Please select a pickup location in one of these Tamil Nadu cities: ${allowedPickupCities.join(", ")}`,
                        )
                    }
                } else {
                    // For Drop locations, accept any location without restriction
                    setLocation(address)
                    setCoordinates({ lat, lng })
                    setDetails({
                        name: customerName,
                        mobilenumber: customerMobileNumber,
                        address,
                        lat,
                        lng,
                        city: locality || sublocality || adminAreaLevel2 || "Unknown",
                        state,
                        country,
                    })
                    setLocationError("") // Clear any previous error
                }
            } else {
                console.warn("No geometry or location found for place:", place)
            }
        }
    }
    // Handle input change and clearing locations
    const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setPickupLocation(value)
        // If the input is cleared, reset the coordinates and details
        if (!value) {
            setPickupCoordinates(null)
            setPickupDetails(null)
            setLocationError("") // Clear error when input is cleared
            // Explicitly clear directions
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null)
                directionsRendererRef.current = null
            }
            setShowDirections(false)
            setDirectionsResponse(null)
        }
    }
    const handleDropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setDropLocation(value)
        // If the input is cleared, reset the coordinates and details
        if (!value) {
            setDropCoordinates(null)
            setDropDetails(null)
            // Explicitly clear directions
            if (directionsRendererRef.current) {
                directionsRendererRef.current.setMap(null)
                directionsRendererRef.current = null
            }
            setShowDirections(false)
            setDirectionsResponse(null)
        }
    }
    // Clear both locations and reset everything
    const clearAllLocations = () => {
        setPickupLocation("")
        setDropLocation("")
        setPickupCoordinates(null)
        setDropCoordinates(null)
        setPickupDetails(null)
        setDropDetails(null)
        setDistance(null)
        setLocationError("") // Clear any error messages
        // Explicitly clear directions
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setMap(null)
            directionsRendererRef.current = null
        }
        setShowDirections(false)
        setDirectionsResponse(null)
        // Re-center map
        if (mapRef.current && currentLocation) {
            mapRef.current.panTo(currentLocation)
            mapRef.current.setZoom(14)
        }
    }
    // Get current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setCurrentLocation({ lat: latitude, lng: longitude })
                },
                (error) => {
                    console.warn("Geolocation failed or denied, using default location.")
                    setCurrentLocation({ lat: 13.0827, lng: 80.2707 }) // Chennai fallback
                },
            )
        } else {
            setCurrentLocation({ lat: 13.0827, lng: 80.2707 }) // Fallback for unsupported browsers
        }
    }, [])
    // Store map reference
    const onMapLoad = (map: google.maps.Map) => {
        mapRef.current = map
        console.log("Map loaded, mapRef.current set:", mapRef.current);
    }
    // Determine map center based on available coordinates
    const getMapCenter = () => {
        if (pickupCoordinates && dropCoordinates) {
            // If both coordinates exist, center the map at the midpoint
            return {
                lat: (pickupCoordinates.lat + dropCoordinates.lat) / 2,
                lng: (pickupCoordinates.lng + dropCoordinates.lng) / 2,
            }
        } else if (pickupCoordinates) {
            return pickupCoordinates
        } else if (dropCoordinates) {
            return dropCoordinates
        } else if (currentLocation) {
            return currentLocation
        }
        return { lat: 13.0827, lng: 80.2707 } // Default to Chennai
    }
    // Calculate proper zoom level
    const getZoomLevel = () => {
        if (pickupCoordinates && dropCoordinates) {
            // For two points, zoom should be dynamic based on distance
            return 12 // You can implement distance-based zoom calculation here
        }
        return 14 // Default zoom for single point
    }
    return (
        <FormProvider {...methods}>
            <div className="bg-black min-h-screen flex flex-col">
                {/* Breadcrumb */}
                <div className="bg-black text-white p-4 flex items-center text-sm">
                    <span className="text-gray-400 text-lg">Order management</span>
                    <ChevronsRight className="w-6 h-4 border-b border-gray-300" />
                    <span className="text-lg">Create new order</span>
                </div>
                <div className="flex flex-1">
                    {/* Sidebar */}
                    <div className="w-96 p-4 text-white bg-black border-r border-gray-800">
                        <h3 className="font-medium text-lg mb-6">Shipping address</h3>
                        <div className="space-y-4 relative">
                            {isLoaded ? (
                                <>
                                    {/* Pickup */}
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center justify-center w-6 relative">
                                            <MapPin className="text-white z-10" />
                                        </div>
                                        <div className="flex-1">
                                            <Autocomplete
                                                onLoad={(auto) => setPickupAutocomplete(auto)}
                                                onPlaceChanged={() =>
                                                    handlePlaceSelect(
                                                        pickupAutocomplete,
                                                        setPickupLocation,
                                                        setPickupCoordinates,
                                                        setPickupDetails,
                                                        "Pickup",
                                                    )
                                                }
                                                restrictions={{ country: "in" }}
                                            >
                                                <Input
                                                    type="text"
                                                    placeholder="Picking point"
                                                    name="pickingPoint"
                                                    value={pickupLocation}
                                                    onChange={handlePickupChange}
                                                    className="w-full bg-black border border-gray-800 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-white"
                                                />
                                            </Autocomplete>
                                        </div>
                                    </div>
                                    {/* Dashed vertical line between pickup and drop */}
                                    <div className="absolute left-3 top-3 h-10 border-l-2 border-dashed border-gray-700 z-0" />
                                    {/* Drop */}
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center justify-center w-6">
                                            <MapPin className="text-red-600 z-10" />
                                        </div>
                                        <div className="flex-1">
                                            <Autocomplete
                                                onLoad={(auto) => setDropAutocomplete(auto)}
                                                onPlaceChanged={() =>
                                                    handlePlaceSelect(
                                                        dropAutocomplete,
                                                        setDropLocation,
                                                        setDropCoordinates,
                                                        setDropDetails,
                                                        "Drop",
                                                    )
                                                }
                                            >
                                                <Input
                                                    type="text"
                                                    placeholder="Drop point"
                                                    name="dropPoint"
                                                    value={dropLocation}
                                                    onChange={handleDropChange}
                                                    className="w-full bg-black border border-gray-800 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder-white"
                                                />
                                            </Autocomplete>
                                        </div>
                                    </div>
                                    {/* Distance display */}
                                    {distance !== null && (
                                        <p className="text-sm text-green-400 mt-4">Distance: {distance.toFixed(2)} km</p>
                                    )}
                                    {/* Clear button */}
                                    {(pickupLocation || dropLocation) && (
                                        <Button onClick={clearAllLocations} className="text-xs text-gray-400 hover:text-white mt-2">
                                            Clear all locations
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-400 text-sm">Loading map...</p>
                            )}
                        </div>
                        {locationError && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 00-1.414-1.414L8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700">{locationError}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Map Section */}
                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={{ width: "80%", height: "800px" }}
                            center={getMapCenter()}
                            zoom={getZoomLevel()}
                            options={{
                                styles: darkMapStyle,
                                disableDefaultUI: true,
                            }}
                            onLoad={onMapLoad}
                        >
                            {/* Current location marker (only shown when no other markers are present) */}
                            {currentLocation && !pickupCoordinates && !dropCoordinates && (
                                <Marker
                                    position={currentLocation}
                                    icon={{
                                        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                                    }}
                                />
                            )}
                            {/* Pickup marker */}
                            {pickupCoordinates && (
                                console.log("Rendering Pickup Marker at:", pickupCoordinates),
                                <Marker position={pickupCoordinates} key={`pickup-${pickupCoordinates.lat}-${pickupCoordinates.lng}`} />
                            )}
                            {/* Drop marker */}
                            {dropCoordinates && (
                                console.log("Rendering Drop Marker at:", dropCoordinates),
                                <Marker
                                    position={dropCoordinates}
                                    key={`drop-${dropCoordinates.lat}-${dropCoordinates.lng}`}
                                    icon={{
                                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Changed to a visible blue dot
                                        scaledSize: isLoaded ? new window.google.maps.Size(40, 40) : undefined, // Ensure window.google is loaded
                                    }}
                                />
                            )}
                            {/* Note: We're not using react-google-maps DirectionsRenderer anymore
                                since we're manually managing the DirectionsRenderer through the ref */}
                        </GoogleMap>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-400 text-sm">Loading map...</p>
                        </div>
                    )}
                </div>
                {/* Footer Buttons */}
                <div className="bg-black p-4 flex justify-between items-center">
                    <Button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-black hover:bg-gray-800 text-white border border-gray-700 rounded-full flex items-center transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        BACK
                    </Button>
                    <Button
                        onClick={() =>
                            navigate("/customerrequirements", {
                                state: {
                                    pickupDetails,
                                    dropDetails,
                                    distance: distance ?? null,
                                    initialBookingName: initialBooking?.name, // Pass name from initial booking
                                    initialBookingMobileNumber: initialBooking?.mobile_number, // Pass mobile number from initial booking
                                    initialTypesOfGoods: initialTypesOfGoods, // Pass types of goods
                                    initialWeightOfGoods: initialWeightOfGoods, // Pass weight of goods
                                },
                            })
                        }
                        disabled={!pickupCoordinates || !dropCoordinates}
                        className={`px-6 py-2 text-white rounded-full flex items-center transition-colors ${!pickupCoordinates || !dropCoordinates ? "bg-red-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                            }`}
                    >
                        NEXT
                        <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </Button>
                </div>
            </div>
        </FormProvider>
    )
}
