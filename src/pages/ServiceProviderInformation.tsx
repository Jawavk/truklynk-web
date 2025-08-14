import Button from "@/components/ui/form/Button";
import { Input } from "@/components/ui/form/Input";
import { Card } from "@/components/ui/layout/Card";
import { useWebSocketFileUpload } from "@/hooks/useWebSocketFileUpload";
import { UpdateServiceProvider, CreateServiceProvider, AssignServiceProviderToOrder } from "@/store/slice/serviceProviderSlice";
import { AppDispatch } from "@/store/store";
import { ArrowRight, ChevronsRight, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { UpdateServiceProviderPayload, CreateServiceProviderPayload } from "@/store/slice/serviceProviderSlice";

interface UploadedFile {
  mediaUrl: string;
  contentType?: string;
  fileType?: string;
}

interface FormData {
  companyName: string;
  providerName: string;
  contactNumber: string;
  email: string;
  addressLine: string;
  city: string;
  district: string;
  pincode: string;
  insurance: string;
  pancard: string;
  fc: string;
  gst: string;
  otherDocs: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
}

export default function ServiceProviderInformation() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { uploadFiles } = useWebSocketFileUpload();

  const editMode = location.state?.editMode || location.state?.isEditing || false;
  const providerData = location.state?.providerData || {};
  const [updatedFiles, setUpdatedFiles] = useState<{
    insurance: UploadedFile | null;
    pancard: UploadedFile | null;
    fc: UploadedFile | null;
    gstDocument: UploadedFile | null;
    document: UploadedFile | null;
    photo: UploadedFile | null;
  }>({
    insurance: null,
    pancard: null,
    fc: null,
    gstDocument: null,
    document: null,
    photo: null,
  });
  const [hasFileChanged, setHasFileChanged] = useState(false);
  const [locationData, setLocationData] = useState<{ lat: string; lng: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fromOrderAssignment = location.state?.fromOrderAssignment || false
  const orderData = location.state?.orderData || null

  const methods = useForm<FormData>({
    defaultValues: {
      companyName: "",
      providerName: "",
      contactNumber: "",
      email: "",
      addressLine: "",
      city: "",
      district: "",
      pincode: "",
      insurance: "",
      pancard: "",
      fc: "",
      gst: "",
      otherDocs: "",
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
    },
  });

  const [fileNames, setFileNames] = useState({
    insurance: "",
    pancard: "",
    fc: "",
    gstDocument: "",
    document: "",
    photo: "",
  });

  useEffect(() => {
    if (!editMode) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData({
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString(),
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationData({ lat: "0", lng: "0" });
        }
      );
    }
  }, [editMode]);

  useEffect(() => {
    if (editMode && providerData) {
      methods.reset({
        companyName: providerData.companyName || "",
        providerName: providerData.name || "",
        contactNumber: providerData.contactNumber || "",
        email: providerData.email || "",
        addressLine: providerData.addressLine || "",
        city: providerData.city || "",
        district: providerData.district || "",
        pincode: providerData.pincode || "",
        insurance: providerData.documents?.insurance || "",
        pancard: providerData.documents?.pancard || "",
        fc: providerData.documents?.fc || "",
        gst: providerData.documents?.gst || "",
        otherDocs: providerData.documents?.otherDocs || "",
        firstName: providerData.firstName || "",
        lastName: providerData.lastName || "",
        dob: providerData.dob || "",
        gender: providerData.gender || "",
      });
      setFileNames({
        insurance: providerData.documents?.insurance ? "insurance_document.pdf" : "",
        pancard: providerData.documents?.pancard ? "pancard_document.pdf" : "",
        fc: providerData.documents?.fc ? "fc_document.pdf" : "",
        gstDocument: providerData.documents?.gst ? "gst_document.pdf" : "",
        document: providerData.documents?.otherDocs ? "other_document.pdf" : "",
        photo: providerData.photo ? "profile_photo.jpg" : "",
      });
    }
  }, [editMode, providerData, methods]);

  const handleFileChange = async (fieldName, e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileNames(prev => ({ ...prev, [fieldName]: file.name }));
      setHasFileChanged(true); // Mark that a file has changed

      try {
        const result = await uploadFiles([file], { userId: '123', documentType: fieldName });
        if (result && Array.isArray(result) && result.length > 0) {
          const uploadedFile = result[0];
          setUpdatedFiles(prev => ({ ...prev, [fieldName]: uploadedFile }));
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  const clearFile = (fieldName: string) => {
    setFileNames((prev) => ({ ...prev, [fieldName]: "" }));
    setUpdatedFiles((prev) => ({ ...prev, [fieldName]: null }));
    setHasFileChanged(
      Object.values({ ...updatedFiles, [fieldName]: null }).some((file) => file !== null)
    );
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      if (editMode) {
        // Handle update logic (existing code)
        const { name, companyName, originalData, pincode, contactNo } = providerData || {}

        const {
          service_providers_sno,
          registering_type,
          dob,
          gender,
          user_profile_sno,
          company_name,
          selected_service,
          address = [],
          documents = [],
        } = originalData || {}

        const { service = {} } = selected_service || {}
        const { service_sno, service_name, category = {} } = service
        const { category_sno, category_name, subCategory = {} } = category
        const { subcategory_sno, subcategory_name } = subCategory

        const { address_line_1, city_name, district_name, pin_code, country_name, latitude, longitude } =
          address[0] || {}

        const payload: UpdateServiceProviderPayload = {
          service_providers_sno: service_providers_sno || 0,
          registering_type: registering_type || (data.companyName ? 50 : 49),
          first_name: data.providerName || name || "",
          last_name: data.lastName || "",
          photo: updatedFiles.photo?.mediaUrl || null,
          dob: data.dob || dob || null,
          gender: data.gender === "Male" ? 51 : data.gender === "Female" ? 52 : 53,
          selected_service: {
            service: {
              service_sno: service_sno || 1,
              service_name: service_name || "Transport",
              category: {
                category_sno: category_sno || 1,
                category_name: category_name || "Short Trip",
                subCategory: {
                  subcategory_sno: subcategory_sno || 1,
                  subcategory_name: subcategory_name || "Tata 407",
                },
              },
            },
          },
          updated_by: 55,
          user_profile_sno: user_profile_sno || 0,
          company_name: data.companyName || company_name || "",
          company_register_no: data.gst || "",
          address: {
            address_line_1: data.addressLine || address_line_1 || "",
            city_name: data.city || city_name || "",
            district_name: data.district || district_name || "",
            pin_code: data.pincode || pin_code || "",
            state_name: "Tamil Nadu",
            country_name: country_name || "India",
            latitude: latitude || "0",
            longitude: longitude || "0",
          },
          documents: hasFileChanged
            ? [
                updatedFiles.insurance && {
                  document_type: 97,
                  media: [
                    {
                      mediaUrl: updatedFiles.insurance.mediaUrl,
                      type: "insurance",
                      document_type: 97,
                    },
                  ],
                },
                updatedFiles.pancard && {
                  document_type: 57,
                  media: [
                    {
                      mediaUrl: updatedFiles.pancard.mediaUrl,
                      type: "pancard",
                      document_type: 57,
                    },
                  ],
                },
                updatedFiles.fc && {
                  document_type: 99,
                  media: [
                    {
                      mediaUrl: updatedFiles.fc.mediaUrl,
                      type: "fc",
                      document_type: 99,
                    },
                  ],
                },
                updatedFiles.gstDocument && {
                  document_type: 63,
                  media: [
                    {
                      mediaUrl: updatedFiles.gstDocument.mediaUrl,
                      type: "gst",
                      document_type: 63,
                    },
                  ],
                },
                updatedFiles.document && {
                  document_type: 60,
                  media: [
                    {
                      mediaUrl: updatedFiles.document.mediaUrl,
                      type: "other",
                      document_type: 60,
                    },
                  ],
                },
              ].filter(
                (
                  doc,
                ): doc is {
                  document_type: number
                  media: { mediaUrl: string; type: string; document_type: number }[]
                } => doc !== null,
              )
            : documents.map((doc: any) => ({
                document_type: doc.document_type,
                media: Array.isArray(doc.media) ? doc.media : [doc.media].filter((m) => m && m.mediaUrl),
              })),
          created_on: new Date().toISOString(),
          media: null,
        }

        await dispatch(UpdateServiceProvider(payload)).unwrap()
        console.log("Service Provider updated successfully")
        navigate("/serviceproviders")
      } else {
        // Handle create logic with optional order assignment
        const countryCode = 91
        const registeringType = data.companyName ? 50 : 49

        const payload: CreateServiceProviderPayload = {
          name: data.providerName || "",
          country_code: countryCode,
          mobile_no: data.contactNumber || "",
          address: {
            address_line_1: data.addressLine || "",
            address_line_2: "",
            pin_code: data.pincode || "",
            city_name: data.city || "",
            district_name: data.district || "",
            state_name: "Tamil Nadu",
            country_name: "India",
            latitude: locationData?.lat || "0",
            longitude: locationData?.lng || "0",
          },
          documents: [
            updatedFiles.insurance && {
              document_type: 97,
              media: [
                {
                  mediaUrl: updatedFiles.insurance.mediaUrl,
                  type: "insurance",
                  document_type: 97,
                },
              ],
            },
            updatedFiles.pancard && {
              document_type: 57,
              media: [
                {
                  mediaUrl: updatedFiles.pancard.mediaUrl,
                  type: "pancard",
                  document_type: 57,
                },
              ],
            },
            updatedFiles.fc && {
              document_type: 99,
              media: [
                {
                  mediaUrl: updatedFiles.fc.mediaUrl,
                  type: "fc",
                  document_type: 99,
                },
              ],
            },
            updatedFiles.gstDocument && {
              document_type: 63,
              media: [
                {
                  mediaUrl: updatedFiles.gstDocument.mediaUrl,
                  type: "gst",
                  document_type: 63,
                },
              ],
            },
            updatedFiles.document && {
              document_type: 60,
              media: [
                {
                  mediaUrl: updatedFiles.document.mediaUrl,
                  type: "other",
                  document_type: 60,
                },
              ],
            },
          ].filter(
            (
              doc,
            ): doc is { document_type: number; media: { mediaUrl: string; type: string; document_type: number }[] } =>
              doc !== null,
          ),
          location: {
            lat: locationData?.lat || "0",
            lng: locationData?.lng || "0",
            heading: "0",
            status: 81,
          },
          registering_type: registeringType,
          first_name: data.firstName || "",
          last_name: data.lastName || "",
          photo: updatedFiles.photo?.mediaUrl || null,
          dob: data.dob || null,
          gender: data.gender === "Male" ? 51 : data.gender === "Female" ? 52 : 53,
          selected_service: {
            service: {
              service_sno: 1,
              service_name: "Transport",
              category: {
                category_sno: 1,
                category_name: "Short Trip",
                subCategory: {
                  subcategory_sno: 1,
                  subcategory_name: "Tata 407",
                },
              },
            },
          },
          company_name: data.companyName || "",
          company_register_no: data.gst || "",
          updated_by: 55,
          // Add order assignment data if coming from order assignment
          ...(fromOrderAssignment &&
            orderData && {
              order_assignment: {
                service_booking_sno: orderData.service_booking_sno,
                booking_status_cd: 73, // Change from 106 to 73
              },
            }),
        }

        const result = await dispatch(CreateServiceProvider(payload)).unwrap()
        console.log("Service Provider created successfully", result)

        // Navigate based on context
        if (fromOrderAssignment && orderData) {
          // Navigate back to order management with success message
          navigate("/orders", {
            state: {
              message: `Service provider created and assigned to order #${orderData.service_booking_sno} successfully`,
              type: "success",
            },
          })
        } else {
          // Normal flow - go back to service providers
          navigate("/serviceproviders")
        }
      }
    } catch (error) {
      console.error("Failed to process service provider:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="bg-black min-h-screen flex flex-col">
        <div className="bg-black text-white p-4 flex items-center text-sm">
          <span className="text-gray-400">Service Provider Verification</span>
          <ChevronsRight className="w-4 h-4 mx-2" />
          <span>Service Provider Information</span>
        </div>

        <div className="flex-1 px-8 pt-6 pb-4 text-white max-w-4xl mx-auto w-full">
          <h1 className="text-3xl text-center font-normal mb-12">Service Provider Information</h1>

          <div className="border-b border-gray-900 mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <label className="block text-md font-medium text-gray-300 mb-2">Company Name</label>
              <Input
                type="text"
                placeholder="Enter Company Name"
                className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm"
                {...methods.register("companyName")}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-300 mb-2">Provider Name</label>
              <Input
                type="text"
                placeholder="Enter Provider Name"
                className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm"
                {...methods.register("providerName")}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-300 mb-2">First Name</label>
              <Input
                type="text"
                placeholder="Enter First Name"
                className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm"
                {...methods.register("firstName")}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-300 mb-2">Last Name</label>
              <Input
                type="text"
                placeholder="Enter Last Name"
                className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm"
                {...methods.register("lastName")}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-300 mb-2">Contact Number</label>
              <Input
                type="text"
                placeholder="Enter Contact Number"
                className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm"
                {...methods.register("contactNumber")}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-300 mb-2">Email</label>
              <Input
                type="email"
                placeholder="Enter Email"
                className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm"
                {...methods.register("email")}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-300 mb-2">Date of Birth</label>
              <Input
                type="date"
                placeholder="Enter DOB"
                className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm"
                max={new Date().toISOString().split("T")[0]} // Prevent future dates
                {...methods.register("dob")}
              />
            </div>

            <div>
              <label className="block text-md font-medium text-gray-300 mb-2">Gender</label>
              <select
                className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm"
                {...methods.register("gender")}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <Card className="!bg-black border border-gray-800 rounded-lg mt-8 p-4">
            <div className="flex items-center text-md font-medium mb-4 text-white">Address Details</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <label className="block text-md font-medium text-gray-300 mb-2">Address Line</label>
                <Input
                  type="text"
                  placeholder="Enter Address Line"
                  className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm"
                  {...methods.register("addressLine")}
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-300 mb-2">City</label>
                <Input
                  type="text"
                  placeholder="Enter City"
                  className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm"
                  {...methods.register("city")}
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-300 mb-2">District</label>
                <Input
                  type="text"
                  placeholder="Enter District"
                  className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm"
                  {...methods.register("district")}
                />
              </div>
              <div>
                <label className="block text-md font-medium text-gray-300 mb-2">Pincode</label>
                <Input
                  type="text"
                  placeholder="Enter Pincode"
                  className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm"
                  {...methods.register("pincode")}
                />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 py-4 gap-y-5">
            {["photo", "insurance", "pancard", "fc", "gstDocument", "document"].map((field) => (
              <div key={field}>
                <label className="text-md font-medium text-gray-300 mb-2 flex items-center">
                  Upload {field.charAt(0).toUpperCase() + field.slice(1)}
                  <Upload className="w-4 h-4 ml-2" />
                </label>
                <div className="w-full">
                  {fileNames[field] ? (
                    <div className="w-full h-12 bg-black border border-gray-800 rounded-full px-5 py-3 text-white text-sm flex items-center">
                      <span className="truncate">{fileNames[field]}</span>
                      <Button
                        className="ml-auto text-gray-400 hover:text-white"
                        onClick={() => clearFile(field)}
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
                        name={field}
                        onChange={(e) => handleFileChange(field, e)}
                        accept={field === "photo" ? "image/*" : ".pdf,image/*"}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button
              className={`px-8 py-3 ${editMode ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"} text-white rounded-full flex items-center transition-colors`}
              onClick={methods.handleSubmit(onSubmit)}
            >
              {editMode ? "UPDATE" : "CREATE"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}