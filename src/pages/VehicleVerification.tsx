import { useEffect, useState } from "react"
import { PencilLine, Trash2, FileText, Eye, Download } from "lucide-react"
import Button from "@/components/ui/form/Button"
import { FormProvider, useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { Modal } from "@/components/ui/layout/Modal"
import { Card } from "@/components/ui/layout/Card"
import Table from "@/components/ui/table"
import { get } from "@/services/api/apiService"

interface MediaItem {
  azureId: string
  mediaSno: number
  mediaUrl: string
  mediaSize: number
  mediaType: string
  isUploaded: boolean
  contentType: string
  thumbnailUrl: string | null
  mediaDetailSno: number
  mediaDetailDescription: string | null
  type?: string
}

interface VehicleData {
  rto: string | null
  media: MediaItem[]
  documents?: any[] | null
  state: string | null
  status: number
  updated_on: string
  vehicle_sno: number
  vehicle_name: string
  vehicle_model: string
  vehicle_number: string
  sub_category_sno: number
  service_provider_sno: number
  distance_from_reference: string | null
  ton_capacity: string | null // Explicitly added
}

interface ApiResponse {
  data: Array<{
    getvehicles: VehicleData[]
  }>
}

const VehicleVerification = () => {
  const methods = useForm({
    defaultValues: {
      search: "",
    },
  })

  const location = useLocation()
  const navigate = useNavigate()

  const [vehiclesData, setVehiclesData] = useState<VehicleData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showViewModal, setShowViewModal] = useState(false)
  const [vehicleToView, setVehicleToView] = useState<VehicleData | null>(null)
  const orderData = location.state?.order
  const fromOrderManagement = location.state?.fromOrderManagement
  const sourceAction = location.state?.sourceAction

  useEffect(() => {
    const fetchVehiclesData = async () => {
      try {
        setLoading(true)
        const response: any = await get<ApiResponse>("/serviceproviders/vehicle")

        if (response && response.data && response.data.length > 0 && response.data[0].getvehicles) {
          setVehiclesData(response.data[0].getvehicles)
        } else {
          setError("Failed to fetch vehicles data")
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err)
        setError("An error occurred while fetching vehicles")
      } finally {
        setLoading(false)
      }
    }

    fetchVehiclesData()
  }, [])

  const [vehicleStatuses, setVehicleStatuses] = useState<string[]>(() => {
    const savedStatuses = localStorage.getItem("vehicleStatuses")
    if (savedStatuses) {
      return JSON.parse(savedStatuses)
    } else {
      return []
    }
  })

  useEffect(() => {
    if (vehiclesData.length > 0) {
      const currentLength = vehicleStatuses.length
      const dataLength = vehiclesData.length

      if (dataLength > currentLength) {
        const newStatuses = [...vehicleStatuses, ...Array(dataLength - currentLength).fill("pending")]
        setVehicleStatuses(newStatuses)
        localStorage.setItem("vehicleStatuses", JSON.stringify(newStatuses))
      }
    }
  }, [vehiclesData, vehicleStatuses])

  const handleVerify = (index: number) => {
    const updatedStatuses = [...vehicleStatuses]
    updatedStatuses[index] = "verified"
    setVehicleStatuses(updatedStatuses)
    localStorage.setItem("vehicleStatuses", JSON.stringify(updatedStatuses))
  }

  const handleReject = (index: number) => {
    const updatedStatuses = [...vehicleStatuses]
    updatedStatuses[index] = "rejected"
    setVehicleStatuses(updatedStatuses)
    localStorage.setItem("vehicleStatuses", JSON.stringify(updatedStatuses))
  }

  const handleEditVehicle = (vehicle: VehicleData) => {
    navigate("/vehicleinformation", {
      state: {
        vehicleData: {
          id: vehicle.vehicle_sno,
          service_provider_sno: vehicle.service_provider_sno,
          vehicle_name: vehicle.vehicle_name,
          vehicle_model: vehicle.vehicle_model || "",
          vehicle_number: vehicle.vehicle_number,
          ton_capacity: vehicle.ton_capacity || "", // Ensure ton_capacity is passed
          status: vehicle.status,
          media: vehicle?.media || [],
          documents: Array.isArray(vehicle?.documents) && vehicle.documents.length > 0 ? vehicle.documents[0] : {},
        },
        editMode: true,
      },
    })
  }

  // const handleCreateClick = () => {
  //   const navigationState: any = {}

  //   if (fromOrderManagement && orderData && sourceAction === "assignVehicle") {
  //     navigationState.fromOrderAssignment = true
  //     navigationState.orderData = orderData
  //   }

  //   navigate("/vehicleinformation", { state: navigationState })
  // }


  const handleCreateClick = () => {
    const navigationState: any = {}

    if (fromOrderManagement && orderData && sourceAction === "assignVehicle") {
      // Coming from OrderManagement to assign vehicle to booking
      navigationState.fromOrderAssignment = true
      navigationState.orderData = orderData
      navigationState.fromOrderManagement = true
      navigationState.sourceAction = "assignVehicle"
    } else {
      // Normal vehicle creation from VehicleVerification
      navigationState.fromOrderManagement = false
      navigationState.editMode = false
      navigationState.isEditing = false
      navigationState.sourceAction = "createVehicle"
      navigationState.vehicleData = null
      navigationState.order = null
    }

    console.log("Navigation state:", navigationState)
    navigate("/vehicleinformation", { state: navigationState })
  }


  const handleViewClick = (vehicle: VehicleData) => {
    setVehicleToView(vehicle)
    setShowViewModal(true)
  }

  useEffect(() => {
    if (location.state?.editedVehicle) {
      const editedId = location.state.editedVehicle.id
      const index = vehiclesData.findIndex((vehicle) => vehicle.vehicle_sno === editedId)
      if (index !== -1 && vehicleStatuses[index] !== "verified") {
        const updatedStatuses = [...vehicleStatuses]
        updatedStatuses[index] = "verified"
        setVehicleStatuses(updatedStatuses)
        localStorage.setItem("vehicleStatuses", JSON.stringify(updatedStatuses))
      }
    }
  }, [location, vehiclesData, vehicleStatuses])

  const totalVehicles = vehiclesData.length || 0
  const verifiedCount = vehiclesData.filter((vehicle) => vehicle.status === 1).length
  const pendingCount = vehiclesData.filter((vehicle) => vehicle.status === 0).length

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-black text-white p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-medium mb-4 sm:mb-6">Vehicle Verification</h1>

        <div className="flex flex-col sm:flex-row justify-start mb-4 sm:mb-6 gap-3 sm:gap-5">
          <Card className="w-full sm:w-72 h-auto sm:h-24 bg-amber-900 hover:bg-gray-800 text-black rounded-md p-4">
            <h1 className="text-base sm:text-lg text-white font-medium">Total Vehicle</h1>
            <p className="text-white text-xl sm:text-2xl font-bold mt-2">{totalVehicles}</p>
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
                  data={vehiclesData.map((vehicle, index) => ({
                    id: vehicle.vehicle_sno,
                    updated_on: vehicle.updated_on,
                    vehicle_name: vehicle.vehicle_name,
                    vehicle_model: vehicle.vehicle_model || "N/A",
                    vehicle_number: vehicle.vehicle_number,
                    status: vehicle.status,
                    index: index,
                    originalData: vehicle,
                  }))}
                  columns={[
                    {
                      key: "updated_on",
                      header: "Updated On",
                      sortable: true,
                      headerClassName: "pl-4",
                    },
                    {
                      key: "vehicle_name",
                      header: "Vehicle Name",
                      sortable: true,
                      headerClassName: "pl-4",
                    },
                    {
                      key: "vehicle_model",
                      header: "Vehicle Model",
                      sortable: true,
                      headerClassName: "pl-4",
                    },
                    {
                      key: "vehicle_number",
                      header: "Vehicle Number",
                      sortable: true,
                      headerClassName: "pl-4",
                    },
                  ]}
                  customCellRender={(row, key) => {
                    if (key === "updated_on") {
                      const date = new Date(row.updated_on)
                      return <span className="text-sm sm:text-base pl-4">{date.toLocaleDateString()}</span>
                    }
                    if (key === "vehicle_name" || key === "vehicle_model" || key === "vehicle_number") {
                      return <span className="text-sm sm:text-base pl-4">{row[key]}</span>
                    }
                    return row[key]
                  }}
                  actions={[
                    {
                      label: "Action",
                      render: (row) => {
                        const isMobile = typeof window !== "undefined" && window.innerWidth < 768

                        return (
                          <div className="flex overflow-x-auto no-scrollbar py-1 -mx-2 px-2">
                            <div className="flex flex-nowrap gap-1 sm:gap-2 min-w-max">
                              {row.status === 1 && (
                                <>
                                  <Button
                                    className="bg-transparent text-white border border-gray-700 w-auto sm:w-24 text-xs sm:text-sm font-medium px-1 sm:px-4 py-1 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2"
                                    onClick={() => handleEditVehicle(row.originalData)}
                                  >
                                    <PencilLine className="h-3 w-3 sm:h-5 sm:w-4 text-white" />
                                    {!isMobile && <span>EDIT</span>}
                                  </Button>
                                  <Button
                                    className="text-white border border-gray-700 rounded-lg px-1 sm:px-2 py-1 sm:py-2 flex items-center justify-center"
                                    onClick={() => {
                                      console.log("Delete vehicle", row.index)
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
                  createButtonText={window.innerWidth < 768 ? "ADD VEHICLE" : "ADD NEW VEHICLE"}
                  // onCreateClick={() => navigate("/vehicleinformation")}
                  onCreateClick={handleCreateClick}
                  downloadOptions={{
                    filename: "vehicles.csv",
                    headers: [
                      { label: "Updated On", key: "updated_on" },
                      { label: "Vehicle Name", key: "vehicle_name" },
                      { label: "Vehicle Model", key: "vehicle_model" },
                      { label: "Vehicle Number", key: "vehicle_number" },
                    ],
                  }}
                  emptyStateMessage="No vehicles available"
                />
              </div>
            </div>
          )}

          <Modal className="max-h-screen bg-gray-800" isOpen={showViewModal} onClose={() => setShowViewModal(false)}>
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900 sticky top-0 z-10">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Vehicle Details</h2>
            </div>
            {vehicleToView && (
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-120px)] custom-scrollbar bg-gray-800">
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Information:</h3>
                  <div className="bg-gray-700 p-3 sm:p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Vehicle Name</p>
                        <p className="text-gray-400 text-sm sm:text-base">{vehicleToView.vehicle_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Vehicle Model</p>
                        <p className="text-gray-400 text-sm sm:text-base">{vehicleToView.vehicle_model || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Vehicle Number</p>
                        <p className="text-gray-400 text-sm sm:text-base">{vehicleToView.vehicle_number}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Tonnes Capacity</p>
                        <p className="text-gray-400 text-sm sm:text-base">{vehicleToView.ton_capacity || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Updated On</p>
                        <p className="text-gray-400 text-sm sm:text-base">
                          {new Date(vehicleToView.updated_on).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-xs sm:text-sm font-medium">Service Provider ID</p>
                        <p className="text-gray-400 text-sm sm:text-base">{vehicleToView.service_provider_sno}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Uploads:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {vehicleToView.media && vehicleToView.media.length > 0 ? (
                      vehicleToView.media.map((mediaItem, index) => (
                        <div key={index} className="border border-gray-600 rounded-lg p-2 sm:p-3">
                          <div className="bg-gray-700 p-3 sm:p-4 rounded-lg flex flex-col items-center justify-center h-32 sm:h-40">
                            {mediaItem.mediaType.includes("image") || mediaItem.contentType.includes("image") ? (
                              <img
                                src={mediaItem.mediaUrl || "/placeholder.svg"}
                                alt={`Document ${index + 1}`}
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
                            <p className="text-gray-300 text-xs sm:text-sm font-medium">
                              {mediaItem.type || `Document ${index + 1}`}
                            </p>
                            <div className="flex mt-2 gap-2">
                              <a
                                href={mediaItem.mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 sm:px-3 py-1 rounded flex items-center gap-1"
                              >
                                <Eye size={12} /> View
                              </a>
                              <a
                                href={mediaItem.mediaUrl}
                                download
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
                        No documents available for this vehicle
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
      </div>
    </FormProvider>
  )
}

export default VehicleVerification
