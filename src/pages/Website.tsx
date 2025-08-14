import apiService from '@/services/api/apiService'; // Assuming apiService has put/patch methods
import { ArrowRight, Truck, Calendar, Clock, Package, Phone, Eye, EyeOff, X, Check, MoreVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component or can create one
import { useNavigate } from 'react-router-dom'; // Import useNavigate

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
    types_of_goods: string; // Added
    weight_of_goods: string; // Added
    created_on: string;
    status?: string;
    ignore_reason?: string;
}

interface BookingApiResponse {
    getuserbooking: Booking[];
}

export default function Website() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'process' | 'ignore'>('pending');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Assuming apiService.get returns a structure like { json: [{ getuserbooking: [...] }] }
                const response = await apiService.get('users/getbooking') as { json?: BookingApiResponse[] };
                const bookingData = response.json?.[0]?.getuserbooking || [];
                console.log("Booking Data:", bookingData);
                // Process locations to ensure city/state data
                const processedBookings = bookingData.map(booking => {
                    const processLocation = (loc: any) => {
                        if (!loc.city || loc.city.trim() === '') {
                            const addressParts = loc.address.split(',');
                            return {
                                ...loc,
                                city: addressParts[0]?.trim() || '',
                                state: loc.state || addressParts[1]?.trim() || '',
                                country: loc.country || addressParts[addressParts.length - 1]?.trim() || ''
                            };
                        }
                        return loc;
                    };
                    return {
                        ...booking,
                        pickup_location: processLocation(booking.pickup_location),
                        drop_location: processLocation(booking.drop_location),
                        // Ensure status has a default if not present from API
                        status: booking.status || 'pending'
                    };
                });
                setBookings(processedBookings);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getLocationDisplay = (location: Booking['pickup_location']) => {
        if (location.city && location.city.trim() !== '') {
            return location.city;
        }
        if (location.address) {
            const addressParts = location.address.split(',');
            const firstPart = addressParts[0]?.trim();
            return firstPart || 'Unknown Location';
        }
        return 'Unknown Location';
    };

    const getStateDisplay = (location: Booking['pickup_location']) => {
        if (location.state && location.state.trim() !== '') {
            return location.state;
        }
        if (location.address) {
            const addressParts = location.address.split(',');
            if (addressParts.length > 1) {
                return addressParts[1]?.trim() || '';
            }
        }
        return '';
    };

    const formatDateForDisplay = (dateString: string): string => {
        const date = new Date(dateString);
        const day = `${date.getDate()}`.padStart(2, '0');
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTimeForDisplay = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'in_process':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'ignored':
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getTabCount = (tab: string) => {
        return bookings.filter(booking => {
            if (tab === 'pending') {
                return !booking.status || booking.status.toLowerCase() === 'pending';
            } else if (tab === 'process') {
                return booking.status && booking.status.toLowerCase() === 'in_process';
            } else {
                return booking.status && booking.status.toLowerCase() === 'ignored';
            }
        }).length;
    };

    const handleUpdateBookingStatus = async (
        sno: number,
        newStatus: 'pending' | 'in_process' | 'ignored',
        reason: string = ''
    ) => {
        try {
            // Optimistically update UI
            setBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking.user_booking_sno === sno
                        ? { ...booking, status: newStatus, ignore_reason: reason }
                        : booking
                )
            );
            // Call your API to update the status in the database
            // Changed 'sno' to 'user_booking_sno' to match stored procedure
            await apiService.put(`users/updatebooking`, {
                user_booking_sno: sno,  // Changed this line
                status: newStatus,
                ignore_reason: reason
            });
        } catch (error) {
            console.error('Error updating booking status:', error);
            // Revert UI on error
            setBookings(prevBookings =>
                prevBookings.map(booking =>
                    booking.user_booking_sno === sno
                        ? { ...booking, status: booking.status, ignore_reason: booking.ignore_reason }
                        : booking
                )
            );
            alert('Failed to update booking status. Please try again.');
        }
    };

    // New function to handle viewing booking details and navigating
    const handleViewBooking = (booking: Booking) => {
        navigate('/neworder', {
            state: {
                initialBooking: booking, // Pass the entire booking object
                // Explicitly pass goods and weight for clarity, though they are in initialBooking
                initialTypesOfGoods: booking.types_of_goods,
                initialWeightOfGoods: booking.weight_of_goods,
            },
        });
    };

    const filteredBookings = bookings.filter(booking => {
        if (activeTab === 'pending') {
            return !booking.status || booking.status.toLowerCase() === 'pending';
        } else if (activeTab === 'process') {
            return booking.status && booking.status.toLowerCase() === 'in_process';
        } else {
            return booking.status && booking.status.toLowerCase() === 'ignored';
        }
    });

    const OrderCard = ({ order }: { order: Booking }) => {
        const [isIgnoring, setIsIgnoring] = useState(false);
        const [currentIgnoreReason, setCurrentIgnoreReason] = useState(order.ignore_reason || '');
        const [isUpdating, setIsUpdating] = useState(false);
        const [showMenu, setShowMenu] = useState(false);

        const handleIgnoreClick = () => {
            setIsIgnoring(true);
            setShowMenu(false);
        };

        const handleCancelIgnore = () => {
            setIsIgnoring(false);
            setCurrentIgnoreReason(order.ignore_reason || ''); // Reset to original reason
        };

        const handleSaveIgnore = async () => {
            setIsUpdating(true);
            await handleUpdateBookingStatus(order.user_booking_sno, 'ignored', currentIgnoreReason);
            setIsIgnoring(false);
            setIsUpdating(false);
        };

        const handleCreateNewOrder = () => {
            setShowMenu(false);
            handleViewBooking(order);
        };

        return (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden w-full border border-gray-700/50 transition-all hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transform hover:-translate-y-1 duration-300">
                {/* Status Badge and Menu */}
                <div className="px-4 pt-3 flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {order.status?.toUpperCase() || 'PENDING'}
                    </span>
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-500 text-xs">#{order.user_booking_sno}</span>
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1.5 rounded-full hover:bg-gray-700/50 transition-colors"
                            >
                                <MoreVertical className="h-4 w-4 text-gray-400" />
                            </button>
                            {showMenu && (
                                <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 py-1 w-48">
                                    <button
                                        onClick={handleCreateNewOrder}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                                    >
                                        Create New Order
                                    </button>
                                    {order.status !== 'ignored' && (
                                        <button
                                            onClick={handleIgnoreClick}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors"
                                        >
                                            Ignore Booking
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ignore Reason Display (only for ignored bookings) */}
                {order.status === 'ignored' && order.ignore_reason && !isIgnoring && (
                    <div className="mx-4 mt-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                            <EyeOff className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-red-400 text-xs font-semibold mb-1">Ignored - Reason:</p>
                                <p className="text-gray-300 text-sm">{order.ignore_reason}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Origin-Destination Section */}
                <div className="mx-4 my-4 bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-4 flex items-center justify-between border border-gray-700/30">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-xs font-medium mb-1">FROM</span>
                        <span className="text-white font-semibold text-sm">
                            {getLocationDisplay(order.pickup_location)}
                        </span>
                        <span className="text-gray-500 text-xs">
                            {getStateDisplay(order.pickup_location)}
                        </span>
                    </div>
                    <div className="relative flex items-center">
                        <div className="h-px w-12 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        <div className="absolute left-1/2 transform -translate-x-1/2">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-1.5 rounded-full">
                                <ArrowRight className="h-3 w-3 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-xs font-medium mb-1">TO</span>
                        <span className="text-white font-semibold text-sm">
                            {getLocationDisplay(order.drop_location)}
                        </span>
                        <span className="text-gray-500 text-xs">
                            {getStateDisplay(order.drop_location)}
                        </span>
                    </div>
                </div>
                {/* Progress Bar Section */}
                <div className="px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <div className="h-4 w-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-green-300 shadow-lg shadow-green-400/30"></div>
                            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-green-400 whitespace-nowrap font-medium">Pickup</span>
                        </div>
                        <div className="flex-1 mx-3 h-1 bg-gray-700 rounded-full relative overflow-hidden">
                            {/* This progress bar is static, you might want to make it dynamic based on actual progress */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 w-1/3 rounded-full"></div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
                                <div className="p-1.5 bg-gray-800 rounded-full border-2 border-blue-400 shadow-lg shadow-blue-400/30">
                                    <Truck className="h-3 w-3 text-blue-400" />
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="h-4 w-4 rounded-full border-2 border-gray-500 bg-gray-800"></div>
                            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap font-medium">Delivery</span>
                        </div>
                    </div>
                </div>
                {/* Date Time Section */}
                <div className="flex items-center justify-between px-5 py-4 bg-gray-800/60 backdrop-blur-sm mx-4 my-4 rounded-xl border border-gray-700/30">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-500/20 p-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div>
                            <span className="text-white font-semibold text-sm block">
                                {order.created_on ? formatDateForDisplay(order.created_on) : 'No Date'}
                            </span>
                            <span className="text-gray-400 text-xs">
                                {order.created_on ? formatTimeForDisplay(order.created_on) : ''}
                            </span>
                        </div>
                    </div>
                    <div className="bg-purple-500/20 p-2 rounded-lg">
                        <Clock className="h-4 w-4 text-purple-400" />
                    </div>
                </div>
                {/* Cargo Information */}
                <div className="px-4 py-4 flex justify-between items-center border-t border-gray-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="bg-orange-500/20 p-2 rounded-lg">
                            <Package className="h-4 w-4 text-orange-400" />
                        </div>
                        <div>
                            <span className="text-white text-sm font-medium block">{order.types_of_goods}</span>
                            <span className="text-gray-400 text-xs">{order.weight_of_goods}</span>
                        </div>
                    </div>
                </div>
                {/* Customer Information */}
                <div className="mx-4 mb-4 bg-gray-800/60 backdrop-blur-sm rounded-xl px-4 py-4 flex justify-between items-center border border-gray-700/30">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-500 h-10 w-10 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <span className="text-white font-semibold text-sm">
                                {order.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </span>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">{order.name}</p>
                            <p className="text-gray-400 text-xs">{order.mobile_number}</p>
                        </div>
                    </div>
                    <button className="h-10 w-10 bg-green-500/20 hover:bg-green-500/30 rounded-full flex items-center justify-center transition-colors border border-green-500/30 hover:border-green-500/50">
                        <Phone className="h-4 w-4 text-green-400" />
                    </button>
                </div>
                
                {/* Ignore Reason Input (only when editing) */}
                {isIgnoring && (
                    <div className="px-4 pb-4">
                        <div className="space-y-3">
                            <Textarea
                                placeholder="Enter reason for ignoring this booking..."
                                value={currentIgnoreReason}
                                onChange={(e) => setCurrentIgnoreReason(e.target.value)}
                                className="bg-gray-800 text-white border-gray-700 focus:border-indigo-500"
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleSaveIgnore}
                                    disabled={isUpdating || currentIgnoreReason.trim() === ''}
                                >
                                    {isUpdating ? 'Saving...' : <><Check className="h-4 w-4 mr-2" /> Save Reason</>}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white"
                                    onClick={handleCancelIgnore}
                                    disabled={isUpdating}
                                >
                                    <X className="h-4 w-4 mr-2" /> Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Click outside to close menu */}
                {showMenu && (
                    <div
                        className="fixed inset-0 z-0"
                        onClick={() => setShowMenu(false)}
                    ></div>
                )}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-8 px-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                    Booking Management
                </h1>
                <p className="text-gray-400">Monitor and manage all your logistics bookings</p>
            </div>
            {/* Tab Navigation */}
            <div className="flex mb-8 bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 border border-gray-700/30 inline-flex">
                <button
                    className={`px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${activeTab === 'pending'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/25'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                    onClick={() => setActiveTab('pending')}
                >
                    <span>Pending</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'pending' ? 'bg-white/20' : 'bg-gray-700'
                        }`}>
                        {getTabCount('pending')}
                    </span>
                </button>
                <button
                    className={`px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${activeTab === 'process'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                    onClick={() => setActiveTab('process')}
                >
                    <span>In Process</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'process' ? 'bg-white/20' : 'bg-gray-700'
                        }`}>
                        {getTabCount('process')}
                    </span>
                </button>
                <button
                    className={`px-6 py-3 font-semibold text-sm rounded-lg transition-all duration-200 flex items-center space-x-2 ${activeTab === 'ignore'
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-600/25'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                    onClick={() => setActiveTab('ignore')}
                >
                    <EyeOff className="h-4 w-4" />
                    <span>Ignored</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'ignore' ? 'bg-white/20' : 'bg-gray-700'
                        }`}>
                        {getTabCount('ignore')}
                    </span>
                </button>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-400 text-sm font-medium mb-1">Pending Bookings</p>
                            <p className="text-2xl font-bold text-white">{getTabCount('pending')}</p>
                        </div>
                        <div className="bg-yellow-500/20 p-3 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-400 text-sm font-medium mb-1">In Process</p>
                            <p className="text-2xl font-bold text-white">{getTabCount('process')}</p>
                        </div>
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                            <Truck className="h-6 w-6 text-blue-400" />
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-xl p-6 border border-gray-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Ignored</p>
                            <p className="text-2xl font-bold text-white">{getTabCount('ignore')}</p>
                        </div>
                        <div className="bg-gray-500/20 p-3 rounded-lg">
                            <EyeOff className="h-6 w-6 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
            {/* Booking Cards */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden w-full border border-gray-700/50 animate-pulse">
                            <div className="px-4 pt-3 flex justify-between items-center">
                                <div className="h-6 bg-gray-700 rounded-full w-20"></div>
                                <div className="h-4 bg-gray-700 rounded w-12"></div>
                            </div>
                            <div className="mx-4 my-4 bg-gray-800/80 rounded-xl px-4 py-4 flex items-center justify-between border border-gray-700/30">
                                <div className="flex flex-col space-y-2">
                                    <div className="h-3 bg-gray-700 rounded w-12"></div>
                                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                                </div>
                                <div className="h-8 bg-gray-700 rounded-full w-8"></div>
                                <div className="flex flex-col space-y-2">
                                    <div className="h-3 bg-gray-700 rounded w-12"></div>
                                    <div className="h-4 bg-gray-700 rounded w-20"></div>
                                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="px-6 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="h-4 w-4 bg-gray-700 rounded-full"></div>
                                    <div className="flex-1 mx-3 h-1 bg-gray-700 rounded-full"></div>
                                    <div className="h-4 w-4 bg-gray-700 rounded-full"></div>
                                </div>
                            </div>
                            <div className="px-5 py-4 mx-4 my-4">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-gray-700 rounded-lg"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-700 rounded w-24"></div>
                                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-4 py-4 border-t border-gray-700/50">
                                <div className="flex items-center space-x-3">
                                    <div className="h-8 w-8 bg-gray-700 rounded-lg"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                                        <div className="h-3 bg-gray-700 rounded w-12"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="mx-4 mb-4 bg-gray-800/60 rounded-xl px-4 py-4 flex justify-between items-center border border-gray-700/30">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-700 rounded w-24"></div>
                                        <div className="h-3 bg-gray-700 rounded w-20"></div>
                                    </div>
                                </div>
                                <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredBookings.map((order) => (
                        <OrderCard key={order.user_booking_sno} order={order} />
                    ))}
                </div>
            )}
            {/* Empty State */}
            {!loading && filteredBookings.length === 0 && (
                <div className="text-center py-16">
                    <div className="mx-auto w-32 h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-700">
                        {activeTab === 'ignore' ? (
                            <EyeOff className="h-12 w-12 text-gray-500" />
                        ) : (
                            <Truck className="h-12 w-12 text-gray-500" />
                        )}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                        No {activeTab === 'pending' ? 'Pending' : activeTab === 'process' ? 'In Process' : 'Ignored'} Bookings
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                        {activeTab === 'pending'
                            ? 'When you receive new booking requests, they will appear here for your review.'
                            : activeTab === 'process'
                                ? 'Active shipments and ongoing deliveries will be displayed in this section.'
                                : 'Bookings that have been marked as ignored will appear here for future reference.'}
                    </p>
                </div>
            )}
        </div>
    );
}