import Button from '@/components/ui/form/Button';
import { Input } from '@/components/ui/form/Input';
import { Select } from '@/components/ui/form/Select';
import { useWebSocketFileUpload } from '@/hooks/useWebSocketFileUpload';
import { ArrowRight, ChevronsRight, Upload } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchServiceProviders } from '@/store/slice/serviceProviderSlice';
import { useDispatch, useSelector } from 'react-redux';
import { post } from '@/services/api/apiService';
import { fetchVehicles, UpdateVehicles } from '@/store/slice/vehicleSlice';

interface MediaItem {
    mediaDetailSno?: number | null;
    mediaSno?: number | null;
    mediaUrl: string;
    thumbnailUrl: string | null;
    mediaType: string;
    contentType: string;
    mediaSize: number;
    mediaDetailDescription?: string | null;
    azureId: string;
    isUploaded: boolean;
    documentType?: string;
}

interface VehicleData {
    id?: number;
    vehicle_sno?: number;
    service_provider_sno?: string;
    vehicle_name?: string;
    vehicle_model?: string;
    ton_capacity?: string;
    vehicle_number?: string;
    status?: number;
    media?: MediaItem[];
    documents?: {
        mediaSno?: number | null;
        containerName?: string;
        deleteMediaList?: number[];
        mediaList?: MediaItem[];
    };
}

export default function VehicleInformation() {
    const { uploadFiles, isUploading, error: uploadError } = useWebSocketFileUpload();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { data: serviceProviders, loading, error: serviceProviderError } = useSelector((state: any) => state.serviceProviders);

    const [showCustomModelInput, setShowCustomModelInput] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [fileNames, setFileNames] = useState({
        rcBook: '',
        insurance: '',
        document: ''
    });


    const editMode = location.state?.editMode || location.state?.isEditing || false;
    const vehicleData = location.state?.vehicleData || {};


    const bookingContext = location.state?.order || location.state?.orderData || null
    const fromOrderManagement = location.state?.fromOrderManagement || false
    const fromOrderAssignment = location.state?.fromOrderAssignment || false
    const sourceAction = location.state?.sourceAction || ""


    const isFromOrderFlow = fromOrderManagement || fromOrderAssignment
    const isAssignmentFlow = sourceAction === "assignVehicle" || fromOrderAssignment



  // Filter service providers based on booking context
  const getFilteredServiceProviders = () => {
    if (!serviceProviders || serviceProviders.length === 0) return []

    // If coming from a specific booking, filter by the booking's service provider
    if (isFromOrderFlow && bookingContext?.service_providers_sno) {
      return serviceProviders.filter(
        (provider: any) => provider.service_providers_sno === bookingContext.service_providers_sno,
      )
    }

    // Otherwise, return all service providers
    return serviceProviders
  }

  const filteredServiceProviders = getFilteredServiceProviders()


    console.log(vehicleData)

    const methods = useForm({
        defaultValues: {
            serviceProvider: '',
            vehicleCompany: '',
            vehicleModel: '',
            tonnesCapacity: '',
            numberPlate: '',
            customVehicleModel: ''
        }
    });



    useEffect(() => {
        console.log('Edit mode:', editMode, 'vehicleData:', vehicleData);
        dispatch(fetchVehicles() as any);

        if (isFromOrderFlow && bookingContext?.service_providers_sno) {
            methods.setValue("serviceProvider", bookingContext.service_providers_sno.toString())
      
            // Find the provider and auto-fill company name
            const selectedProvider = serviceProviders?.find(
              (provider: any) => provider.service_providers_sno === bookingContext.service_providers_sno,
            )
            if (selectedProvider?.company_name) {
              methods.setValue("vehicleCompany", selectedProvider.company_name)
            }
          }

        if (editMode && vehicleData) {
            methods.reset({
                serviceProvider: vehicleData.service_provider_sno || '',
                vehicleCompany: vehicleData.vehicle_name || '',
                vehicleModel: vehicleData.vehicle_model || '',
                tonnesCapacity: vehicleData.ton_capacity || '',
                numberPlate: vehicleData.vehicle_number || '',
                customVehicleModel: ''
            });

            const predefinedModels = ['TATA', 'Mahindra', 'Ashok Leyland'];
            if (vehicleData.vehicle_model && !predefinedModels.includes(vehicleData.vehicle_model)) {
                methods.setValue('vehicleModel', 'others');
                methods.setValue('customVehicleModel', vehicleData.vehicle_model);
                setShowCustomModelInput(true);
            }

            const newUploadedFiles: MediaItem[] = [];
            const newFileNames: { rcBook: string; insurance: string; document: string } = {
                rcBook: '',
                insurance: '',
                document: '',
            };

            if (vehicleData.media && Array.isArray(vehicleData.media)) {
                vehicleData.media.forEach((media, index) => {
                    const documentType = index === 0 ? 'rcBook' : index === 1 ? 'insurance' : 'document';
                    newUploadedFiles.push({
                        mediaUrl: media.mediaUrl || '',
                        contentType: media.contentType || '',
                        mediaType: media.mediaType || 'document',
                        thumbnailUrl: media.thumbnailUrl || media.mediaUrl || '',
                        mediaSize: media.mediaSize || 0,
                        isUploaded: true,
                        azureId: media.azureId || '',
                        documentType,
                        mediaDetailSno: media.mediaDetailSno || null,
                    });
                    newFileNames[documentType] = media.mediaUrl.split('/').pop() || `${documentType}_file`;
                });
            }

            console.log('newUploadedFiles:', newUploadedFiles);
            setUploadedFiles(newUploadedFiles);
            setFileNames(newFileNames);
        }
    }, [editMode, vehicleData, methods, dispatch, isFromOrderFlow, bookingContext, serviceProviders]);

    useEffect(() => {
        dispatch(fetchVehicles() as any);
        dispatch(fetchServiceProviders() as any)
    }, [dispatch]);

    const handleVehicleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setShowCustomModelInput(value === 'others');
    };

    const onSubmit = async (data: any) => {
        try {
            if (editMode && vehicleData) {
                const payload = {
                    vehicleSno: vehicleData.id || vehicleData.vehicle_sno,
                    serviceProviderSno: parseInt(data.serviceProvider),
                    subCategorySno: 3,
                    vehicleName: data.vehicleCompany,
                    status: vehicleData.status || 1,
                    vehicleModel: data.vehicleModel === 'others' ? data.customVehicleModel : data.vehicleModel,
                    tonCapacity: data.tonnesCapacity,
                    vehicleNumber: data.numberPlate,
                    documents: {
                        mediaSno: vehicleData.media[0]?.mediaSno || null,
                        containerName: 'documents',
                        deleteMediaList: [],
                        mediaList: uploadedFiles.map((file) => ({
                            mediaUrl: file.mediaUrl,
                            contentType: file.contentType,
                            mediaType: file.mediaType,
                            thumbnailUrl: file.thumbnailUrl || null,
                            mediaSize: file.mediaSize,
                            isUploaded: file.isUploaded,
                            azureId: file.azureId,
                            documentType: file.documentType,
                            mediaDetailSno: file.mediaDetailSno || null,
                        }))
                    }
                };
                console.log('Update Payload:', payload);

                await dispatch(UpdateVehicles(payload) as any);
                navigate('/vehicleverification');
            } else {
                // Create new vehicle
                const vehiclePayload = {
                  serviceProviderSno: Number.parseInt(data.serviceProvider),
                  subCategorySno: 3,
                  vehicleName: data.vehicleCompany,
                  vehicleModel: data.vehicleModel === "others" ? data.customVehicleModel : data.vehicleModel,
                  tonCapacity: data.tonnesCapacity,
                  vehicleNumber: data.numberPlate,
                  documents: {
                    mediaSno: null,
                    containerName: "documents",
                    deleteMediaList: [],
                    mediaList: uploadedFiles.map((file) => ({
                      mediaUrl: file.mediaUrl,
                      contentType: file.contentType,
                      mediaType: file.mediaType,
                      thumbnailUrl: file.thumbnailUrl,
                      mediaSize: file.mediaSize,
                      isUploaded: file.isUploaded,
                      azureId: file.azureId,
                      documentType: file.documentType,
                      mediaDetailSno: file.mediaDetailSno,
                    })),
                  },
                  status: 0, 
                }
        
                console.log("Create Vehicle Payload:", vehiclePayload)
        
                // Prepare the API call - include booking_sno if coming from order flow
                const apiPayload = {
                  vehicle: vehiclePayload,
                  ...(isFromOrderFlow &&
                    bookingContext?.service_booking_sno && {
                      booking_sno: bookingContext.service_booking_sno,
                    }),
                }
        
                console.log("API Payload:", apiPayload)
        
                // Call the modified createvehicle endpoint with better error handling
                try {
                  const response = await post("/users/createvehicles", apiPayload)
                  console.log("Vehicle created successfully:", response)
        
                  if (isFromOrderFlow && bookingContext?.service_booking_sno) {
                    // Navigate back to order management with success message
                    navigate("/order-management", {
                      state: {
                        message: "Vehicle created and assigned to booking successfully!",
                        type: "success",
                        refreshData: true,
                      },
                    })
                  } else {
                    navigate("/vehicleverification")
                  }
                } catch (apiError: any) {
                  console.error("API Error:", apiError)
        
                  // Handle different types of API errors
                  let errorMessage = "An error occurred while creating the vehicle."
        
                  if (apiError?.response?.data?.message) {
                    errorMessage = apiError.response.data.message
                  } else if (apiError?.response?.data?.error) {
                    errorMessage = apiError.response.data.error
                  } else if (apiError?.message) {
                    errorMessage = apiError.message
                  } else if (typeof apiError === "string") {
                    errorMessage = apiError
                  }
        
                  throw new Error(errorMessage)
                }
              }
        } catch (err) {
            console.error('Error submitting form:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while submitting the form.');
        }
    };


    const handleFileChange = async (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('handleFileChange called with fieldName:', fieldName);
        console.log('Current uploadedFiles:', uploadedFiles);
        console.log('vehicleData:', vehicleData);

        if (e.target.files && e.target.files.length > 0) {
            const files = e.target.files;
            const file = files[0];

            try {
                const additionalData = {
                    userId: '123',
                    documentType: fieldName,
                };

                const result = await uploadFiles(Array.from(files), additionalData);
                console.log('Upload success:', result);

                if (result && Array.isArray(result) && result.length > 0) {
                    const uploadedFile = result[0];

                    if (uploadedFile) {
                        // Map fieldName to index for vehicleData.media lookup
                        const documentTypeIndexMap: { [key: string]: number } = {
                            rcBook: 0,
                            insurance: 1,
                            document: 2,
                        };
                        const documentTypeIndex = documentTypeIndexMap[fieldName] ?? -1;

                        // Find the existing file in vehicleData.media by index or documentType
                        let existingFile: MediaItem | null = null;
                        if (documentTypeIndex >= 0 && vehicleData.media && vehicleData.media[documentTypeIndex]) {
                            existingFile = vehicleData.media[documentTypeIndex];
                        } else {
                            existingFile =
                                (vehicleData.media || []).find((m) => m.documentType === fieldName) ||
                                uploadedFiles.find((f) => f.documentType === fieldName) ||
                                null;
                        }

                        console.log('existingFile:', existingFile);

                        const newFile: MediaItem = {
                            mediaUrl: uploadedFile.mediaUrl || '',
                            contentType: uploadedFile.contentType || '',
                            mediaType: uploadedFile.contentType || 'document',
                            thumbnailUrl: uploadedFile.thumbnailUrl || uploadedFile.mediaUrl || '',
                            mediaSize: uploadedFile.mediaSize || 0,
                            isUploaded: uploadedFile.isUploaded || true,
                            azureId: uploadedFile.azureId || '',
                            documentType: fieldName,
                            mediaDetailSno: existingFile?.mediaDetailSno || null,
                        };

                        setUploadedFiles((prev) => {
                            const updatedFiles = prev.filter((f) => f.documentType !== fieldName);
                            const newUploadedFiles = [...updatedFiles, newFile];
                            console.log('New uploadedFiles:', newUploadedFiles);
                            return newUploadedFiles;
                        });

                        setFileNames((prev) => ({
                            ...prev,
                            [fieldName]: file?.name,
                        }));
                    }
                }
            } catch (err) {
                console.error('Upload failed:', err);
                setError(err instanceof Error ? err.message : 'File upload failed');
            }
        }
    };

    const clearFile = (fieldName: string) => {
        setFileNames((prev) => ({
            ...prev,
            [fieldName]: ''
        }));

        setUploadedFiles((prev) => prev.filter((file) => file.documentType !== fieldName));

        const fileInput = document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
        <FormProvider {...methods}>
            <div className="bg-black min-h-screen flex flex-col">
                {/* Navigation breadcrumbs */}
                <div className="bg-black text-white p-4 flex items-center text-sm">
                    <span className="text-gray-400">Vehicle Verification</span>
                    <ChevronsRight className="w-4 h-4 mx-2" />
                    <span>Vehicle Information</span>
                </div>

                {/* Main Content */}
                <div className="flex-1 px-8 pt-6 pb-4 text-white max-w-4xl mx-auto w-full">
                    <h1 className="text-3xl text-center font-normal mb-12">Vehicle Information</h1>

                    {/* Divider */}
                    <div className="border-b border-gray-900 mb-6"></div>

                    {loading && <div className="text-center py-4">Loading service providers...</div>}
                    {error && <div className="text-red-500 text-center py-4">Error loading service providers: {error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        {/* Row 1 */}
                        {/* <div>
                            <label className="block text-md font-medium text-gray-300 mb-2">Service Provider</label>
                            <div className="w-full">
                                <Select
                                    placeholder="Select Service Provider"
                                    options={(serviceProviders || []).map((provider: any) => ({
                                        value: provider.service_providers_sno.toString(),
                                        label: provider.company_name || `${provider.first_name || ''} ${provider.last_name || ''}`.trim(),
                                    }))}
                                    className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                                    {...methods.register("serviceProvider")}
                                    onChange={(e) => {
                                        methods.setValue("serviceProvider", e.target.value);
                                        // Find the selected provider
                                        const selectedProvider = serviceProviders?.find(
                                            (provider: any) => provider.service_providers_sno.toString() === e.target.value
                                        );

                                        // Auto-fill the vehicle company field with the company name
                                        if (selectedProvider && selectedProvider.company_name) {
                                            methods.setValue('vehicleCompany', selectedProvider.company_name);
                                        }
                                    }}
                                />
                            </div>
                        </div> */}

<div>
              <label className="block text-md font-medium text-gray-300 mb-2">
                Service Provider
                {fromOrderManagement && <span className="text-xs text-blue-400 ml-2">(Filtered by booking)</span>}
              </label>
              <div className="w-full">
                <Select
                  placeholder="Select Service Provider"
                  options={filteredServiceProviders.map((provider: any) => ({
                    value: provider.service_providers_sno.toString(),
                    label: provider.company_name || `${provider.first_name || ""} ${provider.last_name || ""}`.trim(),
                  }))}
                  className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                  {...methods.register("serviceProvider")}
                  onChange={(e) => {
                    methods.setValue("serviceProvider", e.target.value)
                    const selectedProvider = filteredServiceProviders?.find(
                      (provider: any) => provider.service_providers_sno.toString() === e.target.value,
                    )

                    if (selectedProvider && selectedProvider.company_name) {
                      methods.setValue("vehicleCompany", selectedProvider.company_name)
                    }
                  }}
                  disabled={fromOrderManagement && filteredServiceProviders.length === 1}
                />
              </div>
            </div>

                        <div>
                            <label className="block text-md font-medium text-gray-300 mb-2">Vehicle Company</label>
                            <div className="w-full">
                                <Input
                                    type="text"
                                    placeholder="Auto-filled from Service Provider"
                                    className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                                    readOnly
                                    {...methods.register("vehicleCompany")}
                                />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div>
                            <label className="block text-md font-medium text-gray-300 mb-2">Vehicle Model</label>
                            <div className="w-full">
                                <Select
                                    placeholder="Select Vehicle Model"
                                    options={[
                                        { value: 'Select Vehicle', label: 'Select Vehicle' },
                                        { value: 'TATA', label: 'TATA' },
                                        { value: 'Mahindra', label: 'Mahindra' },
                                        { value: 'Ashok Leyland', label: 'Ashok Leyland' },
                                        { value: 'others', label: 'Others' }
                                    ]}
                                    className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                                    {...methods.register("vehicleModel")}
                                    onChange={(e) => {
                                        methods.setValue("vehicleModel", e.target.value);
                                        handleVehicleModelChange(e);
                                    }}
                                />
                            </div>
                            {showCustomModelInput && (
                                <div className="mt-2">
                                    <Input
                                        type="text"
                                        placeholder="Enter Custom Vehicle Model"
                                        className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                                        {...methods.register("customVehicleModel")}
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-md font-medium text-gray-300 mb-2">Tonnes Capacity</label>
                            <div className="w-full">
                                <Select
                                    placeholder="Select Tonnes Capacity"
                                    options={[
                                        { value: 'E.g. 5 Tons', label: 'E.g. 5 Tons' },
                                        { value: '10 Tons', label: '10 Tons' },
                                        { value: '15 Tons', label: '15 Tons' },
                                        { value: '20 Tons', label: '20 Tons' }
                                    ]}
                                    className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                                    {...methods.register("tonnesCapacity")}
                                />
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div>
                            <label className="block text-md font-medium text-gray-300 mb-2">Number Plate</label>
                            <div className="w-full">
                                <Input
                                    type="text"
                                    placeholder="Enter Number Plate"
                                    className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                                    {...methods.register("numberPlate")}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-md font-medium text-gray-300 mb-2 flex items-center">
                                Upload RC Book
                                <Upload className="w-4 h-4 ml-2" />
                            </label>
                            <div className="w-full">
                                {fileNames.rcBook ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="truncate">{fileNames.rcBook}</span>
                                        <Button
                                            className="ml-auto text-gray-400 hover:text-white"
                                            onClick={() => clearFile("rcBook")}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ) : (
                                    <label className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-gray-400 text-sm flex items-center cursor-pointer hover:border-gray-600">
                                        Choose file
                                        <Input
                                            type="file"
                                            className="hidden"
                                            name="rcBook"
                                            onChange={(e) => handleFileChange("rcBook", e)}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Row 4 */}
                        <div>
                            <label className="text-md font-medium text-gray-300 mb-2 flex items-center">
                                Upload Insurance
                                <Upload className="w-4 h-4 ml-2" />
                            </label>
                            <div className="w-full">
                                {fileNames.insurance ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="truncate">{fileNames.insurance}</span>
                                        <Button
                                            className="ml-auto text-gray-400 hover:text-white"
                                            onClick={() => clearFile("insurance")}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ) : (
                                    <label className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-gray-400 text-sm flex items-center cursor-pointer hover:border-gray-600">
                                        Choose file
                                        <Input
                                            type="file"
                                            className="hidden"
                                            name="insurance"
                                            onChange={(e) => handleFileChange("insurance", e)}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-md font-medium text-gray-300 mb-2 flex items-center">
                                Upload Document
                                <Upload className="w-4 h-4 ml-2" />
                            </label>
                            <div className="w-full">
                                {fileNames.document ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="truncate">{fileNames.document}</span>
                                        <Button
                                            className="ml-auto text-gray-400 hover:text-white"
                                            onClick={() => clearFile("document")}
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ) : (
                                    <label className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-gray-400 text-sm flex items-center cursor-pointer hover:border-gray-600">
                                        Choose file
                                        <Input
                                            type="file"
                                            className="hidden"
                                            name="document"
                                            onChange={(e) => handleFileChange("document", e)}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Display upload errors if any */}
                    {uploadError && (
                        <div className="text-red-500 text-center mt-4">
                            Error uploading files: {uploadError}
                        </div>
                    )}

                    {/* Button Row - Update button for edit mode */}
                    <div className="flex justify-center mt-8">
                        <Button
                            className={`px-8 py-3 ${editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-full flex items-center transition-colors focus:outline-none`}
                            onClick={methods.handleSubmit(onSubmit)}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : editMode ? 'UPDATE' : 'NEXT'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </FormProvider>
    );
}