import Button from "@/components/ui/form/Button"
import { Card } from "@/components/ui/layout/Card"
import { Modal } from "@/components/ui/layout/Modal"
import Table from "@/components/ui/table"
import {
  fetchBookingById,
  fetchCustomerData,
  RejectCustomer,
  setEventStatus,
  VerifyCustomer,
} from "@/store/slice/customerSlice"
import type { AppDispatch, RootState } from "@/store/store"
import { Download, Eye, FileText, PencilLine, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

interface Document {
  document_type: number
  document_name: string
  media_sno: number
  media_url: string
  media_type: string
  content_type: string
  created_on: string
  container_name: string
}
interface UserProfile {
  user_profile_sno: number
  users_sno: any
  name: string
  reject_reason: any
  status: number
  email: string
  phoneNumber: number
  documents: Document[]
}

interface GetUserProfile {
  isSuccess: boolean
  profiles: UserProfile[]
}

interface ApiResponse {
  data: Array<{
    getcustomers: GetUserProfile[]
  }>
}

export default function CustomerVerification() {
  const methods = useForm({
    defaultValues: {
      search: "",
    },
  })

  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [reason, setReason] = useState("")
  const { data: customerData } = useSelector((state: RootState) => state.customer)
  const eventStatus = useSelector((state: RootState) => state.customer.eventStatus)
  const [providerToView, setProviderToView] = useState<UserProfile>()
  const usersno = useSelector((state: RootState) => state.customer.user_sno)
  const [selectedRejectUserSno, setSelectedRejectUserSno] = useState(null)

  useEffect(() => {
    dispatch(fetchCustomerData())
  }, [dispatch])

  const [customerStatuses, setcustomerStatuses] = useState(() => {
    const savedStatuses = localStorage.getItem("customerStatuses")
    return savedStatuses ? JSON.parse(savedStatuses) : Array(customerData.length).fill("pending")
  })

  const handleVerify = (data) => {
    const usersno = data.user_sno
    console.log("User SNO being sent:", usersno)
    const payload = {
      user_sno: usersno,
      status: 1,
    }

    dispatch(VerifyCustomer(payload))
      .unwrap()
      .then((res) => {
        console.log("Customer Verified successfully:", res)
      })
      .catch((err) => {
        console.error("Verification failed:", err)
      })
  }

  const handleReject = (row) => {
    console.log("Opening reject modal for user_sno:", row.user_sno)
    setSelectedRejectUserSno(row.user_sno)
    setShowRejectModal(true)
  }

  const ConfirmReject = () => {
    console.log("Rejecting user_sno:", selectedRejectUserSno)
    const payload = {
      user_sno: selectedRejectUserSno,
      status: 0,
      block_reason: reason,
    }

    dispatch(RejectCustomer(payload))
      .unwrap()
      .then((res) => {
        console.log("Customer Rejected successfully:", res)
        setShowRejectModal(false)
      })
      .catch((err) => {
        console.error("Reject failed:", err)
      })
  }

  const handleEditcustomer = (customerData) => {
    navigate("/customerinformation", {
      state: {
        customerData,
        editMode: true,
      },
    })
  }

  const handleBooking = async (data) => {
    console.log(data)
    try {
      const newStatus = 0
      dispatch(setEventStatus(newStatus))
      const resultAction = await dispatch(
        fetchBookingById({
          userProfileSno: data.id,
          status: newStatus === 0 ? '{"Processing","Accept","Request_Pending","Started","Pending"}' : '{"Completed","Cancel"}',
          skip: 0,
          limits: 10,
        }),
      )
      console.log(resultAction)
      if (fetchBookingById.fulfilled.match(resultAction)) {
        navigate("/orderdetails", {
          state: {
            CustomerData: resultAction.payload,
            data,
          },
          
        })
      } else {
        console.error("Failed to fetch booking:", resultAction.payload)
      }
    } catch (error) {
      console.error("Error fetching booking data:", error)
    }
  }

  const handleViewClick = (index) => {
    setProviderToView(customerData[index])
    setShowViewModal(true)
  }

  const totalProviders = customerData.length
  const verifiedCount = customerData.filter((customer) => customer.status === 1).length
  const pendingCount = customerData.filter((customer) => customer.status === 0).length

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-black text-white p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 sm:mb-6">Customer Verification</h1>

        <div className="flex flex-col sm:flex-row justify-start mb-4 sm:mb-6 gap-3 sm:gap-5">
          <Card className="w-full sm:w-72 h-auto sm:h-24 bg-amber-900 hover:bg-gray-800 text-black rounded-md p-4">
            <h1 className="text-base sm:text-lg text-white font-medium">Total customers</h1>
            <p className="text-white text-xl sm:text-2xl font-bold mt-2">{totalProviders}</p>
          </Card>
          <Card className="w-full sm:w-64 h-auto sm:h-24 bg-green-800 hover:bg-gray-800 text-black rounded-md p-4">
            <h1 className="text-base sm:text-lg text-white font-medium">Approved</h1>
            <p className="text-white text-xl sm:text-2xl font-bold mt-2">{verifiedCount}</p>
          </Card>
          <Card className="w-full sm:w-64 h-auto sm:h-24 bg-yellow-800 hover:bg-gray-800 text-black rounded-md p-4">
            <h1 className="text-base sm:text-lg text-white font-medium">Pending</h1>
            <p className="text-white text-xl sm:text-2xl font-bold mt-2">{pendingCount}</p>
          </Card>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table
                className="bg-black text-white min-w-full px-4 sm:px-0"
                tableClassName="px-4"
                headerClassName="pl-4"
                createButtonText={window.innerWidth < 768 ? "ADD CUSTOMER" : "Add New Customer"}
                onCreateClick={() => navigate("/customerinformation")}
                searchClassName="mx-4 sm:mx-0"
                filterClassName="mx-4 sm:mx-0"
                data={customerData.map((customer, index) => ({
                  id: customer.user_profile_sno,
                  user_sno: customer.users_sno,
                  name: customer.name,
                  email: customer.email,
                  phoneNumber: customer.phoneNumber,
                  index: index,
                  reject_reason: customer.reject_reason,
                  status: customer.status,
                }))}
                columns={[
                  {
                    key: "name",
                    header: "Name",
                    sortable: true,
                    headerClassName: "pl-4",
                  },
                  {
                    key: "email",
                    header: "Email",
                    sortable: true,
                    headerClassName: "pl-4",
                  },
                  {
                    key: "phoneNumber",
                    header: "Phone Number ",
                    sortable: true,
                    headerClassName: "pl-4",
                  },
                ]}
                customCellRender={(row, key) => {
                  if (key === "name" || key === "email" || key === "phoneNumber") {
                    return <span className="text-sm sm:text-base pl-4">{row[key]}</span>
                  }
                  return row[key]
                }}
                actions={[
                  {
                    label: "Action",
                    render: (row) => {
                      const index = row.index
                      const isMobile = typeof window !== "undefined" && window.innerWidth < 768

                      return (
                        <div className="flex overflow-x-auto no-scrollbar py-1 -mx-2 px-2">
                          <div className="flex flex-nowrap gap-1 sm:gap-2 min-w-max">
                            {(() => {
                              if (row.status === 0 && row.reject_reason !== null) {
                                return (
                                  <>
                                    <Button
                                      className="bg-red-600 hover:bg-gray-600 text-white w-auto sm:w-28 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-lg"
                                      onClick={() => handleVerify(row)}
                                    >
                                      {isMobile ? "Rej." : "Rejected"}
                                    </Button>

                                    <Button
                                      className="bg-transparent text-white border border-gray-700 w-auto sm:w-24 text-xs sm:text-sm font-medium px-1 sm:px-4 py-1 sm:py-2 rounded-lg gap-1 sm:gap-2 flex items-center justify-center"
                                      onClick={() => handleEditcustomer(row)}
                                    >
                                      <PencilLine className="h-3 w-3 sm:h-5 sm:w-4 text-white" />
                                      {!isMobile && <span>EDIT</span>}
                                    </Button>
                                  </>
                                )
                              } else if (row.status === 0) {
                                return (
                                  <>
                                    <Button
                                      className="text-white border border-gray-700 rounded-lg px-1 sm:px-2 py-1 sm:py-2 flex items-center justify-center"
                                      onClick={() => handleReject(row)}
                                    >
                                      <X className="h-3 w-3 sm:h-5 sm:w-4 text-white" />
                                    </Button>
                                    <Button
                                      className="bg-gray-700 hover:bg-gray-600 text-white w-auto sm:w-28 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-lg"
                                      onClick={() => handleVerify(row)}
                                    >
                                      {isMobile ? "Ver." : "Verify"}
                                    </Button>
                                  </>
                                )
                              } else {
                                return (
                                  <Button
                                    className="text-white border border-gray-700 rounded-lg px-1 sm:px-2 py-1 sm:py-2 flex items-center justify-center"
                                    onClick={() => {
                                      console.log("Delete customer", index)
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-5 sm:w-4 text-white" />
                                  </Button>
                                )
                              }
                            })()}

                            <Button
                              className="bg-white hover:bg-white text-black w-auto sm:w-28 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center justify-center gap-1"
                              onClick={() => handleViewClick(index)}
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              {!isMobile && <span>VIEW</span>}
                            </Button>
                            <Button
                              className="bg-white hover:bg-white text-black w-auto sm:w-28 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center justify-center"
                              onClick={() => handleBooking(row)}
                            >
                              <span>{isMobile ? "Book" : "BOOKING"}</span>
                            </Button>
                          </div>
                        </div>
                      )
                    },
                  },
                ]}
              />
            </div>
          </div>
          <Modal className="max-h-screen bg-gray-800" isOpen={showViewModal} onClose={() => setShowViewModal(false)}>
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900 sticky top-0 z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Customer Details</h2>
            </div>
            {providerToView && (
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar bg-gray-800">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Information:</h3>
                  <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Customer Name</p>
                        <p className="text-gray-400 text-sm sm:text-base">{providerToView.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Contact Number</p>
                        <p className="text-gray-400 text-sm sm:text-base">{providerToView.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Email</p>
                        <p className="text-gray-400 text-sm sm:text-base">{providerToView.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Status</p>
                        <p className="text-gray-400 text-sm sm:text-base">
                          {providerToView.status === 1 ? (
                            <span className="text-green-400">Verified</span>
                          ) : (
                            <span className="text-yellow-400">Pending</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Uploads:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {providerToView.documents && providerToView.documents.length > 0 ? (
                      providerToView.documents.map((document, index) => (
                        <div key={index} className="border border-gray-600 rounded-lg p-2 sm:p-3">
                          <div className="bg-gray-700 p-3 sm:p-4 rounded-lg flex flex-col items-center justify-center h-32 sm:h-40">
                            {document.media_type?.includes("image") ? (
                              <img
                                src={document.media_url || "/placeholder.svg"}
                                alt={document.document_name}
                                className="h-16 sm:h-20 w-auto object-contain mb-2"
                                onError={(e) => {
                                  const target = e.currentTarget
                                  target.src = ""
                                  target.style.display = "none"
                                  if (target.nextElementSibling) {
                                    ;(target.nextElementSibling as HTMLElement).style.display = "block"
                                  }
                                }}
                              />
                            ) : (
                              <FileText size={32} className="text-gray-400 mb-2" />
                            )}
                            <p className="text-gray-300 text-xs sm:text-sm font-medium">
                              {document.document_name || `Document ${index + 1}`}
                            </p>
                            <div className="flex mt-2 gap-2">
                              <a
                                href={document.media_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1"
                              >
                                <Eye size={12} /> View
                              </a>
                              <a
                                href={document.media_url}
                                download={document.document_name}
                                className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1"
                              >
                                <Download size={12} /> Download
                              </a>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center text-gray-400 py-6 sm:py-8">
                        No documents available for this customer
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <style>{`
                            .custom-scrollbar::-webkit-scrollbar {
                                width: 6px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: #2d3748;
                                border-radius: 10px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: #4a5568;
                                border-radius: 10px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: #718096;
                            }
                            .no-scrollbar::-webkit-scrollbar {
                              display: none;
                            }
                            .no-scrollbar {
                              -ms-overflow-style: none;
                              scrollbar-width: none;
                            }
                        `}</style>
          </Modal>
        </div>
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title="Reason For Rejection"
          type="info"
          size="2xl"
          closeOnOverlay={true}
          closeOnEscape={true}
        >
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">
              Please provide a detailed reason for rejection. This will help improve future submissions.
            </p>

            <div className="relative">
              <textarea
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none custom-scrollbar"
                rows={5}
                placeholder="Reason for rejection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-gray-400">
                {reason.length} characters
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-850 border-t border-gray-700 flex justify-end space-x-2 sm:space-x-3">
            <button
              onClick={() => setShowViewModal(false)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
            >
              Cancel
            </button>

            <button
              onClick={ConfirmReject}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm ${
                !reason.trim() ? "opacity-50 cursor-not-allowed" : "hover:from-red-700 hover:to-red-800"
              }`}
            >
              Reject
            </button>
          </div>
        </Modal>
      </div>
    </FormProvider>
  )
}
