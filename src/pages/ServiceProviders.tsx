import Button from "@/components/ui/form/Button"
import { Card } from "@/components/ui/layout/Card"
import { Modal } from "@/components/ui/layout/Modal"
import Table from "@/components/ui/table"
import { Download, Eye, FileText, PencilLine, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import type { AppDispatch, RootState } from "@/store/store"
import {
  fetchServiceProviders,
  RejectServiceProvider,
  type ServiceProviderData,
  VerifyServiceProvider,
} from "@/store/slice/serviceProviderSlice"
import { fetchBookings } from "@/store/slice/bookingSlice"

interface TransformedServiceProvider {
  id: number
  name: string
  email: string
  vehicles: number
  users_sno: any
  drivers: number
  orders: number
  rating: number
  action: string
  companyName: string
  providerName: string
  mobile_number: string
  addressLine: string
  city: string
  status: any
  reject_reason: any
  district: string
  pincode: string
  documents: {
    insurance: string
    pancard: string
    fc: string
    gst: string
    otherDocs: string
  }
  originalData?: ServiceProviderData
}



export default function ServiceProviders() {
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()
  const navigate = useNavigate()

  const { data: providersData, loading, error } = useSelector((state: RootState) => state.serviceProviders)
  const [selectedProviderId, setSelectedProviderId] = useState(null)
  const [selectedRejectUserSno, setSelectedRejectUserSno] = useState(null)
  const [reason, setReason] = useState("")

  const orderData = location.state?.order
  const fromOrderManagement = location.state?.fromOrderManagement
  const sourceAction = location.state?.sourceAction

  const methods = useForm({
    defaultValues: {
      search: "",
    },
  })



  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [providerToView, setProviderToView] = useState<TransformedServiceProvider | null>(null)

  const [serviceProviders, setServiceProviders] = useState<TransformedServiceProvider[]>([])

  useEffect(() => {
    dispatch(fetchServiceProviders())
  }, [dispatch])

  useEffect(() => {
    if (providersData && providersData.length > 0) {
      console.log(providersData);
      const transformedProviders = providersData.map((provider): TransformedServiceProvider => {
        const address = provider.address && provider.address.length > 0 ? provider.address[0] : null
        const documents = provider.documents || []
        const insuranceDoc = documents.find((doc) => doc.document_type === 63)
        const panCardDoc = documents.find((doc) => doc.document_type === 97)
        const fcDoc = documents.find((doc) => doc.document_type === 98)
        const gstDoc = documents.find((doc) => doc.document_type === 99)

        const getMediaUrl = (doc?: any) => {
          if (!doc) return ""
          if (Array.isArray(doc.media)) {
            return doc.media[0]?.mediaUrl || ""
          }
          return doc.media?.mediaUrl || ""
        }

        return {
          id: provider.service_providers_sno,
          name: provider.company_name || `${provider.first_name || ""} ${provider.last_name || ""}`.trim(),
          email: provider.mobile_number || "provider@example.com",
          vehicles: Math.floor(Math.random() * 30) + 5,
          drivers: Math.floor(Math.random() * 20) + 5,
          orders: Math.floor(Math.random() * 40) + 10,
          rating: Number.parseFloat((Math.random() * 2 + 3).toFixed(1)),
          action: "VERIFY",
          users_sno: provider.users_sno,
          companyName: provider.company_name || "",
          providerName: `${provider.first_name || ""} ${provider.last_name || ""}`.trim(),
          mobile_number: provider.mobile_number || "+91 9876543210",
          addressLine: address?.address_line_1 || "",
          city: address?.city_name || "",
          district: address?.district_name || "",
          pincode: address?.pin_code || "",
          status: provider.status,
          reject_reason: provider.reject_reason,
          documents: {
            insurance: getMediaUrl(insuranceDoc),
            pancard: getMediaUrl(panCardDoc),
            fc: getMediaUrl(fcDoc),
            gst: getMediaUrl(gstDoc),
            otherDocs: "",
          },
          originalData: provider,
        }
      })

      setServiceProviders(transformedProviders)
    }
  }, [providersData])

  const [serviceProviderStatuses, setServiceProviderStatuses] = useState(() => {
    const savedStatuses = localStorage.getItem("serviceProviderStatuses")
    return savedStatuses ? JSON.parse(savedStatuses) : []
  })

  useEffect(() => {
    if (serviceProviders.length > 0 && serviceProviderStatuses.length !== serviceProviders.length) {
      setServiceProviderStatuses(Array(serviceProviders.length).fill("pending"))
    }
  }, [serviceProviders])

  useEffect(() => {
    localStorage.setItem("serviceProviderStatuses", JSON.stringify(serviceProviderStatuses))
  }, [serviceProviderStatuses])

  const handleVerify = (data) => {
    const usersno = data.user_sno
    const payload = {
      user_sno: usersno,
      status: 1,
    }

    dispatch(VerifyServiceProvider(payload))
      .unwrap()
      .then((res) => {
        console.log("Service Provider Verified successfully:", res)
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
    

    dispatch(RejectServiceProvider(payload))
      .unwrap()
      .then((res) => {
        console.log("Customer Rejected successfully:", res)
        setShowRejectModal(false)
      })
      .catch((err) => {
        console.error("Reject failed:", err)
      })
  }

  const handleEditProvider = (providerData) => {
    navigate("/serviceproviderinformation", {
      state: {
        providerData,
        editMode: true,
      },
    })
  }

  const handleViewClick = (provider) => {
    console.log(provider);
    setProviderToView(provider)
    setShowViewModal(true)
  }

  const handleBookingClick = (provider) => {
    const providerId = provider.originalData?.service_providers_sno
    setSelectedProviderId(providerId)
    dispatch(fetchBookings(providerId))
    navigate("/bookingdetails", {
      state: {
        ServiceProviderSno: providerId,
      },
    })
  }


  const handleCreateClick = () => {
    const navigationState: any = {}

    // if (fromOrderManagement && orderData && sourceAction === "assignServiceProvider") {
    //   navigationState.fromOrderAssignment = true
    //   navigationState.orderData = orderData
    // }

    if (fromOrderManagement && orderData && sourceAction === "assignServiceProvider") {
      // Coming from OrderManagement to assign vehicle to booking
      navigationState.fromOrderAssignment = true
      navigationState.orderData = orderData
      navigationState.fromOrderManagement = true
      navigationState.sourceAction = "assignServiceProvider"
    } else {
      // Normal vehicle creation from VehicleVerification
      navigationState.fromOrderManagement = false
      navigationState.editMode = false
      navigationState.isEditing = false
      navigationState.sourceAction = "createServiceProvider"
      navigationState.vehicleData = null
      navigationState.order = null
    }

    console.log("Navigation state:", navigationState)

    navigate("/serviceproviderinformation", { state: navigationState })
  }

  
  useEffect(() => {
    if (location.state?.editedProvider) {
      const editedId = location.state.editedProvider.id
      const index = serviceProviders.findIndex((sp) => sp.id === editedId)
      if (index !== -1 && serviceProviderStatuses[index] !== "verified") {
        const updatedStatuses = [...serviceProviderStatuses]
        updatedStatuses[index] = "verified"
        setServiceProviderStatuses(updatedStatuses)
      }
    }
  }, [location, serviceProviders])

  const totalProviders = serviceProviders.length
  const verifiedCount = serviceProviderStatuses.filter((status) => status === "verified").length
  const pendingCount = serviceProviderStatuses.filter((status) => status === "pending").length
  console.log(selectedProviderId)
  console.log(providersData)
  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-black text-white p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 sm:mb-6">Service Providers</h1>

        <div className="flex flex-col sm:flex-row justify-start mb-4 sm:mb-6 gap-3 sm:gap-5">
          <Card className="w-full sm:w-72 h-auto sm:h-24 bg-amber-900 hover:bg-gray-800 text-black rounded-md p-4">
            <h1 className="text-base sm:text-lg text-white font-medium">Total Service Providers</h1>
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

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
              <Button
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table
                  className="bg-black text-white min-w-full px-4 sm:px-0"
                  tableClassName="px-4"
                  headerClassName="pl-4"
                  searchClassName="mx-4 sm:mx-0"
                  filterClassName="mx-4 sm:mx-0"
                  data={serviceProviders.map((sp, index) => ({
                    ...sp,
                    user_sno: sp.users_sno,
                    status: sp.status,
                    reject_reason: sp.reject_reason,
                    index: index,
                  }))}
                  columns={[
                    {
                      key: "name",
                      header: "Name",
                      sortable: true,
                      headerClassName: "pl-4",
                    },
                    {
                      key: "vehicles",
                      header: "All vehicles",
                      sortable: true,
                      headerClassName: "pl-4",
                    },
                    {
                      key: "drivers",
                      header: "All Drivers",
                      sortable: true,
                      headerClassName: "pl-4",
                    },
                    {
                      key: "orders",
                      header: "Orders",
                      sortable: true,
                      headerClassName: "pl-4",
                    },
                    {
                      key: "rating",
                      header: "Ratings",
                      sortable: true,
                      headerClassName: "pl-4",
                    },
                  ]}
                  customCellRender={(row, key, rowIndex, colIndex) => {
                    if (key === "name") {
                      return (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Card className="bg-zinc-800 hover:bg-gray-800 text-black rounded-md h-8 w-8 sm:h-12 sm:w-12"></Card>
                          <div>
                            <div className="font-medium text-sm sm:text-base">{row.name}</div>
                            <div className="text-xs text-gray-400 hidden sm:block">{row.email}</div>
                          </div>
                        </div>
                      )
                    }
                    if (key === "rating") {
                      return <span>★ {row.rating}</span>
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
                                        className="bg-transparent text-white border border-gray-700 w-auto sm:w-24 text-xs sm:text-sm font-medium px-1 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2"
                                        onClick={() => handleEditProvider(row)}
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

                              {row.status === "deleted" ? (
                                <span className="text-gray-500">Deleted</span>
                              ) : (
                                <>
                                  <Button
                                    className="bg-white hover:bg-white text-black w-auto sm:w-28 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center justify-center gap-1"
                                    onClick={() => handleViewClick(row)}
                                  >
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {!isMobile && <span>VIEW</span>}
                                  </Button>
                                  <Button
                                    className="bg-gray-600 hover:bg-gray-700 text-white w-auto sm:w-28 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center justify-center"
                                    onClick={() => handleBookingClick(row)}
                                  >
                                    <span>{isMobile ? "Book" : "BOOK"}</span>
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      },
                    },
                  ]}
                  searchEnabled={true}
                  downloadEnabled={true}
                  createEnabled={true}
                  createButtonText={window.innerWidth < 768 ? "ADD" : "ADD SERVICE PROVIDER"}
                  onCreateClick={handleCreateClick}
                  downloadOptions={{
                    filename: "service-providers.csv",
                    headers: [
                      { label: "Name", key: "name" },
                      { label: "Email", key: "email" },
                      { label: "Vehicles", key: "vehicles" },
                      { label: "Drivers", key: "drivers" },
                      { label: "Orders", key: "orders" },
                      { label: "Rating", key: "rating" },
                    ],
                  }}
                  emptyStateMessage="No service providers available"
                />
              </div>
            </div>
          )}

          <Modal className="max-h-screen bg-gray-800" isOpen={showViewModal} onClose={() => setShowViewModal(false)}>
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900 sticky top-0 z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Service Provider Details</h2>
            </div>
            {providerToView && (
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar bg-gray-800">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Information:</h3>
                  <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Company Name</p>
                        <p className="text-gray-400 text-sm sm:text-base">
                          {providerToView.companyName || "Company Name"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Provider Name</p>
                        <p className="text-gray-400 text-sm sm:text-base">
                          {providerToView.providerName || "Provider Name"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Contact No.</p>
                        <p className="text-gray-400 text-sm sm:text-base">
                          {providerToView.mobile_number || "+91 9876543210"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Email</p>
                        <p className="text-gray-400 text-sm sm:text-base">{providerToView.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Location:</h3>
                  <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Address Line</p>
                        <p className="text-gray-400 text-sm sm:text-base">
                          {providerToView.addressLine || "123 Transport Hub"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">City</p>
                        <p className="text-gray-400 text-sm sm:text-base">{providerToView.city || "Mumbai"}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">District</p>
                        <p className="text-gray-400 text-sm sm:text-base">
                          {providerToView.district || "South Mumbai"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Pincode</p>
                        <p className="text-gray-400 text-sm sm:text-base">{providerToView.pincode || "400001"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Uploads:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {providerToView.originalData &&
                    providerToView.originalData.documents &&
                    providerToView.originalData.documents.length > 0 ? (
                      providerToView.originalData.documents.map((doc: any, index) => {
                        let docTypeName = "Document"
                        if (doc.document_name) {
                          docTypeName = doc.document_name
                        } else {
                          switch (doc.document_type) {
                            case 63:
                              docTypeName = "GST"
                              break
                            case 97:
                              docTypeName = "PAN Card"
                              break
                            case 98:
                              docTypeName = "FC (Fitness Certificate)"
                              break
                            case 99:
                              docTypeName = "Insurance"
                              break
                            default:
                              docTypeName = `Document ${index + 1}`
                          }
                        }

                        // Get media URL
                        let mediaUrl = ""
                        let mediaType = ""
                        if (Array.isArray(doc.media)) {
                          if (doc.media.length > 0) {
                            mediaUrl = doc.media[0].mediaUrl
                            mediaType = doc.media[0].mediaType
                          }
                        } else if (doc.media) {
                          mediaUrl = doc.media.mediaUrl
                          mediaType = doc.media.mediaType
                        }

                        if (!mediaUrl) return null

                        return (
                          <div key={index} className="border border-gray-600 rounded-lg p-2 sm:p-3">
                            <div className="bg-gray-700 p-3 sm:p-4 rounded-lg flex flex-col items-center justify-center h-32 sm:h-40">
                              {mediaType &&
                              (mediaType.includes("image") ||
                                mediaType.includes("JPEG") ||
                                mediaType.includes("jpeg")) ? (
                                <img
                                  src={mediaUrl || "/placeholder.svg"}
                                  alt={docTypeName}
                                  className="h-16 sm:h-20 w-auto object-contain mb-2"
                                  onError={(e: any) => {
                                    e.currentTarget.src = ""
                                    e.currentTarget.style.display = "none"
                                    e.currentTarget.nextSibling.style.display = "block"
                                  }}
                                />
                              ) : (
                                <FileText size={32} className="text-gray-400 mb-2" />
                              )}
                              <p className="text-gray-300 text-xs sm:text-sm font-medium">{docTypeName}</p>
                              <div className="flex mt-2 gap-2">
                                <a
                                  href={mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1"
                                >
                                  <Eye size={12} /> View
                                </a>
                                <a
                                  href={mediaUrl}
                                  download
                                  className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1"
                                >
                                  <Download size={12} /> Download
                                </a>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="col-span-3 text-center text-gray-400 py-6 sm:py-8">
                        No documents available for this service provider
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
