import Button from "@/components/ui/form/Button"
import { Card } from "@/components/ui/layout/Card"
import { Modal } from "@/components/ui/layout/Modal"
import { fetchDrivers, RejectDriver, VerifyDriver } from "@/store/slice/driverSlice"
import type { AppDispatch, RootState } from "@/store/store"
import { Download, Eye, FileText, PencilLine, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import Table from "@/components/ui/table"

export default function DriverVerification() {
  const dispatch = useDispatch<AppDispatch>()
  const { data: driversData }: any = useSelector((state: RootState) => state.drivers)

  const methods = useForm({
    defaultValues: {
      search: "",
    },
  })

  const location = useLocation()
  const navigate = useNavigate()
  const [selectedRejectDriverSno, setSelectedRejectDriverSno] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [reason, setReason] = useState("")
  const [driverToView, setDriverToView] = useState<{
    id: number
    name: string
    email: string
    serviceProvider: string
    contact: string
    action: string
    driverName: string
    contactNo: string
    documents: {
      idProof: string
      license: string
      otherDocs: string
    }
  } | null>(null)

  const [driverStatuses, setDriverStatuses] = useState(() => {
    const savedStatuses = localStorage.getItem("driverStatuses")
    if (savedStatuses) {
      console.log(savedStatuses)
      return JSON.parse(savedStatuses)
    }
  })

  useEffect(() => {
    dispatch(fetchDrivers({}))
  }, [dispatch])

  const handleVerify = (data) => {
    const driverSno = data.driver_sno
    const payload = {
      driver_sno: driverSno,
      activeFlag: true,
    }

    dispatch(VerifyDriver(payload))
      .unwrap()
      .then((res) => {
        console.log("Driver Verified successfully:", res)
      })
      .catch((err) => {
        console.error("Verification failed:", err)
      })
  }

  const handleReject = (driver) => {
    console.log("Opening reject modal for driver_sno:", driver)
    setSelectedRejectDriverSno(driver.driver_sno)
    setShowRejectModal(true)
  }

  const ConfirmReject = () => {
    console.log("Rejecting user_sno:", selectedRejectDriverSno)
    const payload = {
      driver_sno: selectedRejectDriverSno,
      activeFlag: false,
      block_reason: reason,
    }

    dispatch(RejectDriver(payload))
      .unwrap()
      .then((res) => {
        console.log("Customer Rejected successfully:", res)
        setShowRejectModal(false)
      })
      .catch((err) => {
        console.error("Reject failed:", err)
      })
  }

  const handleEditDriver = (index) => {
    if (!driversData?.[0]?.getdrivers) {
      console.error("Drivers data is not available or malformed")
      return
    }
    const driversArray = driversData[0].getdrivers
    const driverToEdit = driversArray.find((driver, idx) => idx === index)
    if (!driverToEdit) {
      console.error("Driver not found at index:", index)
      return
    }

    console.log(driverToEdit)
    navigate("/driverinformation", {
      state: {
        driver: driverToEdit,
        editMode: true,
      },
    })
  }

  const handleViewClick = (driver) => {
    setDriverToView(driver)
    setShowViewModal(true)
  }

  const driversList = driversData[0]?.getdrivers || []

  const totalProviders = driversList.length
  const verifiedCount = driversList.filter((driver) => driver.active_flag === true).length
  const pendingCount = driversList.filter((driver) => driver.active_flag === false).length

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-black text-white p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 sm:mb-6">Driver Verification</h1>

        <div className="flex flex-col sm:flex-row justify-start mb-4 sm:mb-6 gap-3 sm:gap-5">
          <Card className="w-full sm:w-72 h-auto sm:h-24 bg-amber-900 hover:bg-gray-800 text-black rounded-md p-4">
            <h1 className="text-base sm:text-lg text-white font-medium">Total Drivers</h1>
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
          {driversData[0]?.getdrivers?.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table
                  className="bg-black text-white min-w-full px-4 sm:px-0"
                  tableClassName="px-4"
                  headerClassName="pl-4"
                  searchClassName="mx-4 sm:mx-0"
                  filterClassName="mx-4 sm:mx-0"
                  data={driversData[0].getdrivers.map((driver, index) => ({
                    id: driver.driver_sno,
                    driver_name: driver.driver_name,
                    service_provider_name: driver.service_provider_name,
                    driver_mobile_number: driver.driver_mobile_number || "N/A",
                    active_flag: driver.active_flag,
                    reject_reason: driver.reject_reason,
                    index: index,
                    originalData: driver,
                  }))}
                  columns={[
                    {
                      key: "driver_name",
                      header: "Driver Name",
                      sortable: true,
                      headerClassName: "pl-4",
                    },
                    {
                      key: "service_provider_name",
                      header: "Service Provider",
                      sortable: true,
                      headerClassName: "pl-4",
                    },
                    {
                      key: "driver_mobile_number",
                      header: "Mobile Number",
                      sortable: true,
                      headerClassName: "pl-4",
                    },
                  ]}
                  customCellRender={(row, key) => {
                    if (key === "active_flag") {
                      return (
                        <span className="text-sm sm:text-base pl-4">{row.active_flag ? "Active" : "Inactive"}</span>
                      )
                    }
                    if (key === "driver_name" || key === "service_provider_name" || key === "driver_mobile_number") {
                      return <span className="text-sm sm:text-base pl-4">{row[key]}</span>
                    }
                    return row[key]
                  }}
                  actions={[
                    {
                      label: "Action",
                      headerClassName: "text-right pr-4",
                      render: (row) => {
                        const isMobile = typeof window !== "undefined" && window.innerWidth < 768

                        return (
                          <div className="flex overflow-x-auto no-scrollbar py-1 -mx-2 px-2">
                            <div className="flex flex-nowrap gap-1 sm:gap-2 min-w-max">
                              {row.active_flag === false && row.reject_reason != null ? (
                                <>
                                  <Button
                                    className="bg-red-600 hover:bg-gray-600 text-white w-auto sm:w-28 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-lg"
                                    onClick={() => handleVerify(row.originalData)}
                                  >
                                    {isMobile ? "Rej." : "Rejected"}
                                  </Button>
                                  <Button
                                    className="bg-transparent text-white border border-gray-700 w-auto sm:w-24 text-xs sm:text-sm font-medium px-1 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2"
                                    onClick={() => handleEditDriver(row.originalData)}
                                  >
                                    <PencilLine className="h-3 w-3 sm:h-5 sm:w-4 text-white" />
                                    {!isMobile && <span>EDIT</span>}
                                  </Button>
                                </>
                              ) : row.active_flag === false ? (
                                <>
                                  <Button
                                    className="text-white border border-gray-700 rounded-lg px-1 sm:px-2 py-1 sm:py-2 flex items-center justify-center"
                                    onClick={() => handleReject(row.originalData)}
                                  >
                                    <X className="h-3 w-3 sm:h-5 sm:w-4 text-white" />
                                  </Button>
                                  <Button
                                    className="bg-gray-700 hover:bg-gray-600 text-white w-auto sm:w-28 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-lg"
                                    onClick={() => handleVerify(row.originalData)}
                                  >
                                    {isMobile ? "Ver." : "VERIFY"}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    className="bg-transparent text-white border border-gray-700 w-auto sm:w-24 text-xs sm:text-sm font-medium px-1 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2"
                                    onClick={() => handleEditDriver(row.index)}
                                  >
                                    <PencilLine className="h-3 w-3 sm:h-5 sm:w-4 text-white" />
                                    {!isMobile && <span>EDIT</span>}
                                  </Button>
                                  <Button
                                    className="text-white border border-gray-700 rounded-lg px-1 sm:px-2 py-1 sm:py-2 flex items-center justify-center"
                                    onClick={() => {
                                      console.log("Delete driver", row.index)
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 sm:h-5 sm:w-4 text-white" />
                                  </Button>
                                </>
                              )}
                              <Button
                                className="bg-white hover:bg-white text-black w-auto sm:w-28 text-xs sm:text-sm font-medium px-2 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center justify-center gap-1"
                                onClick={() => handleViewClick(row.originalData)}
                              >
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                {!isMobile && <span>VIEW</span>}
                              </Button>
                            </div>
                          </div>
                        )
                      },
                    },
                  ]}
                  searchEnabled={true}
                  downloadEnabled={true}
                  createEnabled={true}
                  createButtonText={window.innerWidth < 768 ? "ADD DRIVER" : "ADD NEW DRIVER"}
                  onCreateClick={() => navigate("/driverinformation")}
                  downloadOptions={{
                    filename: "drivers.csv",
                    headers: [
                      { label: "Driver Name", key: "driver_name" },
                      { label: "Service Provider", key: "service_provider_name" },
                      { label: "Mobile Number", key: "driver_mobile_number" },
                      { label: "Status", key: "active_flag" },
                    ],
                  }}
                  additionalFilters={[
                    {
                      key: "status",
                      label: "Status",
                      type: "select",
                      options: [
                        { value: "all", label: "All Status" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                        { value: "rejected", label: "Rejected" },
                      ],
                      filterFunction: (item, value) => {
                        if (value === "all") return true
                        if (value === "active") return item.active_flag === true
                        if (value === "inactive") return item.active_flag === false && !item.reject_reason
                        if (value === "rejected") return item.active_flag === false && item.reject_reason
                        return true
                      },
                    },
                    {
                      key: "experience",
                      label: "Experience",
                      type: "select",
                      options: [
                        { value: "all", label: "All Experience" },
                        { value: "0-2", label: "0-2 Years" },
                        { value: "2-5", label: "2-5 Years" },
                        { value: "5+", label: "5+ Years" },
                      ],
                      filterFunction: (item, value) => {
                        // Add your experience filtering logic here based on your data structure
                        return true // For now, return all items
                      },
                    },
                    {
                      key: "license_type",
                      label: "License Type",
                      type: "select",
                      options: [
                        { value: "all", label: "All License Types" },
                        { value: "light", label: "Light Vehicle" },
                        { value: "heavy", label: "Heavy Vehicle" },
                        { value: "commercial", label: "Commercial" },
                      ],
                      filterFunction: (item, value) => {
                        // Add your license type filtering logic here based on your data structure
                        return true // For now, return all items
                      },
                    },
                  ]}
                  emptyStateMessage="No drivers available"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <p>No drivers available</p>
            </div>
          )}
        </div>
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Driver Details"
          type="info"
          size="2xl"
          closeOnOverlay={true}
          closeOnEscape={true}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900 sticky top-0 z-10">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Driver Details</h2>
          </div>
          {driverToView && (
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar bg-gray-800">
              {/* Information Section */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Information:</h3>
                <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-gray-300 text-xs sm:text-sm font-medium">Driver Name</p>
                      <p className="text-gray-400 text-sm sm:text-base">{driverToView.driverName || "Driver Name"}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs sm:text-sm font-medium">Service Provider</p>
                      <p className="text-gray-400 text-sm sm:text-base">
                        {driverToView.serviceProvider || "Service Provider"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-300 text-xs sm:text-sm font-medium">Contact No.</p>
                      <p className="text-gray-400 text-sm sm:text-base">{driverToView.contactNo || "+91 9494897763"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploads Section with Document Previews */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Uploads:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {/* Photo */}
                  <div className="border border-gray-600 rounded-lg p-2 sm:p-3">
                    <div className="bg-gray-700 p-3 sm:p-4 rounded-lg flex flex-col items-center justify-center h-32 sm:h-40">
                      <FileText size={32} className="text-gray-400 mb-2" />
                      <p className="text-gray-300 text-xs sm:text-sm font-medium">Photo</p>
                      <div className="flex mt-2 gap-2">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1">
                          <Eye size={12} /> View
                        </Button>
                        <Button className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1">
                          <Download size={12} /> Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Id Proof Card */}
                  <div className="border border-gray-600 rounded-lg p-2 sm:p-3">
                    <div className="bg-gray-700 p-3 sm:p-4 rounded-lg flex flex-col items-center justify-center h-32 sm:h-40">
                      <FileText size={32} className="text-gray-400 mb-2" />
                      <p className="text-gray-300 text-xs sm:text-sm font-medium">Id Proof</p>
                      <div className="flex mt-2 gap-2">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1">
                          <Eye size={12} /> View
                        </Button>
                        <Button className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1">
                          <Download size={12} /> Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* License Document */}
                  <div className="border border-gray-600 rounded-lg p-2 sm:p-3">
                    <div className="bg-gray-700 p-3 sm:p-4 rounded-lg flex flex-col items-center justify-center h-32 sm:h-40">
                      <FileText size={32} className="text-gray-400 mb-2" />
                      <p className="text-gray-300 text-xs sm:text-sm font-medium">License</p>
                      <div className="flex mt-2 gap-2">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1">
                          <Eye size={12} /> View
                        </Button>
                        <Button className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1">
                          <Download size={12} /> Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Other Documents */}
                  <div className="border border-gray-600 rounded-lg p-2 sm:p-3">
                    <div className="bg-gray-700 p-3 sm:p-4 rounded-lg flex flex-col items-center justify-center h-32 sm:h-40">
                      <FileText size={32} className="text-gray-400 mb-2" />
                      <p className="text-gray-300 text-xs sm:text-sm font-medium">Documents</p>
                      <div className="flex mt-2 gap-2">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1">
                          <Eye size={12} /> View
                        </Button>
                        <Button className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1">
                          <Download size={12} /> Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Custom scrollbar styles for dark theme */}
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
              onClick={() => setShowRejectModal(false)}
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
