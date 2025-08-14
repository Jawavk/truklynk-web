import Button from "@/components/ui/form/Button"
import { fetchBookingById, retryQuotation } from "@/store/slice/customerSlice"
import type { AppDispatch, RootState } from "@/store/store"
import { Calendar, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { useToast } from "../context/ToastContext"
import OrderTabs from "./OrderTabs"
import { Modal } from "@/components/ui/layout/Modal"

// No Bookings Available Component
const NoBookingsAvailable = ({ eventStatus }: { eventStatus: number }) => {
  const isOngoing = eventStatus === 0

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Attractive SVG Illustration */}
      <div className="relative mb-8">
        <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-2xl">
          {/* Background Circle */}
          <circle cx="100" cy="100" r="90" fill="url(#bgGradient)" className="animate-pulse" />

          {/* Truck/Vehicle Illustration */}
          {isOngoing ? (
            <g>
              {/* Truck Body */}
              <rect
                x="40"
                y="85"
                width="60"
                height="30"
                rx="8"
                fill="#4F46E5"
                className="animate-bounce"
                style={{ animationDelay: "0.5s" }}
              />
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
              <rect
                x="50"
                y="140"
                width="15"
                height="3"
                rx="1"
                fill="#6B7280"
                className="animate-pulse"
                style={{ animationDelay: "0.2s" }}
              />
              <rect
                x="80"
                y="140"
                width="15"
                height="3"
                rx="1"
                fill="#6B7280"
                className="animate-pulse"
                style={{ animationDelay: "0.4s" }}
              />
              <rect
                x="110"
                y="140"
                width="15"
                height="3"
                rx="1"
                fill="#6B7280"
                className="animate-pulse"
                style={{ animationDelay: "0.6s" }}
              />
              <rect
                x="140"
                y="140"
                width="15"
                height="3"
                rx="1"
                fill="#6B7280"
                className="animate-pulse"
                style={{ animationDelay: "0.8s" }}
              />
              <rect
                x="170"
                y="140"
                width="15"
                height="3"
                rx="1"
                fill="#6B7280"
                className="animate-pulse"
                style={{ animationDelay: "1s" }}
              />
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
          <circle
            cx="155"
            cy="55"
            r="3"
            fill="#8B5CF6"
            opacity="0.6"
            className="animate-ping"
            style={{ animationDelay: "0.5s" }}
          />
          <circle
            cx="40"
            cy="160"
            r="2"
            fill="#F59E0B"
            opacity="0.6"
            className="animate-ping"
            style={{ animationDelay: "1s" }}
          />
          <circle
            cx="160"
            cy="150"
            r="3"
            fill="#EF4444"
            opacity="0.6"
            className="animate-ping"
            style={{ animationDelay: "1.5s" }}
          />

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
            {isOngoing ? "No Ongoing Bookings" : "No Previous Bookings"}
          </h3>

          <p className="text-gray-400 text-lg leading-relaxed">
            {isOngoing
              ? "You don't have any active bookings at the moment. New booking requests will appear here when you start booking with us."
              : "Your completed and cancelled bookings history will be displayed here once you complete some deliveries."}
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center justify-center space-x-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isOngoing ? "bg-blue-500" : "bg-gray-500"} animate-pulse`}></div>
          <span className="text-gray-500 font-medium">
            {isOngoing ? "Waiting for new bookings..." : "No booking history yet"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetails() {
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()
  const navigate = useNavigate()
  const userData = location.state?.data
  const eventStatus = useSelector((state: RootState) => state.customer.eventStatus)
  const bookings: any = useSelector((state: RootState) => state.customer.bookings)
  const { quotations, loading, error } = useSelector((state: RootState) => state.quotation)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { showToast } = useToast()

  const fetchBookings = () => {
    if (userData?.id) {
      dispatch(
        fetchBookingById({
          userProfileSno: userData.id,
          status: eventStatus === 0 ? '{"Processing","Accept","Request_Pending","Started","Pending"}' : '{"Completed","Cancel"}',
          skip: 0,
          limits: 10,
        }),
      )
    }
  }

  useEffect(() => {
    console.log(bookings)
    fetchBookings()
  }, [dispatch, eventStatus])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchBookings()
      showToast({
        message: "Bookings refreshed successfully",
        type: "success",
      })
    } catch (error) {
      showToast({
        message: "Failed to refresh bookings",
        type: "error",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleViewQuotation = (booking_person: number, service_booking_sno: number, bookingTime: string) => {
    const createdOn = bookingTime
    navigate("/quoteconformation", {
      state: { service_booking_sno, createdOn, booking_person },
    })
  }

  const handleRetryQuotation = (booking: any) => {
    setSelectedBooking(booking)
    setIsModalOpen(true)
  }

  const confirmRetry = () => {
    if (selectedBooking) {
      dispatch(
        retryQuotation({
          service_booking_sno: selectedBooking.service_booking_sno,
          lat: selectedBooking.pickup_location.latlng.latitude,
          lng: selectedBooking.pickup_location.latlng.longitude,
          bookingPerson: selectedBooking.booking_person,
          sub_category_sno: selectedBooking.sub_category_sno,
        }),
      )
        .then((result) => {
          if (result.meta.requestStatus === "fulfilled") {
            showToast({
              message: result.payload?.message || "New Quotation added successfully",
              type: "success",
            })
            fetchBookings()
          } else {
            showToast({
              message: result.payload || "Please try again",
              type: "info",
            })
          }
        })
        .catch((error) => {
          showToast({
            message: `An error occurred: ${error.message}`,
            type: "error",
          })
        })
    }
    setIsModalOpen(false)
    setSelectedBooking(null)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedBooking(null)
  }

  // Loading state
  if (loading || isRefreshing) {
    return (
      <div className="bg-black min-h-screen text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <OrderTabs />
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-400">Loading bookings...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fix: Access the correct nested data structure
  // The actual booking data is at bookings.json[0].get_all_booking
  const actualBookings = bookings?.json?.[0]?.get_all_booking || []
  const hasBookings = actualBookings.length > 0

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <OrderTabs />

        {/* Content Area */}
        {!hasBookings ? (
          // Empty State - Using NoBookingsAvailable component
          <NoBookingsAvailable eventStatus={eventStatus} />
        ) : (
          // Bookings List - Fixed to use actualBookings instead of bookings.json
          <div className="px-4 flex-1 overflow-auto space-y-4">
            {actualBookings.map((booking, index) => {
              const contactInfo = booking.contact_info ? JSON.parse(booking.contact_info) : null
              return (
                <div
                  key={index}
                  className="bg-zinc-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors duration-200"
                >
                  <div className="flex justify-between items-center p-3">
                    <div className="text-sm text-gray-400">Booking No. {booking.service_booking_sno}</div>
                    <div
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        booking.booking_status_name === "Accept"
                          ? "bg-green-500 text-white"
                          : booking.booking_status_name === "Pending"
                            ? "bg-violet-500 text-white"
                            : "bg-green-500 text-white"
                      }`}
                    >
                      {booking.booking_status_name}
                    </div>
                  </div>

                  <div className="bg-gray-800 p-3 mx-2 rounded-lg mb-2">
                    <div className="flex justify-between items-center">
                      <div className="text-base font-medium">{booking.pickup_location?.address.split(",")[0]}</div>
                      <ArrowRight size={16} className="text-gray-400" />
                      <div className="text-base font-medium">{booking.drop_location?.address.split(",")[0]}</div>
                    </div>
                  </div>

                  <div className="px-3 pb-2">
                    <div className="flex items-center mb-3 text-sm text-gray-400">
                      <Calendar size={14} className="mr-2" />
                      <span>{new Date(booking.booking_time).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-between items-center pb-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="mr-4">{booking.types_of_goods}</span>
                        <span>
                          {booking.weight_of_goods} {booking.weight_type_name}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-700 pt-3 flex justify-between items-center">
                      <div className="text-sm">Trip price</div>
                      <div className="flex items-center">
                        {/* Fixed: Added null check for booking.price */}
                        <span className="font-medium mr-2">
                          ₹{booking.price ? booking.price.toLocaleString() : "0"}
                        </span>
                        <ArrowRight size={16} className="text-white" />
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-700 pt-3 flex justify-between items-center">
                      <div className="text-sm">Distance</div>
                      <div className="flex items-center">
                        {/* Fixed: Added null check for booking.distance */}
                        <span className="font-medium mr-2">
                          {booking.distance ? Math.round(booking.distance) : "0"} km
                        </span>
                      </div>
                    </div>

                    {contactInfo && (
                      <div className="border-t border-dashed border-gray-700 pt-3 flex justify-between items-center">
                        <div className="text-sm">Contact</div>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">
                            {contactInfo.name} - {contactInfo.phone}
                          </span>
                        </div>
                      </div>
                    )}

                    {eventStatus === 0 &&
                      booking.booking_status_name !== "cancel" &&
                      (booking.booking_status_name === "Accept" || booking.booking_status_name === "Processing") && (
                        <Button
                          onClick={() =>
                            handleViewQuotation(booking.booking_person, booking.service_booking_sno, booking.created_on)
                          }
                          className="px-4 py-2 font-semibold bg-zinc-500 border border-gray-300 text-white rounded-lg m-3 hover:bg-zinc-400 transition-colors duration-200"
                        >
                          View Quotation
                        </Button>
                      )}

                    {eventStatus === 0 && booking.booking_status_name === "Request_Pending" && (
                      <>
                        <p className="text-red-500">
                          Your request has been accepted and our customer support team will be in touch with you
                          shortly!
                        </p>
                        <Button
                          onClick={() => handleRetryQuotation(booking)}
                          className="px-6 py-2 font-semibold bg-red-600 border border-gray-300 text-white rounded-lg m-3 hover:bg-red-700 transition-colors duration-200"
                        >
                          Retry
                        </Button>
                      </>
                    )}
                  </div>
                  {eventStatus === 0 && booking.booking_status_cd === 78 && (
                    <>
                      <Button
                        onClick={() => navigate("/quoteconformation")}
                        className="px-6 py-2 font-semibold bg-red-600 border border-gray-300 text-white rounded-lg m-3 hover:bg-red-700 transition-colors duration-200"
                      >
                        Track Order
                      </Button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Confirm"
          className="bg-gray-800 text-white rounded-lg p-6 max-w-md mx-auto"
        >
          <p className="mb-6">Retrying will remove previous quotations.</p>
          <div className="flex justify-end space-x-4">
            <Button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Close
            </Button>
            <Button
              onClick={confirmRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              OK
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
