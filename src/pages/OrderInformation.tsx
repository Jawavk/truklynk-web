import { useState } from 'react';
import { MapPin, Calendar, Navigation, Clock, CheckCircle, User, Phone, ChevronRight, ArrowRight, ArrowLeft, Truck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { createorder } from '@/store/slice/orderSlice';
import { useToast } from '@/context/ToastContext';


interface CreateOrderResponse {
    searchserviceproviderschedule?: Array<{
      isNoResult?: boolean;
      service_booking_id?: string;
      [key: string]: any;  // For any additional properties
    }>;
  }

export default function OrderInformation() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { showToast } = useToast();

    const location = useLocation();
    const {
        selectedUnit,
        formData,
        contactInfo,
        pickupDetails,
        dropDetails,
        distance,
        selectedDate,
        selectedVehicleId,
        notesData,
        selectedUser

    } = location.state || {};

    const [orderDetails, setOrderDetails] = useState({
        ...formData,
        weight_type_sno: selectedUnit?.sno || null,
        contact_info: contactInfo || {},
        pickup_location: pickupDetails || {},
        drop_location: dropDetails || {},
        distance: distance || 0,
        booking_time: selectedDate || '',
        notes: notesData || '',
        sub_category_sno: selectedVehicleId,
        booking_person: selectedUser.user_profile_sno

    });

// Define the expected response type
interface SearchServiceProviderResponse {
    json?: {
      searchserviceproviderschedule: {
        isNoResult?: boolean;
        service_booking_id?: number;
      }[];
    }[];
    isSuccess?: boolean;
  }
  
  const handleCreateOrder = () => {
    const now = new Date();
    const createdOn = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}000`;
    console.log('orderDetails:', orderDetails);
    const orderData = {
      booking_type: 'Schedule',
      booking_person: selectedUser.user_profile_sno,
      sub_category_sno: selectedVehicleId,
      landmark: '',
      contact_info: {
        name: selectedUser.name,
        phone: selectedUser.phoneNumber,
      },
      price: 0,
      pickup_location: {
        address: orderDetails.pickup_location?.address,
        latlng: {
          latitude: orderDetails.pickup_location?.lat,
          longitude: orderDetails.pickup_location?.lng,
        },
        city: orderDetails.pickup_location?.city,
        state: orderDetails.pickup_location?.state,
        country: orderDetails.pickup_location?.country,
        landmark: '',
        contact_info: '',
      },
      drop_location: {
        address: orderDetails.drop_location?.address,
        latlng: {
          latitude: orderDetails.drop_location?.lat,
          longitude: orderDetails.drop_location?.lng,
        },
        city: orderDetails.drop_location?.city,
        state: orderDetails.drop_location?.state,
        country: orderDetails.drop_location?.country,
        landmark: '',
        contact_info: '',
      },
      types_of_goods: formData.item,
      distance: distance,
      lat: orderDetails.pickup_location?.lat,
      lng: orderDetails.pickup_location?.lng,
      name: orderDetails.pickup_location?.name,
      booking_time: orderDetails.booking_time || createdOn, // Fallback to createdOn
      category_name: 'Long Trip',
      weight_type_sno: orderDetails.weightTypeSno,
      weight_of_goods: orderDetails.weight,
      created_on: createdOn,
      notes: orderDetails.notes,
    };
    console.log('orderData:', orderData);
    dispatch(createorder(orderData))
      .unwrap()
      .then((res) => {
        const typedRes = res as SearchServiceProviderResponse; // Type assertion
        console.log('Full response:', typedRes);
        const noResult = typedRes?.json?.[0]?.searchserviceproviderschedule?.[0]?.isNoResult ?? false;
        console.log('noResult:', noResult);
        if (noResult) {
          showToast({
            message: 'Service provider not found',
            type: 'error',
          });
          console.log('Navigating to /orders');
          navigate('/orders');
          return;
        } else {
          const serviceBookingId = typedRes?.json?.[0]?.searchserviceproviderschedule?.[0]?.service_booking_id;
          console.log('Order created successfully:', typedRes, 'serviceBookingId:', serviceBookingId);
          navigate('/quoteconformation', {
            state: { serviceBookingId, createdOn },
          });
        }
      })
      .catch((err: unknown) => {
        console.error('Error creating order:', err);
        showToast({
          message: 'Something went wrong. Please try again',
          type: 'error',
        });
        console.log('Navigating to /orders due to error');
        navigate('/orders');
      });
  };

    console.log(selectedUnit)
    console.log(selectedDate)
    console.log(formData)
    console.log(pickupDetails)
    console.log(dropDetails)
    console.log(distance)
    console.log(orderDetails.notes)
    console.log(selectedVehicleId)

    return (
        <div className='bg-black min-h-screen'>
            <div className="max-w-4xl mx-auto bg-black text-gray-100  shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-800 to-red-900 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-white">Order Confirmation</h1>
                        </div>

                    </div>
                </div>

                {/* Delivery Overview */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center mb-4">
                        <Truck size={20} className="text-red-500 mr-2" />
                        <h2 className="text-lg font-semibold">Delivery Overview</h2>
                    </div>

                    <div className="flex flex-col space-y-4 mt-4">
                        <div className="flex items-start">
                            <Calendar className="text-red-500 mr-3 mt-1" size={18} />
                            <div>
                                <p className="text-gray-400 text-sm">Date & Time</p>
                                <p className="text-white">{selectedDate}</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <Navigation className="text-red-500 mr-3 mt-1" size={18} />
                            <div>
                                <p className="text-gray-400 text-sm">Distance</p>
                                <p className="text-white">{distance} </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Navigation className="text-red-500 mr-3 mt-1" size={18} />
                            <div>
                                <p className="text-gray-400 text-sm">Selected Unit</p>
                                <p className="text-white">{selectedUnit} </p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Location Information */}
                <div className="p-6 border-b border-gray-800">
                    <div className="space-y-5 relative">
                        {/* Pickup Location */}
                        <div className="flex">
                            <div className="mr-3 flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center">
                                    <MapPin className="text-white z-10" />
                                </div>
                                <div className="h-16 border-l-2 mt-2 border-dashed border-gray-700 " />
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm">Pickup Location</p>
                                <p className="text-white font-medium">{pickupDetails.address}</p>
                                <p className="text-gray-300 text-sm">
                                    {pickupDetails.city}, {pickupDetails.state}, {pickupDetails.country}
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    {pickupDetails.lat}, {pickupDetails.lng}
                                </p>
                            </div>
                        </div>

                        {/* Delivery Location */}
                        <div className="flex">
                            <div className="mr-3 flex flex-col items-center">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    <MapPin className="text-red-600 z-10" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm">Delivery Location</p>
                                <p className="text-white font-medium">{dropDetails.address}</p>
                                <p className="text-gray-300 text-sm">
                                    {dropDetails.city}, {dropDetails.state}, {dropDetails.country}
                                </p>
                                <p className="text-gray-400 text-xs mt-1">
                                    {dropDetails.lat}, {dropDetails.lng}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Customer Information */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center mb-4">
                        <User size={20} className="text-red-500 mr-2" />
                        <h2 className="text-lg font-semibold">Customer Details</h2>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-white font-medium">{selectedUser.name}</p>
                                <div className="flex items-center mt-1">
                                    <Phone size={14} className="text-red-500 mr-2" />
                                    <p className="text-gray-300">{selectedUser.phoneNumber}</p>
                                </div>
                            </div>
                            <button className="text-red-500 hover:text-red-400 flex items-center">
                                <span className="text-sm">Contact</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>


                {/* Action Buttons */}
                <div className="p-6 flex space-x-3">
                    <button className="bg-transparent border border-red-600 text-red-500 hover:bg-red-900 hover:bg-opacity-20 rounded-lg py-3 px-4 flex-1 font-medium transition-colors">
                        Cancel Order
                    </button>
                    <button className="bg-red-600 hover:bg-red-700 text-white rounded-lg py-3 px-4 flex-1 font-medium transition-colors"
                        onClick={handleCreateOrder}
                    >
                        Confirm
                    </button>
                </div>
            </div>
            <div className="bg-black p-5 flex justify-between items-center border-t border-gray-900">
                <button
                    onClick={() => navigate(-1)}
                    className="px-8 py-3 bg-transparent hover:bg-gray-900 text-white border border-gray-700 rounded-full flex items-center transition-colors focus:outline-none"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    BACK
                </button>
            </div>
        </div>
    );
}