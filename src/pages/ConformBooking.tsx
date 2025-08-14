// import { useState } from 'react';
// import { ChevronRight, MapPin, Phone, Calendar, MessageSquare, X, ChevronDown, Archive, ArrowLeft, ArrowRight } from 'lucide-react';
// import Button from '@/components/ui/form/Button';
// import { useNavigate } from 'react-router-dom';
// import { Select } from '@/components/ui/form/Select';
// import { FormProvider, useForm } from 'react-hook-form';

// export default function ConformBooking() {
//     const navigate = useNavigate();
//     const [paymentExpanded, setPaymentExpanded] = useState(false);
//     const payments = [
//         { value: "payment_using", label: "PAY USING" },
//         { value: "google_pay", label: "Google Pay" },
//         { value: "phonepe", label: "PhonePe" },
//         { value: "paytm", label: "Paytm" },
//         { value: "credit_card", label: "Credit Card" },
//         { value: "debit_card", label: "Debit Card" },
//         { value: "upi", label: "UPI" },
//         { value: "cash", label: "Cash on Delivery" }
//     ];
//     const methods = useForm({
//         defaultValues: {
//             search: '',
//         }
//     });

//     return (
//         <>
//             <FormProvider {...methods}>
//                 <div className='bg-black'>
//                     <div className="max-w-4xl mx-auto px-4 py-6">
//                         <div className="flex flex-col @container h-screen bg-black text-white font-sans">
//                             {/* Header */}
//                             <div className="flex items-center justify-between px-5 py-4">
//                                 <button onClick={() => navigate(-1)}
//                                 >
//                                     <X size={20} />
//                                 </button>
//                                 <h1 className="text-lg font-medium">Confirm Booking</h1>
//                                 <div className="w-5"></div>
//                             </div>

//                             {/* User and Vehicle Card */}
//                             <div className="mx-4 mb-4  bg-zinc-900 rounded-xl p-4">
//                                 <div className="flex items-center mb-3">
//                                     <div className="mr-3">
//                                         <img
//                                             src="src/assets/images/profile2.png"
//                                             alt="Profile"
//                                             className="w-12 h-12 rounded-full object-cover"
//                                         />
//                                     </div>
//                                     <div>
//                                         <div className="opacity-75">Truklynk Admin</div>
//                                         <div className="opacity-75">Chennai</div>
//                                     </div>
//                                 </div>

//                                 <div className=" bg-zinc-900 rounded-lg p-3">
//                                     <div className="flex items-center">
//                                         <img src='src/assets/images/deliveryvan.png' className='text-white w-6 h-6' />
//                                         <span className="font-medium pl-2">Tata Altimus</span>
//                                     </div>
//                                     <div className="flex items-center mt-2 text-sm text-gray-400">
//                                         <Archive className='text-white w-6 h-6 ' />
//                                         <span className='pl-2'>50 orders</span>
//                                         <div className="flex items-center ml-2">
//                                             <div className="flex">
//                                                 {[...Array(5)].map((_, i) => (
//                                                     <svg key={i} className={`w-3 h-3 ${i < 4 ? "text-yellow-400" : "text-gray-500"}`} fill="currentColor" viewBox="0 0 20 20">
//                                                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                                                     </svg>
//                                                 ))}
//                                             </div>
//                                             <span className="ml-1">19 Ratings</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Order Details Card */}
//                             <div className="mx-4 mb-4 bg-zinc-900 rounded-xl">
//                                 <div className="p-4">
//                                     <div className="text-base font-medium mb-3">Address of Order</div>

//                                     {/* Pickup Location */}
//                                     <div className="flex items-center mb-3">
//                                         <div className="mr-3">
//                                             <div className="w-6 h-6 rounded-full  bg-zinc-900 flex items-center justify-center">
//                                                 <MapPin size={14} className="text-white" />
//                                             </div>
//                                         </div>
//                                         <div className="flex-1 py-3 px-4 bg-zinc-800 rounded-lg">
//                                             Andheri west
//                                         </div>
//                                     </div>

//                                     {/* Delivery Location */}
//                                     <div className="flex items-center">
//                                         <div className="mr-3">
//                                             <div className="w-6 h-6 rounded-full  bg-zinc-900 flex items-center justify-center">
//                                                 <MapPin size={14} className="text-red-600" />
//                                             </div>
//                                         </div>
//                                         <div className="flex-1 py-3 px-4 bg-zinc-800 rounded-lg">
//                                             Sawantipada
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="border-t border-gray-800"></div>

//                                 {/* Contact Info */}
//                                 <div className="p-4 flex items-center justify-between">
//                                     <div className="flex items-center">
//                                         <Phone size={16} className="mr-2 text-gray-400" />
//                                         <div>
//                                             <span>Push Puttichai, </span>
//                                             <span className="text-gray-400">+91 9163636121</span>
//                                         </div>
//                                     </div>
//                                     <ChevronRight size={18} className="text-gray-400" />
//                                 </div>

//                                 <div className="border-t border-gray-800"></div>

//                                 {/* Time Info */}
//                                 <div className="p-4 flex items-center justify-between">
//                                     <div className="flex items-center">
//                                         <Calendar size={16} className="mr-2 text-gray-400" />
//                                         <span>8th June, 12:30 p.m.</span>
//                                     </div>
//                                     <ChevronRight size={18} className="text-gray-400" />
//                                 </div>

//                                 <div className="border-t border-gray-800"></div>

//                                 {/* Message */}
//                                 <div className="p-4 flex items-center justify-between">
//                                     <div className="flex items-center">
//                                         <MessageSquare size={16} className="mr-2 text-gray-400" />
//                                         <span className="text-sm">Hopefully you will deliver to the delivery location on time and safely.</span>
//                                     </div>
//                                     <ChevronRight size={18} className="text-gray-400" />
//                                 </div>
//                             </div>

//                             {/* Total Cost */}
//                             <div className="mx-4  bg-zinc-900 rounded-xl p-4 flex justify-between items-center">
//                                 <div>
//                                     <div className="font-medium">Total cost</div>
//                                     <div className="text-xs text-gray-400">(Incl. taxes, charges & platform fee)</div>
//                                 </div>
//                                 <div className="flex items-center">
//                                     <span className="font-bold text-lg">Rs. 12400</span>
//                                     <ChevronRight size={18} className="ml-2 text-gray-400" />
//                                 </div>
//                             </div>

//                             {/* Payment Section */}
//                             <div className="mt-10 px-4 pb-4 ">
//                                 <div className="flex justify-between items-center mb-3">
//                                     <button
//                                         className="flex items-center text-white  px-3 py-2"
//                                         onClick={() => setPaymentExpanded(!paymentExpanded)}
//                                     >
//                                         <Select name={'Payments'} options={payments}
//                                             className='text-text '>
//                                             PAY USING
//                                         </Select>
//                                     </button>
//                                 </div>

//                                 <button className="w-full bg-white text-black font-medium py-3 rounded-lg">
//                                     PAY NOW
//                                 </button>
//                             </div>
//                             <div className="bg-black p-5 flex justify-between items-center border-t border-gray-900">
//                                 <Button
//                                     onClick={() => navigate(-1)}
//                                     className="px-8 py-3 bg-transparent hover:bg-gray-900 text-white border border-gray-700 rounded-full flex items-center transition-colors focus:outline-none"
//                                 >
//                                     <ArrowLeft className="w-4 h-4 mr-2" />
//                                     BACK
//                                 </Button>
//                                 {/* <Button
//                                     className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center transition-colors focus:outline-none"
//                                 >
//                                     NEXT
//                                     <ArrowRight className="w-4 h-4 ml-2" />
//                                 </Button> */}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </FormProvider>
//         </>
//     )
// }












import { useState, useEffect } from 'react';
import { ChevronRight, MapPin, Phone, Calendar, MessageSquare, X, ChevronDown, Archive, ArrowLeft, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/form/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import { Select } from '@/components/ui/form/Select';
import { FormProvider, useForm } from 'react-hook-form';
import { post, put } from '@/services/api/apiService';

// Define TypeScript interfaces for the resultAction data structure
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

interface NearbyVehicle {
    vehicle_sno: number;
    distance_km: number;
    lat: string;
    lng: string;
    heading: string;
    vehicle_name: string;
    vehicle_number: string;
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
    nearby_vehicles: NearbyVehicle[];
}

interface ResultActionData {
    json: Array<{
        price: number | null;
        service_provider_list: ServiceProvider[];
    }>;
    isSuccess: boolean;
}

export default function ConformBooking() {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedProvider: any = location.state?.selectedProvider as ResultActionData;
    const [paymentExpanded, setPaymentExpanded] = useState(false);
    const [serviceProvider, setServiceProvider]: any = useState<ServiceProvider | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const payments = [
        { value: "payment_using", label: "PAY USING" },
        { value: "google_pay", label: "Google Pay" },
        { value: "phonepe", label: "PhonePe" },
        { value: "paytm", label: "Paytm" },
        { value: "credit_card", label: "Credit Card" },
        { value: "debit_card", label: "Debit Card" },
        { value: "upi", label: "UPI" },
        { value: "cash", label: "Cash on Delivery" }
    ];

    const methods = useForm({
        defaultValues: {
            search: '',
        }
    });

    // Function to handle payment submission
    const handlePayment = async () => {
        if (!serviceProvider) return;

        // Check if nearby vehicles are available
        if (!serviceProvider.nearby_vehicles || serviceProvider.nearby_vehicles.length === 0) {
            setError("Vehicle not available now already assigned");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get vehicle_sno and vehicle_number from the first nearby vehicle
            const nearbyVehicle: any = serviceProvider.nearby_vehicles[0];

            // Prepare the payload for the API call
            const payload = {
                service_booking_sno: serviceProvider.bookingDetails.service_booking_sno,
                service_provider_sno: serviceProvider.service_provider_sno,
                vehicle_sno: nearbyVehicle.vehicle_sno, // Use vehicle_sno from nearby_vehicles
                user_profile_sno: serviceProvider.user_profile_sno,
                driver_user_profile_sno: null, // This is null in your example
                price: serviceProvider.price,
                updated_on: new Date().toISOString().replace('T', ' ').substring(0, 23), // Format: "2025-04-24 13:34:42.336401"
                registering_type: "Individual"
            };

            // Make the API call
            const response = await put<any>('service/quotation', payload);

            // Handle successful response
            console.log('Payment successful:', response);
            setPaymentSuccess(true);

            // Navigate to success page or show success message
            setTimeout(() => {
                navigate('/orderdetails', {
                    state: {
                        bookingDetails: serviceProvider.bookingDetails,
                        vehicleNumber: nearbyVehicle.vehicle_number
                    }
                });
            }, 1500);

        } catch (err: any) {
            // Handle error
            console.error('Payment failed:', err);
            setError(err.message || 'Payment failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Format date from ISO string to readable format
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    };

    // Extract notes from JSON string
    const extractNotes = (notesJson: string) => {
        try {
            const parsed = JSON.parse(notesJson);
            return parsed.notes || "";
        } catch (e) {
            return notesJson;
        }
    };

    // Set the service provider data when resultAction changes
    useEffect(() => {
        if (selectedProvider) {
            setServiceProvider(selectedProvider as unknown as ServiceProvider);
        }
    }, [selectedProvider]);

    // If no service provider data is available, show loading or error message
    if (!serviceProvider) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <div className="text-center">
                    <h2 className="text-xl mb-4">Loading booking details...</h2>
                    <Button
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 bg-transparent hover:bg-gray-900 text-white border border-gray-700 rounded-full flex items-center transition-colors focus:outline-none"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        BACK
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <FormProvider {...methods}>
                <div className='bg-black'>
                    <div className="max-w-4xl mx-auto px-4 py-6">
                        <div className="flex flex-col @container h-screen bg-black text-white font-sans">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4">
                                <button onClick={() => navigate(-1)}>
                                    <X size={20} />
                                </button>
                                <h1 className="text-lg font-medium">Confirm Booking</h1>
                                <div className="w-5"></div>
                            </div>

                            {/* User and Vehicle Card */}
                            <div className="mx-4 mb-4 bg-zinc-900 rounded-xl p-4">
                                <div className="flex items-center mb-3">
                                    <div className="mr-3">
                                        <img
                                            src="assets/images/profile2.png"
                                            alt="Profile"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="opacity-75">{serviceProvider.service_provider_name}</div>
                                        <div className="opacity-75">{serviceProvider.city}</div>
                                    </div>
                                </div>

                                <div className="bg-zinc-900 rounded-lg p-3">
                                    <div className="flex items-center">
                                        <img src='assets/images/deliveryvan.png' className='text-white w-6 h-6' />
                                        <span className="font-medium pl-2">{serviceProvider.bookingDetails.vehicleName}</span>
                                    </div>
                                    {serviceProvider.nearby_vehicles && serviceProvider.nearby_vehicles.length > 0 && (
                                        <div className="flex items-center mt-1 text-sm text-white">
                                            <span className="pl-2">Vehicle Number: {serviceProvider.nearby_vehicles[0].vehicle_number}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center mt-2 text-sm text-gray-400">
                                        <Archive className='text-white w-6 h-6' />
                                        <span className='pl-2'>{serviceProvider.ratings.totalOrders} orders</span>
                                        <div className="flex items-center ml-2">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => {
                                                    const rating = Math.round(serviceProvider.ratings.overall_rating);
                                                    return (
                                                        <svg key={i} className={`w-3 h-3 ${i < rating ? "text-yellow-400" : "text-gray-500"}`} fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    );
                                                })}
                                            </div>
                                            <span className="ml-1">{serviceProvider.ratings.overall_rating > 0 ? `${serviceProvider.ratings.overall_rating} Ratings` : 'No Ratings'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Details Card */}
                            <div className="mx-4 mb-4 bg-zinc-900 rounded-xl">
                                <div className="p-4">
                                    <div className="text-base font-medium mb-3">Address of Order</div>

                                    {/* Pickup Location */}
                                    <div className="flex items-center mb-3">
                                        <div className="mr-3">
                                            <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center">
                                                <MapPin size={14} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 py-3 px-4 bg-zinc-800 rounded-lg">
                                            {serviceProvider.bookingDetails.pickup_location.address}
                                        </div>
                                    </div>

                                    {/* Delivery Location */}
                                    <div className="flex items-center">
                                        <div className="mr-3">
                                            <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center">
                                                <MapPin size={14} className="text-red-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1 py-3 px-4 bg-zinc-800 rounded-lg">
                                            {serviceProvider.bookingDetails.drop_location.address}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-800"></div>

                                {/* Contact Info */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Phone size={16} className="mr-2 text-gray-400" />
                                        <div>
                                            <span>{serviceProvider.driver_name || serviceProvider.service_provider_name}, </span>
                                            <span className="text-gray-400">{serviceProvider.mobileNo || 'No contact number'}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-400" />
                                </div>

                                <div className="border-t border-gray-800"></div>

                                {/* Time Info */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Calendar size={16} className="mr-2 text-gray-400" />
                                        <span>{formatDate(serviceProvider.bookingDetails.booking_time)}</span>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-400" />
                                </div>

                                <div className="border-t border-gray-800"></div>

                                {/* Message */}
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <MessageSquare size={16} className="mr-2 text-gray-400" />
                                        <span className="text-sm">{extractNotes(serviceProvider.bookingDetails.notes) || 'No additional notes'}</span>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-400" />
                                </div>
                            </div>

                            {/* Total Cost */}
                            <div className="mx-4 bg-zinc-900 rounded-xl p-4 flex justify-between items-center">
                                <div>
                                    <div className="font-medium">Total cost</div>
                                    <div className="text-xs text-gray-400">(Incl. taxes, charges & platform fee)</div>
                                </div>
                                <div className="flex items-center">
                                    <span className="font-bold text-lg">Rs. {serviceProvider.price.toLocaleString()}</span>
                                    <ChevronRight size={18} className="ml-2 text-gray-400" />
                                </div>
                            </div>

                            {/* Payment Section */}
                            <div className="mt-10 px-4 pb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <button
                                        className="flex items-center text-white px-3 py-2"
                                        onClick={() => setPaymentExpanded(!paymentExpanded)}
                                    >
                                        <Select name={'Payments'} options={payments}
                                            className='text-text'>
                                            PAY USING
                                        </Select>
                                    </button>
                                </div>

                                <button
                                    onClick={handlePayment}
                                    disabled={isLoading || paymentSuccess}
                                    className={`w-full font-medium py-3 rounded-lg flex items-center justify-center ${paymentSuccess
                                        ? 'bg-green-500 text-white'
                                        : isLoading
                                            ? 'bg-gray-400 text-gray-700'
                                            : 'bg-white text-black hover:bg-gray-100'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            PROCESSING...
                                        </>
                                    ) : paymentSuccess ? (
                                        <>
                                            <svg className="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            PAYMENT SUCCESSFUL
                                        </>
                                    ) : (
                                        'PAY NOW'
                                    )}
                                </button>

                                {error && (
                                    <div className="mt-2 text-red-500 text-sm text-center">
                                        {error}
                                    </div>
                                )}
                            </div>
                            <div className="bg-black p-5 flex justify-between items-center border-t border-gray-900">
                                <Button
                                    onClick={() => navigate(-1)}
                                    className="px-8 py-3 bg-transparent hover:bg-gray-900 text-white border border-gray-700 rounded-full flex items-center transition-colors focus:outline-none"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    BACK
                                </Button>
                                <Button
                                    onClick={() => navigate('/booking-success', { state: { bookingDetails: serviceProvider.bookingDetails } })}
                                    disabled={!paymentSuccess}
                                    className={`px-8 py-3 rounded-full flex items-center transition-colors focus:outline-none ${paymentSuccess
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    NEXT
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </FormProvider>
        </>
    );
}