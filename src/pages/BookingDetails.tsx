import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store/store';
import { assignDriverStatus, fetchBookings, updateQuotationStatus } from '@/store/slice/bookingSlice';
import { fetchDrivers } from '@/store/slice/driverSlice';
import Button from '@/components/ui/form/Button';
import { Modal } from '@/components/ui/layout/Modal';
import { AlertCircle, Check, Phone, X, Calendar, Truck, RefreshCw, Search, Package } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Input } from '@/components/ui/form/Input';
import { FormProvider, useForm } from 'react-hook-form';
import { fetchServiceBooking } from '@/store/slice/cancelReasonSlice';

interface Driver {
  driver_sno: number;
  driver_name: string;
  driver_mobile_number: string;
  service_providers_sno: number;
}

interface DriversResponse {
  getdrivers: Driver[];
}

const NoBookingsAvailable = ({ activeFilter }) => {
  const isOngoing = activeFilter === 'ongoing';
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Attractive SVG Illustration */}
      <div className="relative mb-8">
        <svg 
          width="200" 
          height="200" 
          viewBox="0 0 200 200" 
          className="drop-shadow-2xl"
        >
          {/* Background Circle */}
          <circle 
            cx="100" 
            cy="100" 
            r="90" 
            fill="url(#bgGradient)" 
            className="animate-pulse"
          />
          
          {/* Truck/Vehicle Illustration */}
          {isOngoing ? (
            <g>
              {/* Truck Body */}
              <rect x="40" y="85" width="60" height="30" rx="8" fill="#4F46E5" className="animate-bounce" style={{animationDelay: '0.5s'}} />
              <rect x="100" y="75" width="40" height="40" rx="6" fill="#6366F1" />
              
              {/* Wheels */}
              <circle cx="60" cy="125" r="12" fill="#374151" />
              <circle cx="60" cy="125" r="8" fill="#6B7280" />
              <circle cx="120" cy="125" r="12" fill="#374151" />
              <circle cx="120" cy="125" r="8" fill="#6B7280" />
              
              {/* Windows */}
              <rect x="105" y="80" width="15" height="12" rx="2" fill="#E5E7EB" opacity="0.8" />
              <rect x="122" y="80" width="15" height="12" rx="2" fill="#E5E7EB" opacity="0.8" />
              
              {/* Road lines */}
              <rect x="20" y="140" width="15" height="3" rx="1" fill="#6B7280" className="animate-pulse" />
              <rect x="50" y="140" width="15" height="3" rx="1" fill="#6B7280" className="animate-pulse" style={{animationDelay: '0.2s'}} />
              <rect x="80" y="140" width="15" height="3" rx="1" fill="#6B7280" className="animate-pulse" style={{animationDelay: '0.4s'}} />
              <rect x="110" y="140" width="15" height="3" rx="1" fill="#6B7280" className="animate-pulse" style={{animationDelay: '0.6s'}} />
              <rect x="140" y="140" width="15" height="3" rx="1" fill="#6B7280" className="animate-pulse" style={{animationDelay: '0.8s'}} />
              <rect x="170" y="140" width="15" height="3" rx="1" fill="#6B7280" className="animate-pulse" style={{animationDelay: '1s'}} />
            </g>
          ) : (
            <g>
              {/* History/Document Icon */}
              <rect x="60" y="60" width="80" height="100" rx="8" fill="#4F46E5" />
              <rect x="65" y="65" width="70" height="90" rx="4" fill="#6366F1" />
              
              {/* Document lines */}
              <rect x="75" y="80" width="40" height="3" rx="1" fill="#E5E7EB" opacity="0.7" />
              <rect x="75" y="90" width="50" height="3" rx="1" fill="#E5E7EB" opacity="0.7" />
              <rect x="75" y="100" width="35" height="3" rx="1" fill="#E5E7EB" opacity="0.7" />
              <rect x="75" y="110" width="45" height="3" rx="1" fill="#E5E7EB" opacity="0.7" />
              <rect x="75" y="120" width="30" height="3" rx="1" fill="#E5E7EB" opacity="0.7" />
              
              {/* Clock overlay */}
              <circle cx="130" cy="90" r="15" fill="#10B981" />
              <path d="M130 82 L130 90 L135 95" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          )}
          
          {/* Floating elements */}
          <circle cx="45" cy="45" r="4" fill="#06B6D4" opacity="0.6" className="animate-ping" />
          <circle cx="155" cy="55" r="3" fill="#8B5CF6" opacity="0.6" className="animate-ping" style={{animationDelay: '0.5s'}} />
          <circle cx="40" cy="160" r="2" fill="#F59E0B" opacity="0.6" className="animate-ping" style={{animationDelay: '1s'}} />
          <circle cx="160" cy="150" r="3" fill="#EF4444" opacity="0.6" className="animate-ping" style={{animationDelay: '1.5s'}} />
          
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1F2937" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#374151" stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto space-y-6">
        <div className="space-y-3">
          <h3 className="text-3xl font-bold text-white">
            {isOngoing ? 'No Ongoing Bookings' : 'No Previous Bookings'}
          </h3>
          
          <p className="text-gray-400 text-lg leading-relaxed">
            {isOngoing 
              ? "You don't have any active bookings at the moment. New booking requests will appear here when customers make orders."
              : "Your completed and cancelled bookings history will be displayed here once you complete some deliveries."
            }
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isOngoing ? 'bg-blue-500' : 'bg-gray-500'} animate-pulse`}></div>
          <span className="text-gray-500 font-medium">
            {isOngoing ? 'Waiting for new bookings...' : 'No booking history yet'}
          </span>
        </div>
      </div>
    </div>
  );
};


export default function BookingDetails() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { ServiceProviderSno, userProfileSno } = location.state;

  const { data: BookingData, loading } = useSelector((state: RootState) => state.booking);
  const [activeFilter, setActiveFilter] = useState<'ongoing' | 'previous'>('ongoing');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  // Use an object to store quote values for each booking
  const [quotes, setQuotes] = useState<Record<number, string>>({});
  const [submittedQuotes, setSubmittedQuotes] = useState<Record<number, { submitted: boolean; amount: number }>>({});
  const navigate = useNavigate();
  const driversState = useSelector((state: RootState) => state.drivers);
  const drivers: Driver[] = driversState.data?.flatMap((driverData: any) => driverData.getdrivers || []) || [];
  const driversLoading = driversState.loading;
  const { showToast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState({
    booking_person: null,
    service_booking_sno: null,
  });

  const filteredDrivers = React.useMemo(() => {
    console.log('ServiceProviderSno:', ServiceProviderSno, typeof ServiceProviderSno);
    console.log('Drivers:', drivers);
    console.log('First driver service_providers_sno:', drivers[0]?.service_providers_sno, typeof drivers[0]?.service_providers_sno);
    const filtered = drivers.filter(driver => driver.service_providers_sno === ServiceProviderSno);
    console.log('Filtered Drivers:', filtered);
    return filtered;
  }, [drivers, ServiceProviderSno]);

  useEffect(() => {
    if (ServiceProviderSno) {
      dispatch(fetchBookings(ServiceProviderSno));
    }
  }, [dispatch, ServiceProviderSno]);

  useEffect(() => {
    if (BookingData?.json?.[0]?.getnearbyservicebookings) {
      const newSubmittedQuotes: Record<number, { submitted: boolean; amount: number }> = {};

      BookingData.json[0].getnearbyservicebookings.forEach(booking => {
        if (booking.price && booking.booking_status_cd === 72) {
          newSubmittedQuotes[booking.service_booking_sno] = {
            submitted: true,
            amount: booking.price,
          };
        }
      });

      setSubmittedQuotes(newSubmittedQuotes);
    }
  }, [BookingData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} - ${date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })}`;
  };

  const calculateTimeLeft = (bookingTime: string) => {
    return '35 mins left'; // Simplified for example
  };

  const getStatusText = (statusCode: number) => {
    switch (statusCode) {
      case 72:
        return { heading: 'Waiting for Approval', status: 'Pending' };
      case 73:
        return { heading: 'Waiting for Approval', status: 'User approved' };
      case 77:
        return { heading: 'In Progress', status: 'Running' };
      case 78:
        return { heading: 'Delivery', status: 'Completed' };
      case 75:
        return { heading: 'Delivery', status: 'Cancel' };
      default:
        return { heading: 'Waiting for Approval', status: 'Unknown' };
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'User approved') return 'bg-green-500';
    if (status === 'Pending') return 'bg-yellow-500';
    if (status === 'Running') return 'bg-blue-500';
    if (status === 'Completed') return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getButtonConfig = (booking: any) => {
    const statusCode = booking.booking_status_cd;
    const bookingId = booking.service_booking_sno;

    switch (statusCode) {
      case 73:
        return {
          text: 'Assign Drivers',
          bgColor: 'bg-red-600 hover:bg-red-700',
          action: () => handleAssignDriverClick(bookingId),
          showModal: true,
        };
      case 77:
        return {
          text: 'Running',
          bgColor: 'bg-green-600 hover:bg-green-700',
          action: () => console.log(`Booking ${bookingId} is running`),
          showModal: false,
        };
      case 78:
        return {
          text: 'Completed',
          bgColor: 'bg-green-600 hover:bg-green-700',
          showModal: false,
        };
      case 75:
        return {
          text: 'Cancel',
          bgColor: 'bg-green-600 hover:bg-green-700',
          showModal: false,
        };
      default:
        return {
          text: 'Enter Quote',
          bgColor: 'bg-red-600 hover:bg-red-700',
          showModal: true,
          Input: {
            placeholder: 'Enter quote amount',
            name: 'quoteAmount',
            type: 'number',
            value: quotes[booking.service_booking_sno] || '',
          },
          action: () => handleSubmitQuote(booking),
        };
    }
  };

  const handleModalClose = () => {
    setShowAssignModal(false);
    setSelectedDriverId(null);
  };

  const shouldShowQuickAssign = (statusCode: number) => {
    return statusCode === 73;
  };

  const handleAssignDriverClick = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    handleAsignDriver();
  };

  const handleAsignDriver = () => {
    if (ServiceProviderSno) {
      dispatch(fetchDrivers(ServiceProviderSno));
    }
    setShowAssignModal(true);
  };


  const handleAssignSubmit = (booking: any) => {
    if (selectedDriverId !== null && selectedBookingId !== null) {
      const payload = {
        service_provider_quotation_sno: booking.service_provider_quotation_sno,
        service_provider_sno: ServiceProviderSno,
        vehicle_sno: booking.vehicle_sno || 0,
        user_profile_sno: booking.booking_person,
        service_booking_sno: selectedBookingId,
        driver_sno: selectedDriverId,
        driver_user_profile_sno: null, // Set to null as in Flutter code
        price: booking.price || 0, // Use booking price or fallback to 0
        updated_on: new Date().toISOString(),
        quotation_status_name: 'Accepted',
      };

      dispatch(assignDriverStatus(payload))
        .unwrap()
        .then((res) => {
          console.log('Driver assigned successfully:', res);
          setShowAssignModal(false);
          setSelectedDriverId(null);
          setSelectedBookingId(null);
          // Refresh bookings
          if (ServiceProviderSno) {
            dispatch(fetchBookings(ServiceProviderSno));
          }
        })
        .catch((err) => {
          console.error('Failed to assign driver:', err);
          showToast({
            message: `Failed to assign driver: ${err?.message || err}`,
            type: 'error',
          });
        });
    }
  };

  const handleAssignDriver = (booking: any) => {

  };

  const handleButtonClick = (booking: any) => {
    const buttonConfig = getButtonConfig(booking);
    setSelectedBookingId(booking.service_booking_sno);

    if (buttonConfig.action) {
      buttonConfig.action();
    } else if (buttonConfig.showModal) {
      handleAsignDriver();
    }
  };

  const handleSubmitQuote = (booking: any) => {
    const quoteValue = quotes[booking.service_booking_sno];
    if (!quoteValue || isNaN(Number(quoteValue))) {
      showToast({
        message: 'Please enter a valid quote amount',
        type: 'warning', // or 'error' depending on context
      });
      return;
    }

    const currentDate = new Date().toISOString();
    const payload = {
      service_provider_quotation_sno: booking.service_provider_quotation_sno,
      service_provider_sno: ServiceProviderSno,
      vehicle_sno: booking.vehicle_sno || 0,
      user_profile_sno: booking.booking_person,
      driver_user_profile_sno: null,
      price: Number(quoteValue),
      updated_on: currentDate,
      quotation_status_name: 'Accepted',
    };
    console.log(payload)
    dispatch(updateQuotationStatus(payload))
      .unwrap()
      .then((res) => {
        console.log('Quotation updated successfully:', res);
        setSubmittedQuotes(prev => ({
          ...prev,
          [booking.service_booking_sno]: {
            submitted: true,
            amount: Number(quoteValue),
          },
        }));
        booking.price = Number(quoteValue);
        // Clear the quote value for this booking
        setQuotes(prev => {
          const newQuotes = { ...prev };
          delete newQuotes[booking.service_booking_sno];
          return newQuotes;
        });
        if (ServiceProviderSno) {
          dispatch(fetchBookings(ServiceProviderSno));
        }
      })
      .catch((err) => {
        console.error('Update failed:', err);
      });
  };

  const methods = useForm({
    defaultValues: {
      search: '',
    },
  });

  const handleRefresh = () => {
    if (ServiceProviderSno) {
      dispatch(fetchBookings(ServiceProviderSno));
    }
  };

  const filteredBookings = React.useMemo(() => {
    if (!BookingData || !BookingData.json || !BookingData.json[0]?.getnearbyservicebookings) {
      return [];
    }

    return BookingData.json[0].getnearbyservicebookings.filter((booking) => {
      if (activeFilter === 'ongoing') {
        return [72, 73, 77, 105].includes(booking.booking_status_cd);
      } else {
        return [75, 78].includes(booking.booking_status_cd);
      }
    });
  }, [BookingData, activeFilter]);

  const handleCancelClick = (booking_person: any, service_booking_sno: any) => {
    setSelectedBooking({ booking_person, service_booking_sno });
    const role = 'Service Provider';
    navigate('/CancelOptions', {
      state: {
        role,
        booking_person,
        service_booking_sno,
      },
    });
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-3xl font-medium mb-6">Booking Details</h1>

        <div className="flex mb-6 space-x-4">
          <Button
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeFilter === 'ongoing' ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            onClick={() => setActiveFilter('ongoing')}
          >
            Ongoing
          </Button>
          <Button
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${activeFilter === 'previous' ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            onClick={() => setActiveFilter('previous')}
          >
            Previous
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <p>Loading bookings...</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookings.map((booking, index) => {
              const { heading, status } = getStatusText(booking.booking_status_cd);
              const buttonConfig = getButtonConfig(booking);

              return (
                <div key={index} className="bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                  <div className="flex justify-end items-center p-3 bg-gray-800 text-gray-400 text-sm">
                    <span className="text-green-400">{Math.round(booking.distance_from_pickup_to_drop)} kms</span>
                  </div>

                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="font-medium">{booking.pickup_location_address.split(',')[0]}</div>
                    <div className="text-gray-400 mx-2">→</div>
                    <div className="font-medium">{booking.drop_location_address.split(',')[0]}</div>
                  </div>

                  <div className="px-4 py-2 flex items-center text-sm text-gray-400">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{formatDate(booking.booking_time)}</span>
                  </div>

                  <div className="px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center text-sm">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>{booking.types_of_goods}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      <span>{booking.weight_of_goods} {booking?.weight_type}</span>
                    </div>
                  </div>

                  <div className="px-4 py-3 flex justify-between items-center border-t border-gray-800">
                    <div className="flex flex-col">
                      <div className="text-xs text-gray-400">{heading}</div>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 ${getStatusColor(status)} rounded-full mr-2`}></div>
                        <span className="text-xs">{status}</span>
                      </div>
                    </div>
                    <div className="bg-green-800 text-green-400 px-3 py-1 rounded font-medium text-sm">
                      My Quote ₹
                      {booking.price
                        ? booking.price.toLocaleString()
                        : submittedQuotes[booking?.service_booking_sno]?.submitted
                          ? submittedQuotes[booking?.service_booking_sno]?.amount.toLocaleString()
                          : '0'}
                    </div>
                  </div>

                  {shouldShowQuickAssign(booking.booking_status_cd) && (
                    <div className="px-4 py-3 flex justify-between items-center border-t border-gray-800">
                      <div className="text-sm">Quickly assign driver</div>
                      <div className="text-xs text-green-500">{calculateTimeLeft(booking.booking_time)}</div>
                      <Button
                        className={`px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out font-semibold text-sm tracking-wide ${buttonConfig.bgColor} text-white`}
                        onClick={() => handleAssignDriverClick(booking.service_booking_sno)}
                      >
                        {buttonConfig.text}
                      </Button>
                    </div>
                  )}

                  {buttonConfig.Input && !submittedQuotes[booking.service_booking_sno]?.submitted && (
                    <div className="mt-4">
                      <label className="block text-md font-medium text-gray-300 mb-2">Enter Quotes</label>
                      <div className="w-full">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <span className="text-gray-400 pb-4">₹</span>
                          </div>
                          <Input
                            type="number"
                            placeholder={buttonConfig.Input.placeholder}
                            className="w-full h-12 bg-black mb-4 p-3 border border-gray-800 rounded-full pl-10 pr-5 py-3 text-white text-sm"
                            name={buttonConfig.Input.name}
                            value={quotes[booking.service_booking_sno] || ''}
                            onChange={(e) =>
                              setQuotes(prev => ({
                                ...prev,
                                [booking.service_booking_sno]: e.target.value,
                              }))
                            }
                            min="0"
                            step="100"
                          />
                        </div>
                      </div>

                      <div className="flex justify-center space-x-20 p-2 items-center">
                        {!submittedQuotes[booking.service_booking_sno]?.submitted && (
                          <Button
                            className={`px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out font-semibold text-sm tracking-wide ${buttonConfig.bgColor} text-white`}
                            onClick={() => handleSubmitQuote(booking)}
                          >
                            {buttonConfig.text}
                          </Button>
                        )}
                        <Button
                          className="bg-gray-600 hover:bg-gray-700 text-white min-w-[120px] px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out font-semibold text-sm tracking-wide"
                          onClick={() => handleCancelClick(booking?.booking_person, booking.service_booking_sno)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center">
 <NoBookingsAvailable 
            activeFilter={activeFilter}
          />       
          </div>
        )}

        <Modal
          className="w-[700px] bg-gray-900 rounded-2xl shadow-2xl border border-gray-800"
          isOpen={showAssignModal}
          onClose={handleModalClose}
        >
          <div className="flex flex-col text-white max-h-[90vh]">
            <div className="flex justify-between items-center px-8 py-5 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 flex-shrink-0">
              <h2 className="text-xl font-semibold text-white">Assign Driver</h2>
            </div>

            <div className="px-8 py-6 overflow-y-auto flex-grow">
              {driversLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4" />
                  <p className="text-gray-400 font-medium">Loading available drivers...</p>
                </div>
              ) : filteredDrivers && filteredDrivers.length > 0 ? (

                <div className="grid grid-cols-2 gap-4">
                  {filteredDrivers.map((driver) => (
                    <div
                      key={driver.driver_sno}
                      onClick={() => setSelectedDriverId(driver.driver_sno)}
                      className={`flex items-center p-4 rounded-xl cursor-pointer border transition-all duration-200
                        ${selectedDriverId === driver.driver_sno
                          ? 'bg-green-900/30 border-green-500 shadow-lg'
                          : 'bg-gray-800/80 hover:bg-gray-700/90 border-gray-700 hover:border-gray-600'
                        }`}
                    >
                      <div
                        className={`w-6 h-6 mr-3 flex items-center justify-center rounded-full border-2 transition-colors
                          ${selectedDriverId === driver.driver_sno
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-500'
                          }`}
                      >
                        {selectedDriverId === driver.driver_sno && <Check className="w-4 h-4 text-white" />}
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <div className="font-medium text-base truncate">{driver.driver_name}</div>
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <Phone className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                          <span className="truncate">{driver.driver_mobile_number}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                    <AlertCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-gray-300 font-medium">No drivers available for this service provider.</p>
                  <p className="text-sm text-gray-500 mt-2">Try refreshing or adding drivers first.</p>
                </div>
              )}
            </div>

            <div className="px-8 py-5 border-t border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 flex-shrink-0">
              <Button
                onClick={() => handleAssignSubmit(BookingData?.json[0]?.getnearbyservicebookings.find((b: any) => b.service_booking_sno === selectedBookingId))}
                disabled={selectedDriverId === null}
                className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-200
                  ${selectedDriverId !== null
                    ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg'
                    : 'bg-gray-700/70 cursor-not-allowed opacity-60'
                  }`}
              >
                {selectedDriverId !== null ? 'Assign Driver' : 'Select a Driver to Assign'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </FormProvider>
  );
}