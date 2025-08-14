import React, { useState, useEffect } from 'react';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowRight, ChevronsRight, Upload, UserCircle } from 'lucide-react';
import Button from '@/components/ui/form/Button';
import { Input } from '@/components/ui/form/Input';
import { Select } from '@/components/ui/form/Select';
import { post } from '@/services/api/apiService';
import { fetchServiceProviders } from '@/store/slice/serviceProviderSlice';
import { useWebSocketFileUpload } from '@/hooks/useWebSocketFileUpload';
import { fetchDrivers, UpdateDrivers } from '@/store/slice/driverSlice';
import { AppDispatch } from '@/store/store';

interface DriverFormData {
    driverName: string;
    driverSno: string;
    serviceProvider: string;
    contactNumber: string;
    profileSno: string;
}


interface FileNames {
    idProof: string;
    license: string;
    document: string;
    profilePhoto: string;
  }
  
interface MediaItem {
    mediaDetailSno?: number | null;
    mediaSno?: number | null;
    mediaUrl: string;
    thumbnailUrl: string | null;
    mediaType: string;
    contentType: string | undefined; // Allow undefined
    mediaSize: number;
    mediaDetailDescription?: string | null;
    azureId: string;
    isUploaded: boolean;
    documentType?: string;
  }

interface DriverData {
    driverName: string;
    driverSno: string;
    serviceProvider: string;
    contactNumber: string;
    profileSno: string;
    profileMedia: MediaItem[] | null;
    licenceMedia: MediaItem[] | null;
}

export default function DriverInformation() {
    const { uploadFiles, isUploading, error: uploadError } = useWebSocketFileUpload();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [profileFileChanged, setProfileFileChanged] = useState(false);
    const [idProofFileChanged, setIdProofFileChanged] = useState(false);
    const [licenseFileChanged, setLicenseFileChanged] = useState(false);
    const [documentFileChanged, setDocumentFileChanged] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<MediaItem[]>([]);
    const editMode = location.state?.editMode || location.state?.isEditing || false;
    const { driver } = location.state || {};
    const { data: serviceProviders, loading: serviceProvidersLoading, error: serviceProvidersError } = useSelector(
        (state: any) => state.serviceProviders
    );

    const methods = useForm<DriverData>({
        defaultValues: {
            driverName: '',
            driverSno: '',
            serviceProvider: '',
            contactNumber: '',
            profileSno: '',
            profileMedia: null,
            licenceMedia: null,
        },
        mode: 'onChange',
    });

    const { reset } = methods;



    useEffect(() => {
        dispatch(fetchServiceProviders() as any);
        dispatch(fetchDrivers({}));
    }, [dispatch]);

    useEffect(() => {
        if (editMode && driver) {
            reset({
                driverName: driver.driver_name || '',
                driverSno: driver.driver_sno || '',
                serviceProvider: String(driver.service_providers_sno || ''),
                contactNumber: driver.driver_mobile_number || '',
                profileSno: String(driver.profile_sno || ''),
                profileMedia: driver.profile_media || null,
                licenceMedia: driver.licence_media || null,
            });

            const newUploadedFiles: MediaItem[] = [];
            const newFileNames: FileNames = {
                idProof: '',
                license: '',
                document: '',
                profilePhoto: '',
              };

            if (driver.profile_media && Array.isArray(driver.profile_media) && driver.profile_media.length > 0) {
                const profileMedia = driver.profile_media[0];
                setProfilePhotoPreview(profileMedia.mediaUrl);
                newUploadedFiles.push({
                    ...profileMedia,
                    documentType: 'profilePhoto',
                });
                newFileNames.profilePhoto = getFileNameFromUrl(profileMedia.mediaUrl) || '';
            }

            if (driver.licence_media && Array.isArray(driver.licence_media)) {
                driver.licence_media.forEach((media, index) => {
                    const documentType = getDocumentType(index);
                    if (documentType) {
                        newUploadedFiles.push({
                            ...media,
                            documentType,
                            mediaDetailSno: media.mediaDetailSno || null,
                            mediaSno: media.mediaSno || null
                        });
                        newFileNames[documentType] = getFileNameFromUrl(media.mediaUrl) || '';
                    }
                });
            }

            setUploadedFiles(newUploadedFiles);
            setFileNames(newFileNames);
        }
    }, [driver, editMode, reset]);

    const getDocumentType = (index: number): string => {
        switch (index) {
            case 0:
                return 'idProof';
            case 1:
                return 'license';
            case 2:
                return 'document';
            default:
                return '';
        }
    };

    const getFileNameFromUrl = (url: string) => {
        if (!url) return '';
        const parts = url.split('/');
        return parts[parts.length - 1];
    };

    const [fileNames, setFileNames] = useState<FileNames>({
        idProof: '',
        license: '',
        document: '',
        profilePhoto: '',
      });

    const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (name: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const additionalData = {
            userId: '123',
            documentType: name,
        };
    
        if (event.target.files && event.target.files.length > 0) {
            const files = event.target.files;
            const file = files[0];
    
            if (name === 'profilePhoto' && file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target && typeof e.target.result === 'string') {
                    setProfilePhotoPreview(e.target.result);
                    setProfileFileChanged(true);
                  }
                };
                reader.readAsDataURL(file);
              } else if (name === 'idProof') {
                setIdProofFileChanged(true);
            } else if (name === 'license') {
                setLicenseFileChanged(true);
            } else if (name === 'document') {
                setDocumentFileChanged(true);
            }
    
            try {
                const result = await uploadFiles(Array.from(files), additionalData);
                if (result && Array.isArray(result) && result.length > 0) {
                    const uploadedFile = result[0];
                    if (uploadedFile) {
                        // Map name to index for driver.licence_media lookup
                        const documentTypeIndexMap = {
                            idProof: 0,
                            license: 1,
                            document: 2,
                            profilePhoto: -1,
                        };
                        const documentTypeIndex = documentTypeIndexMap[name] ?? -1;
    
                        // Find the existing file in driver.licence_media by index or documentType
                        let existingFile: MediaItem | null = null;
                        if (!driver) {
                          existingFile = uploadedFiles.find((f: MediaItem) => f.documentType === name) || null;
                        } else if (documentTypeIndex >= 0 && driver.licence_media && driver.licence_media[documentTypeIndex]) {
                          existingFile = driver.licence_media[documentTypeIndex];
                        } else {
                          existingFile =
                            (driver.licence_media || []).find((m: MediaItem) => m.documentType === name) ||
                            uploadedFiles.find((f: MediaItem) => f.documentType === name) ||
                            null;
                        }
    
                        const newFile: MediaItem = {
                            mediaUrl: uploadedFile.mediaUrl || '', // Fallback to empty string
                            contentType: uploadedFile.contentType,
                            mediaType: uploadedFile.contentType || 'application/octet-stream', // From previous fix
                            thumbnailUrl: uploadedFile.thumbnailUrl || null,
                            mediaSize: uploadedFile.mediaSize || 0, // Fallback to 0
                            isUploaded: uploadedFile.isUploaded ?? false, // Fallback to false
                            azureId: uploadedFile.azureId ?? '',
                            documentType: name,
                            mediaDetailSno: existingFile?.mediaDetailSno || null,
                          };
    
                        setUploadedFiles((prev) => {
                            const updatedFiles = prev.filter((f) => f.documentType !== name); // Filter by `name`
                            const newUploadedFiles = [...updatedFiles, newFile];
                            console.log('New uploadedFiles:', newUploadedFiles); // Log the new state
                            return newUploadedFiles;
                        });
    
                        setFileNames((prev) => ({
                            ...prev,
                            [name]: file?.name,
                        }));
                    }
                }
            } catch (err) {
                console.error('Upload failed:', err);
                setError(err instanceof Error ? err.message : 'File upload failed');
            }
        }
    };

    const clearFile = (name: string) => {
        setFileNames((prev) => ({
            ...prev,
            [name]: '',
        }));

        setUploadedFiles((prev) => prev.filter((file) => file.documentType !== name));
        

        if (name === 'profilePhoto') {
            setProfilePhotoPreview(null);
            setProfileFileChanged(true);
        }
        if (name === 'idProof') setIdProofFileChanged(true);
        if (name === 'license') setLicenseFileChanged(true);
        if (name === 'document') setDocumentFileChanged(true);

        
        const fileInput = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

const onSubmit = async (data: DriverFormData) => {
    try {
        setIsSubmitting(true);

        if (editMode) {
            const { driver_sno, service_providers_sno } = driver;
            const hasFileChanged = licenseFileChanged || idProofFileChanged || documentFileChanged || profileFileChanged;

            const profileMediaPayload = {
                mediaSno: driver.profile_media?.[0]?.mediaSno || null,
                containerName: 'profileImage',
                deleteMediaList: profileFileChanged
                    ? (driver.profile_media || [])
                          .map((m) => m.mediaDetailSno)
                          .filter((sno): sno is number => sno != null)
                    : [],
                mediaList: profileFileChanged
                    ? uploadedFiles
                          .filter((file) => file.documentType === 'profilePhoto')
                          .map((file) => ({
                              mediaUrl: file.mediaUrl,
                              contentType: file.contentType,
                              mediaType: file.contentType,
                              thumbnailUrl: file.thumbnailUrl || null,
                              mediaSize: file.mediaSize,
                              isUploaded: file.isUploaded,
                              azureId: file.azureId,
                              documentType: file.documentType,
                              mediaDetailSno: file.mediaDetailSno || null,
                          }))
                    : driver.profile_media || [],
            };

            const licenceMediaPayload = {
                mediaSno: driver.licence_media?.[0]?.mediaSno || null,
                containerName: 'licenceImage',
                deleteMediaList: hasFileChanged
                    ? (driver.licence_media || [])
                          .map((m) => m.mediaDetailSno)
                          .filter((sno): sno is number => sno != null)
                    : [],
                mediaList: hasFileChanged
                    ? uploadedFiles
                          .filter((file) => ['idProof', 'license', 'document'].includes(file.documentType || ''))
                          .map((file) => ({
                              mediaUrl: file.mediaUrl,
                              contentType: file.contentType,
                              mediaType: file.contentType,
                              thumbnailUrl: file.thumbnailUrl || null,
                              mediaSize: file.mediaSize,
                              isUploaded: file.isUploaded,
                              azureId: file.azureId,
                              documentType: file.documentType,
                              mediaDetailSno: file.mediaDetailSno || null,
                          }))
                    : driver.licence_media || [],
            };

            const payload = {
                driverSno: driver_sno,
                driverName: data.driverName,
                driverMobileNumber: parseInt(data.contactNumber), // Convert string to number
                serviceProviderSno: service_providers_sno,
                activeFlag: true,
                profileSno: profileMediaPayload,
                licenceSno: licenceMediaPayload,
              };


            await dispatch(UpdateDrivers(payload));
            navigate('/driververification');
        } else {
                const payload = {
                    driverName: data.driverName,
                    driverMobileNumber: data.contactNumber,
                    serviceProvidersSno: parseInt(data.serviceProvider),
                    activeFlag: true,
                    profileSno: {
                        mediaSno: null,
                        containerName: 'profileImage',
                        deleteMediaList: [],
                        mediaList: uploadedFiles
                            .filter(file => file.documentType === 'profilePhoto')
                            .map(file => ({
                                mediaUrl: file.mediaUrl,
                                contentType: file.contentType,
                                mediaType: file.contentType,
                                thumbnailUrl: file.thumbnailUrl || null,
                                mediaSize: file.mediaSize,
                                isUploaded: file.isUploaded,
                                azureId: file.azureId,
                                documentType: file.documentType,
                                mediaDetailSno: file.mediaDetailSno || null,
                            }))
                    },
                    licenceSno: {
                        mediaSno: null,
                        containerName: 'licenceImage',
                        deleteMediaList: [],
                        mediaList: uploadedFiles
                            .filter(file => ['idProof', 'license', 'document'].includes(file.documentType || ''))
                            .map(file => ({
                                mediaUrl: file.mediaUrl,
                                contentType: file.contentType,
                                mediaType: file.contentType,
                                thumbnailUrl: file.thumbnailUrl || null,
                                mediaSize: file.mediaSize,
                                isUploaded: file.isUploaded,
                                azureId: file.azureId,
                                documentType: file.documentType,
                                mediaDetailSno: file.mediaDetailSno || null,
                            }))
                    }
                };

                await post('/users/createdriver', payload);
                navigate('/driververification');
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            setError(err instanceof Error ? err.message : 'An error occurred while submitting the form.');
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="bg-black min-h-screen flex flex-col">
                <div className="bg-black text-white p-4 flex items-center text-sm">
                    <span className="text-gray-400">Driver Verification</span>
                    <ChevronsRight className="w-4 h-4 mx-2" />
                    <span>{editMode ? 'Edit Driver' : 'Driver Information'}</span>
                </div>

                <div className="flex-1 px-8 pt-6 pb-4 text-white max-w-4xl mx-auto w-full">
                    <h1 className="text-3xl text-center font-normal mb-12">
                        {editMode ? 'Edit Driver Information' : 'Driver Information'}
                    </h1>

                    <div className="border-b border-gray-900 mb-6"></div>

                    <div className="flex justify-center -mb-6 relative py-4 z-10">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-2 border-gray-700 flex items-center justify-center overflow-hidden bg-gray-900">
                                {profilePhotoPreview ? (
                                    <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle className="w-16 h-16 text-gray-600" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-red-600 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors">
                                <Upload className="w-4 h-4 text-white" />
                                <Input
                                    type="file"
                                    className="hidden"
                                    name="profilePhoto"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('profilePhoto', e)}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 py-4 gap-y-5">
                        <div>
                            <label className="block text-md font-medium text-gray-300 mb-2">Driver Name</label>
                            <Controller
                                name="driverName"
                                control={methods.control}
                                rules={{ required: 'Driver name is required' }}
                                render={({ field, fieldState: { error } }) => (
                                    <>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Enter Driver Name"
                                            className={`w-full h-12 bg-black border ${error ? 'border-red-500' : 'border-gray-800'} rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500`}
                                        />
                                        {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                                    </>
                                )}
                            />
                        </div>

                        <div>
                            <label className="block text-md font-medium text-gray-300 mb-2">Service Provider</label>
                            <Controller
                                name="serviceProvider"
                                control={methods.control}
                                rules={{ required: 'Service provider is required' }}
                                render={({ field, fieldState: { error } }) => (
                                    <>
                                        <Select
                                            {...field}
                                            placeholder={serviceProvidersLoading ? 'Loading...' : 'Select Service Provider'}
                                            options={(serviceProviders || []).map((provider: any) => ({
                                                value: provider.service_providers_sno.toString(),
                                                label: provider.company_name || `${provider.first_name || ''} ${provider.last_name || ''}`.trim(),
                                            }))}
                                            className={`w-full h-12 bg-black border ${error ? 'border-red-500' : 'border-gray-800'} rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500`}
                                            disabled={serviceProvidersLoading}
                                        />
                                        {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                                    </>
                                )}
                            />
                        </div>

                        <div>
                            <label className="block text-md font-medium text-gray-300 mb-2">Contact Number</label>
                            <Controller
                                name="contactNumber"
                                control={methods.control}
                                rules={{
                                    required: 'Contact number is required',
                                    pattern: {
                                        value: /^[0-9]{10}$/,
                                        message: 'Please enter a valid 10-digit phone number',
                                    },
                                }}
                                render={({ field, fieldState: { error } }) => (
                                    <>
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Enter Contact Number"
                                            className={`w-full h-12 bg-black border ${error ? 'border-red-500' : 'border-gray-800'} rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500`}
                                        />
                                        {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                                    </>
                                )}
                            />
                        </div>

                        <div>
                            <label className="text-md font-medium text-gray-300 mb-2 flex items-center">
                                Upload ID Proof
                                <Upload className="w-4 h-4 ml-2" />
                            </label>
                            <div className="w-full">
                                {isUploading && !fileNames.idProof ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="text-gray-400">Uploading...</span>
                                    </div>
                                ) : fileNames.idProof ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="truncate">{fileNames.idProof}</span>
                                        <Button
                                            className="ml-auto text-gray-400 hover:text-white"
                                            onClick={() => clearFile('idProof')}
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
                                            onChange={(e) => handleFileChange('idProof', e)}
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
                                {isUploading && !fileNames.license ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="text-gray-400">Uploading...</span>
                                    </div>
                                ) : fileNames.license ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="truncate">{fileNames.license}</span>
                                        <Button
                                            className="ml-auto text-gray-400 hover:text-white"
                                            onClick={() => clearFile('license')}
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
                                            onChange={(e) => handleFileChange('license', e)}
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
                                {isUploading && !fileNames.document ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="text-gray-400">Uploading...</span>
                                    </div>
                                ) : fileNames.document ? (
                                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                                        <span className="truncate">{fileNames.document}</span>
                                        <Button
                                            className="ml-auto text-gray-400 hover:text-white"
                                            onClick={() => clearFile('document')}
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
                                            onChange={(e) => handleFileChange('document', e)}
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
                            className={`px-8 py-3 ${editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                                } text-white rounded-full flex items-center transition-colors focus:outline-none`}
                            disabled={isSubmitting}
                            type="submit"
                        >
                            {isSubmitting ? 'PROCESSING...' : editMode ? 'UPDATE' : 'NEXT'}
                            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}