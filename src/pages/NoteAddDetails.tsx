import React, { useState, useEffect } from 'react';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, ChevronsRight, Upload } from 'lucide-react';
import { Input } from '@/components/ui/form/Input';
import { Select } from '@/components/ui/form/Select';
import { Card } from '@/components/ui/layout/Card';
import { useWebSocketFileUpload } from '@/hooks/useWebSocketFileUpload';
import { CreateNote, UpdateNote } from '@/store/slice/notesSlice';
import type { AppDispatch } from '@/store/store';
import { Button } from '@/components/ui/button';
import apiService from '@/services/api/apiService';

interface Booking {
  user_booking_sno: number;
  name: string;
  mobile_number: string;
}

interface NoteFormData {
  title: string;
  content: string;
  customerName: string;
  customerPhone: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  noteSno?: string;
  userBookingSno: number; // Removed undefined to make it required
  documentSno?: {
    mediaSno: number | null;
    mediaList: MediaItem[];
  };
}

interface MediaItem {
  mediaDetailSno?: number | null;
  mediaSno?: number | null;
  mediaUrl: string;
  thumbnailUrl: string | null;
  mediaType: string;
  contentType: string | undefined;
  mediaSize: number;
  azureId: string;
  isUploaded: boolean;
  documentType?: string;
}

export default function NoteAddDetails() {
  const { uploadFiles, isUploading, error: uploadError } = useWebSocketFileUpload();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const editMode = location.state?.editMode || false;
  const { note, initialBooking } = location.state || {};

  const methods = useForm<NoteFormData>({
    defaultValues: {
      title: '',
      content: '',
      customerName: '',
      customerPhone: '',
      priority: 'medium',
      status: 'pending', // Default status is pending
      noteSno: '',
      userBookingSno: undefined, // Will be required through validation
      documentSno: { mediaSno: null, mediaList: [] },
    },
    mode: 'onChange',
  });

  const {
    reset,
    handleSubmit,
    control,
    formState: { errors, isValid },
    setValue,
    watch,
  } = methods;

  const [fileNames, setFileNames] = useState<{ document: string }>({ document: '' });
  const [documentFileChanged, setDocumentFileChanged] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Watch userBookingSno to determine if booking is selected
  const selectedBookingSno = watch('userBookingSno');

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setBookingLoading(true);
        const response = await apiService.get('users/getbooking') as { json?: { getuserbooking: Booking[] }[] };
        const bookingData = response.json?.[0]?.getuserbooking || [];
        setBookings(bookingData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load booking data');
      } finally {
        setBookingLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Prefill form with note or booking data
  useEffect(() => {
    if (editMode && note) {
      const newUploadedFiles: MediaItem[] = [];
      const newFileNames = { document: '' };

      if (note.document?.mediaDetails && note.document.mediaDetails.length > 0) {
        note.document.mediaDetails.forEach((media: any, index: number) => {
          newUploadedFiles.push({
            ...media,
            documentType: 'document',
            mediaDetailSno: media.mediaDetailSno || null,
            mediaSno: note.document.mediaSno || null,
          });
          newFileNames.document = getFileNameFromUrl(media.mediaUrl) || `document-${index + 1}`;
        });
      }

      reset({
        title: note.title || '',
        content: note.content || '',
        customerName: note.customer_name || '',
        customerPhone: note.customer_phone || '',
        priority: note.priority || 'medium',
        status: note.status || 'pending',
        noteSno: String(note.note_sno || ''),
        userBookingSno: note.user_booking_sno,
        documentSno: {
          mediaSno: note.document?.mediaSno || null,
          mediaList: newUploadedFiles,
        },
      });

      setUploadedFiles(newUploadedFiles);
      setFileNames(newFileNames);
    } else if (initialBooking) {
      setValue('customerName', initialBooking.name || '');
      setValue('customerPhone', initialBooking.mobile_number || '');
      setValue('userBookingSno', initialBooking.user_booking_sno);
    }
  }, [note, editMode, initialBooking, reset, setValue]);

  const getFileNameFromUrl = (url: string) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const handleFileChange = async (name: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const additionalData = {
      userId: '123', // Replace with actual user ID logic
      documentType: name,
    };

    if (event.target.files && event.target.files.length > 0) {
      const files = event.target.files;
      const file = files[0];

      setDocumentFileChanged(true);

      try {
        const result = await uploadFiles(Array.from(files), additionalData);
        if (result && Array.isArray(result) && result.length > 0) {
          const uploadedFile = result[0];
          if (uploadedFile) {
            const existingFile = uploadedFiles.find((f) => f.documentType === name) || null;

            const newFile: MediaItem = {
              mediaUrl: uploadedFile.mediaUrl || '',
              contentType: uploadedFile.contentType,
              mediaType: uploadedFile.contentType || 'application/octet-stream',
              thumbnailUrl: uploadedFile.thumbnailUrl || null,
              mediaSize: uploadedFile.mediaSize || 0,
              isUploaded: uploadedFile.isUploaded ?? false,
              azureId: uploadedFile.azureId ?? '',
              documentType: name,
              mediaDetailSno: existingFile?.mediaDetailSno || null,
            };

            setUploadedFiles((prev) => {
              const updatedFiles = prev.filter((f) => f.documentType !== name);
              return [...updatedFiles, newFile];
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
    setDocumentFileChanged(true);

    const fileInput = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const onSubmit = async (data: NoteFormData) => {
    try {
      setIsSubmitting(true);
      const documentMediaPayload = {
        mediaSno: editMode && note?.document ? note.document.mediaSno : null,
        containerName: 'noteDocuments',
        deleteMediaList: documentFileChanged && editMode
          ? (note?.document?.mediaDetails || [])
              .map((m: any) => m.mediaDetailSno)
              .filter((sno: number | null): sno is number => sno != null)
          : [],
        mediaList: uploadedFiles.map((file) => ({
          mediaUrl: file.mediaUrl,
          contentType: file.contentType,
          mediaType: file.mediaType,
          thumbnailUrl: file.thumbnailUrl,
          mediaSize: file.mediaSize,
          isUploaded: file.isUploaded,
          azureId: file.azureId,
          documentType: file.documentType,
          mediaDetailSno: file.mediaDetailSno || null,
        })),
      };

      if (editMode) {
        const payload = {
          noteSno: Number(data.noteSno),
          title: data.title,
          content: data.content,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          priority: data.priority,
          status: data.status,
          userBookingSno: data.userBookingSno,
          documentSno: documentMediaPayload,
        };

        await dispatch(UpdateNote(payload)).unwrap();
        console.log('Note updated successfully');
      } else {
        const payload = {
          title: data.title,
          content: data.content,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          priority: data.priority,
          status: data.status,
          userBookingSno: data.userBookingSno,
          documentSno: documentMediaPayload,
        };

        await dispatch(CreateNote(payload)).unwrap();
        console.log('Note created successfully');
      }
      navigate('/notesinformation');
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting the form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-black min-h-screen flex flex-col">
        <div className="bg-black text-white p-4 flex items-center text-sm">
          <Button
            className="bg-transparent text-white border border-gray-700 p-2 rounded-lg hover:bg-gray-800"
            onClick={() => navigate('/notesinformation')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-gray-400 ml-2">Notes Information</span>
          <ChevronsRight className="w-4 h-4 mx-2" />
          <span>{editMode ? 'Edit Note' : 'Add New Note'}</span>
        </div>

        <div className="flex-1 px-8 pt-6 pb-4 text-white max-w-4xl mx-auto w-full">
          <h1 className="text-3xl text-center font-normal mb-12">
            {editMode ? 'Edit Note Information' : 'Add Note Information'}
          </h1>

          <div className="border-b border-gray-900 mb-6"></div>

          <Card className="bg-gray-900 border border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <label className="block text-md font-medium text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Title is required', minLength: { value: 3, message: 'Title must be at least 3 characters' } }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter Note Title"
                        className={`w-full h-12 bg-black border ${error ? 'border-red-500' : 'border-gray-800'} rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500`}
                      />
                      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-300 mb-2">
                  Booking <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="userBookingSno"
                  control={control}
                  rules={{ required: 'Please select a booking' }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Select
                        {...field}
                        placeholder={bookingLoading ? 'Loading bookings...' : 'Select a Booking'}
                        options={bookings.map((booking) => ({
                          value: String(booking.user_booking_sno),
                          label: `Booking #${booking.user_booking_sno} - ${booking.name}`,
                        }))}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                          const value = event.target.value;
                          field.onChange(value ? Number(value) : undefined);
                          const selectedBooking = bookings.find(
                            (b) => String(b.user_booking_sno) === value
                          );
                          if (selectedBooking) {
                            setValue('customerName', selectedBooking.name);
                            setValue('customerPhone', selectedBooking.mobile_number);
                          }
                        }}
                        className={`w-full h-12 bg-black border ${error ? 'border-red-500' : 'border-gray-800'} rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500`}
                        disabled={bookingLoading}
                      />
                      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-300 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="customerName"
                  control={control}
                  rules={{ required: 'Customer name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter Customer Name"
                        className={`w-full h-12 bg-black border ${error ? 'border-red-500' : 'border-gray-800'} rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500`}
                        readOnly={!!selectedBookingSno}
                      />
                      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-300 mb-2">
                  Customer Phone <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="customerPhone"
                  control={control}
                  rules={{
                    required: 'Phone number is required',
                    pattern: { value: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number' },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="Enter Customer Phone"
                        className={`w-full h-12 bg-black border ${error ? 'border-red-500' : 'border-gray-800'} rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500`}
                        readOnly={!!selectedBookingSno}
                      />
                      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-300 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="priority"
                  control={control}
                  rules={{ required: 'Priority is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Select
                        {...field}
                        placeholder="Select Priority"
                        options={[
                          { value: 'low', label: 'Low' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'high', label: 'High' },
                        ]}
                        className={`w-full h-12 bg-black border ${error ? 'border-red-500' : 'border-gray-800'} rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500`}
                      />
                      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                    </>
                  )}
                />
              </div>

              <div>
                <label className="block text-md font-medium text-gray-300 mb-2">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <div className="w-full h-12 bg-gray-800 border border-gray-700 rounded-full px-5 py-3 text-gray-300 text-sm flex items-center">
                        <span>Pending</span>
                      </div>
                      <input type="hidden" {...field} value="pending" />
                      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                    </>
                  )}
                />
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

              <div className="md:col-span-2">
                <label className="block text-md font-medium text-gray-300 mb-2">
                  Content
                </label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <textarea
                        {...field}
                        className={`w-full p-3 bg-black border ${error ? 'border-red-500' : 'border-gray-800'} rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 resize-none`}
                        placeholder="Enter note content (optional)"
                        rows={6}
                      />
                      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
                    </>
                  )}
                />
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
                type="button"
                className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-full mr-4"
                onClick={() => navigate('/notesinformation')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`px-8 py-3 ${editMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-full flex items-center transition-colors focus:outline-none`}
                disabled={!isValid || isSubmitting || bookingLoading}
              >
                {isSubmitting ? 'PROCESSING...' : editMode ? 'UPDATE' : 'SAVE'}
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </FormProvider>
  );
}