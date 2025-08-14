import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { RootState, AppDispatch } from '@/store/store';
import { useToast } from '../context/ToastContext';
import Button from '@/components/ui/form/Button';
import { fetchServiceBooking, updateBookingOrder } from '@/store/slice/cancelReasonSlice';

interface CancelReason {
  cancel_reason_sno: number;
  reason: string;
  role: string;
}

interface LocationState {
  bookingId?: number;
}

const CancelOptions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingId } = (location.state || {}) as LocationState;
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [customReason, setCustomReason] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [selectedReasonData, setSelectedReasonData] = useState<any>(null);
  const { role, booking_person, service_booking_sno } = location.state;
  const { showToast } = useToast();
  const { data: reasons = [], loading, error } = useSelector(
    (state: RootState) => state.cancelReason
  );

  useEffect(() => {
    if (role) {
      dispatch(fetchServiceBooking({ role }));
    }
  }, [dispatch, role]);

  const handleConfirm = () => {
    if (!selectedReason && !customReason.trim()) {
      return;
    }
    console.log(service_booking_sno);
    const payload = {
      booking_status_name: "Cancel",
      service_booking_sno: service_booking_sno,
      user_profile_sno: booking_person,
      updated_by: null,
      updated_time: new Date().toISOString(),
      isSendNotification: true,
      cancelreasonSno: selectedReason || null,
      isCustomer: true,
      cancelreason: selectedReasonData?.reason === 'Other (Please specify)' ? customReason : selectedReasonData?.reason,
    };
    console.log('Payload:', payload);
    dispatch(updateBookingOrder(payload)).unwrap()
      .then(() => {
        if (role === 'Admin') {
          navigate("/orders", {
            state: { reasonId: selectedReason, customReason, bookingId },
          });
        }
        else if (role === "Service Provider") {
          navigate("/bookingDetails", {
            state: { data: 'some other data' },
          });
        }
        else if (role === "Customer") {
          navigate('/orderdetails')
        }
      })
      .catch((error) => {
        showToast({
          message: `Failed to cancel booking: ${error?.message || error}`,
          type: 'error',
        });
      });
  };

  const handleReasonSelect = (reason: CancelReason) => {
    setSelectedReason(reason.cancel_reason_sno);
    setShowCustomInput(reason.reason.toLowerCase() === 'other');
    if (reason.reason.toLowerCase() !== 'other') {
      setCustomReason('');
      setSelectedReasonData(reason);
    }
  };
  console.log(selectedReasonData)
  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <div className="">
        <div className="flex items-center mb-6">
          <Button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 bg-transparent hover:bg-gray-900 rounded-full"
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl font-semibold">Cancel Booking</h1>
        </div>

        <div className="bg-gray-800 p-6  shadow-md">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-red-500" />
            </div>
          ) : error ? (
            <div className="text-center text-red-400">
              <p>{error}</p>
              <Button onClick={() => dispatch(fetchServiceBooking())} className="mt-4">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-lg mb-4">Select a cancellation reason</h2>
              <div className="space-y-3 overflow-y-auto max-h-1/2 mb-4 pr-1">
                {reasons.json?.map((reason: any) => (
                  <div
                    key={reason.cancel_reason_sno}
                    onClick={() => handleReasonSelect(reason)}
                    className={`p-4 rounded-lg cursor-pointer border transition ${selectedReason === reason.cancel_reason_sno
                      ? 'bg-red-900 border-red-500'
                      : 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{reason.reason}</span>
                      {selectedReason === reason.cancel_reason_sno && (
                        <Check className="text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>


              {selectedReasonData?.reason === 'Other (Please specify)' ? (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please provide your reason"
                  className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 text-white mb-4"
                />
              ) : null}


              <div className="flex justify-end gap-4">
                <Button
                  onClick={() => navigate(-1)}
                  className="bg-transparent border border-gray-600 text-white hover:bg-gray-700"
                >
                  Go Back
                </Button>
                <Button
                  disabled={!selectedReason && !customReason.trim()}
                  className={`${!selectedReason && !customReason.trim()
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  onClick={handleConfirm}
                >
                  Confirm Cancellation
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CancelOptions;
