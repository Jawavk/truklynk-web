import Button from '@/components/ui/form/Button';
import { Input } from '@/components/ui/form/Input';
import { ArrowRight, ChevronsRight, Upload } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react'
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { WebSocketService } from '@/services/WebSocketService';
import { useWebSocketFileUpload } from '@/hooks/useWebSocketFileUpload';
import { post } from '@/services/api/apiService';
import { toast } from 'react-hot-toast';
import { fetchCustomerData } from '@/store/slice/customerSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';

// Define validation schema
const customerSchema = z.object({
    customerName: z.string().min(1, { message: "Customer name is required" }),
    contactNumber: z.string()
        .min(10, { message: "Contact number must be at least 10 digits" })
        .regex(/^\d+$/, { message: "Contact number must contain only digits" }),
    email: z.string().email({ message: "Invalid email address" }),
});

export default function CustomerInformation() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const webSocketRef = useRef<WebSocketService | null>(null);
    const { uploadFiles, isUploading, uploadProgress, error: uploadError } = useWebSocketFileUpload();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUploadField, setCurrentUploadField] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    // Check if we're in edit mode and get customer data
    const editMode = location.state?.editMode || location.state?.isEditing || false;
    const customerData = location.state?.selectedCustomer || {};
    console.log("Customer Data:", customerData);
    console.log("Edit Mode:", editMode);

    // Initialize form with validation and default values
    const methods = useForm({
        resolver: zodResolver(customerSchema),
        defaultValues: editMode ? {
            customerName: customerData?.name || '',
            contactNumber: customerData?.phoneNumber || '',
            email: customerData?.email || '',
        } : {
            customerName: '',
            contactNumber: '',
            email: '',
        },
        mode: 'onBlur' // Validate on blur
    });

    // Store uploaded files data
    const [uploadedFiles, setUploadedFiles] = useState<{
        idProof: any | null,
        license: any | null,
        document: any | null
    }>({
        idProof: null,
        license: null,
        document: null
    });

    // Store file names for display
    const [fileNames, setFileNames] = useState({
        idProof: "",
        license: "",
        document: ""
    });

    // Helper function to extract filename from URL
    const getFileNameFromUrl = (url: string) => {
        if (!url) return '';

        // Try to extract filename from URL
        const urlParts = url.split('/');
        let fileName = urlParts[urlParts.length - 1];

        // Check if the filename contains encoded information
        if (fileName && fileName.includes('.')) {
            const parts = fileName ? fileName.split('.') : [];
            // If filename is like "file_xxx.application%2Fpdf", extract just the file ID part
            if (parts.length > 1 && parts[0] && parts[0].startsWith('file_')) {
                return parts[0];
            }
        }

        return fileName || 'Uploaded file';
    };

    // Initialize WebSocket connection
    useEffect(() => {
        const initWebSocket = async () => {
            try {
                const wsService = new WebSocketService();
                webSocketRef.current = wsService;
                await wsService.connect();
                console.log('WebSocket connected successfully');
            } catch (error) {
                console.error('Failed to connect to WebSocket:', error);
                toast.error('Failed to connect to file upload service');
            }
        };

        initWebSocket();

        // Cleanup on component unmount
        return () => {
            if (webSocketRef.current) {
                webSocketRef.current.close();
            }
        };
    }, []);

    // Initialize existing files for edit mode
    useEffect(() => {
        if (editMode && customerData) {
            console.log("Processing document files for edit mode");

            // First, check if documents is an array (as in your API response)
            const documentFiles = Array.isArray(customerData.documents)
                ? customerData.documents
                : (customerData.documents?.mediaList || []);

            console.log("Document files to process:", documentFiles);

            // Define a mapping from document_type or document_name to field names
            const documentTypeMapping = {
                // Map from document_name to field names
                'Insurance': 'idProof',
                'Driving License': 'license',
                'Rc': 'document',
                // You can add more mappings if needed
            };

            // Process each document
            documentFiles.forEach((file) => {
                // Try to determine document type based on document_name or other properties
                let fieldName = 'document'; // Default

                if (file.document_name && documentTypeMapping[file.document_name]) {
                    fieldName = documentTypeMapping[file.document_name];
                } else if (file.documentType) {
                    fieldName = file.documentType;
                }

                // Standardize file structure - adapt API response to component's expected format
                const standardizedFile = {
                    mediaUrl: file.media_url || file.mediaUrl,
                    contentType: file.content_type || file.contentType,
                    mediaType: file.media_type || file.mediaType || "document",
                    mediaSize: file.media_size || file.mediaSize,
                    azureId: file.azure_id || file.azureId || "",
                    mediaDetailSno: file.media_detail_sno || file.mediaDetailSno || null,
                    isUploaded: true
                };

                // Set file names for display - extract from URL
                setFileNames(prev => ({
                    ...prev,
                    [fieldName]: getFileNameFromUrl(standardizedFile.mediaUrl) || file.document_name || 'Uploaded file'
                }));

                // Store the file data
                setUploadedFiles(prev => ({
                    ...prev,
                    [fieldName]: standardizedFile
                }));

                console.log(`Set file for ${fieldName}:`, getFileNameFromUrl(standardizedFile.mediaUrl));
            });
        }
    }, [editMode, customerData]);

    useEffect(() => {
        dispatch(fetchCustomerData());
    }, [dispatch]);

    // Handle form submission
    const onSubmit = async (data) => {
        console.log("Form data:", data);

        if (isSubmitting) return; // Prevent multiple submissions
        setIsSubmitting(true);

        // If in edit mode, just navigate to home page regardless of form state
        if (editMode) {
            // Optional: show success toast before navigating
            toast.success('Returning to home page');
            // Navigate to home page
            navigate("/"); // Change this to your actual home page route
            return;
        }

        // For non-edit mode (NEXT button), continue with your existing logic
        // Check for form validation errors
        if (Object.keys(methods.formState.errors).length > 0) {
            toast.error('Please fix the form errors before submitting');
            setIsSubmitting(false);
            return;
        }

        try {
            // Prepare documents array for the API payload
            const documents: any = {
                mediaSno: customerData?.documents?.mediaSno || null,
                containerName: "documents",
                deleteMediaList: [],
                mediaList: []
            };

            // Add uploaded files to the mediaList
            Object.entries(uploadedFiles).forEach(([key, fileData]) => {
                if (fileData) {
                    documents.mediaList.push({
                        mediaUrl: fileData.mediaUrl,
                        contentType: fileData.contentType,
                        mediaType: fileData.mediaType || "document",
                        thumbnailUrl: fileData.thumbnailUrl || null,
                        mediaSize: fileData.mediaSize,
                        isUploaded: fileData.isUploaded || true,
                        azureId: fileData.azureId || "",
                        documentType: key,
                        mediaDetailSno: fileData.mediaDetailSno || null
                    });
                }
            });

            // Prepare the payload
            const payload: {
                name: string;
                country_code: number;
                mobile_no: string;
                email: string;
                documents: any;
                id?: string; // Optional id property
            } = {
                name: data.customerName,
                country_code: 91, // You might want to make this dynamic
                mobile_no: data.contactNumber,
                email: data.email,
                documents: documents
            };

            // Add ID if in edit mode
            if (editMode && customerData.id) {
                payload.id = customerData.id;
            }

            // Make API call to create customer
            const response = await post('admin/users', payload);
            console.log("Create response:", response);

            toast.success('Customer added successfully');
            navigate("/customerverification");
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('Failed to save customer information');
            setError(error instanceof Error ? error.message : 'An error occurred while submitting the form');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleButtonClick = () => {
        if (editMode) {
            navigate("/customerverification");
        } else {
            methods.handleSubmit(onSubmit)();
        }
    };

    const handleFileChange = async (fieldName, e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            setFileNames(prev => ({
                ...prev,
                [fieldName]: file.name
            }));
            setCurrentUploadField(fieldName);

            // Prepare additional data for the upload
            const additionalData = {
                userId: '123',
                documentType: fieldName,
            };

            try {
                // Use the hook to upload the file
                const result = await uploadFiles([file], additionalData);
                console.log(`File uploaded for ${fieldName}:`, result);

                if (result && Array.isArray(result) && result.length > 0) {
                    // Store the uploaded file data
                    setUploadedFiles(prev => ({
                        ...prev,
                        [fieldName]: result[0]
                    }));
                } else {
                    // If upload failed, clear the file name
                    setFileNames(prev => ({
                        ...prev,
                        [fieldName]: ""
                    }));
                    toast.error(`Failed to upload ${fieldName}`);
                }
            } catch (error) {
                console.error(`Error uploading ${fieldName}:`, error);
                setFileNames(prev => ({
                    ...prev,
                    [fieldName]: ""
                }));
                toast.error(`Failed to upload ${fieldName}`);
            } finally {
                // Reset the current upload field
                setCurrentUploadField("");
            }
        }
    };

    const clearFile = (fieldName) => {
        setFileNames(prev => ({
            ...prev,
            [fieldName]: ""
        }));

        setUploadedFiles(prev => ({
            ...prev,
            [fieldName]: null
        }));
    };

    return (
        <FormProvider {...methods}>
            <div className="bg-black min-h-screen flex flex-col">
                <div className="bg-black text-white p-4 flex items-center text-sm">
                    <span className="text-gray-400">Customer Verification</span>
                    <ChevronsRight className="w-4 h-4 mx-2" />
                    <span>{editMode ? 'Edit Customer' : 'Customer Information'}</span>
                </div>

                <div className="flex-1 px-8 pt-6 pb-4 text-white max-w-4xl mx-auto w-full">
                    <h1 className="text-3xl text-center font-normal mb-12">{editMode ? 'Edit Customer Information' : 'Customer Information'}</h1>

                    <div className="border-b border-gray-900 mb-6"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div>
                            <label className="block text-md font-medium text-gray-300 mb-2">Customer Name</label>
                            <div className="w-full">
                                <Controller
                                    name="customerName"
                                    control={methods.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Enter Customer Name"
                                            className={`w-full h-12 bg-black border ${methods.formState.errors.customerName ? 'border-red-500' : 'border-gray-800'} rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500`}
                                            name="customerName"
                                        />
                                    )}
                                />
                                {methods.formState.errors.customerName && (
                                    <p className="text-red-500 text-xs mt-1 ml-2">
                                        {methods.formState.errors.customerName?.message?.toString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-md font-medium text-gray-300 mb-2">Contact Number</label>
                            <div className="w-full">
                                <Controller
                                    name="contactNumber"
                                    control={methods.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Enter Contact Number"
                                            className={`w-full h-12 bg-black border ${methods.formState.errors.contactNumber ? 'border-red-500' : 'border-gray-800'} rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500`}
                                            name="contactNumber"
                                        />
                                    )}
                                />
                                {methods.formState.errors.contactNumber && (
                                    <p className="text-red-500 text-xs mt-1 ml-2">
                                        {methods.formState.errors.contactNumber?.message?.toString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-md font-medium text-gray-300 mb-2">Email</label>
                            <div className="w-full">
                                <Controller
                                    name="email"
                                    control={methods.control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="Enter Email"
                                            className={`w-full h-12 bg-black border ${methods.formState.errors.email ? 'border-red-500' : 'border-gray-800'} rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500`}
                                            name="email"
                                        />
                                    )}
                                />
                                {methods.formState.errors.email && (
                                    <p className="text-red-500 text-xs mt-1 ml-2">
                                        {methods.formState.errors.email?.message?.toString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-md font-medium text-gray-300 mb-2 flex items-center">
                                Upload Id Proof
                                <Upload className="w-4 h-4 ml-2" />
                            </label>
                            <div className="w-full">
                                {isUploading && currentUploadField === "idProof" ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="truncate">Uploading {fileNames.idProof}... {uploadProgress}%</span>
                                        <div className="ml-auto w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : fileNames.idProof || (uploadedFiles.idProof && uploadedFiles.idProof.mediaUrl) ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="truncate">{fileNames.idProof}</span>
                                        <Button
                                            className="ml-auto text-gray-400 hover:text-white"
                                            onClick={() => clearFile("idProof")}
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
                                            name="idProof"
                                            onChange={(e) => handleFileChange("idProof", e)}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-md font-medium text-gray-300 mb-2 flex items-center">
                                Upload License
                                <Upload className="w-4 h-4 ml-2" />
                            </label>
                            <div className="w-full">
                                {isUploading && currentUploadField === "license" ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="truncate">Uploading {fileNames.license}... {uploadProgress}%</span>
                                        <div className="ml-auto w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : fileNames.license || (uploadedFiles.license && uploadedFiles.license.mediaUrl) ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="truncate">{fileNames.license}</span>
                                        <Button
                                            className="ml-auto text-gray-400 hover:text-white"
                                            onClick={() => clearFile("license")}
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
                                            name="license"
                                            onChange={(e) => handleFileChange("license", e)}
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
                                {isUploading && currentUploadField === "document" ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="truncate">Uploading {fileNames.document}... {uploadProgress}%</span>
                                        <div className="ml-auto w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : fileNames.document || (uploadedFiles.document && uploadedFiles.document.mediaUrl) ? (
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

                    {error && (
                        <div className="bg-red-900 text-white p-3 rounded-md mt-4 mb-2 text-sm">
                            <p className="font-medium">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="flex justify-center mt-8">
                        <Button
                            className={`px-8 py-3 ${editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-full flex items-center transition-colors focus:outline-none ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={handleButtonClick}
                            disabled={isSubmitting || isUploading}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="animate-pulse">
                                        {editMode ? 'UPDATING...' : 'SUBMITTING...'}
                                    </span>
                                    <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </>
                            ) : (
                                <>
                                    {editMode ? 'UPDATE' : 'NEXT'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </FormProvider>
    );
}