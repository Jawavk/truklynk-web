import { ArrowLeft, ArrowRight, ChevronsRight, ChevronDown, X } from 'lucide-react';
import { useLocation, useNavigate } from "react-router-dom";
import Button from "@/components/ui/form/Button";
import { FormProvider, useForm } from "react-hook-form";
import { DateInput } from "@/components/ui/form/DateInput";
import { Input } from "@/components/ui/form/Input";
import { Select } from "@/components/ui/form/Select";
import ReactSelect from "react-select"; // Explicitly import react-select
import apiService from '@/services/api/apiService';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchCustomerData } from "@/store/slice/customerSlice";
import { formatInTimeZone } from 'date-fns-tz'; // Import date-fns-tz for timezone handling

// Define interface for the enum data based on API response
interface WeightUnit {
    codes_dtl_sno: number;
    cd_value: string;
    seqno: number;
    filter_1: string | null;
    filter_2: string | null;
    filter_3: string | null;
    codes_hdr_sno: number;
}

export default function CustomerRequirements() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [activeButton, setActiveButton] = useState('Standard');
    const location = useLocation();
    const {
        distance,
        pickupDetails,
        dropDetails,
        initialBookingName,
        initialBookingMobileNumber,
        initialTypesOfGoods,
        initialWeightOfGoods,
    } = location.state || {};

    const [selectedDateTime, setSelectedDateTime] = useState(() => {
        const now = new Date();
        return formatInTimeZone(now, 'Asia/Kolkata', "yyyy-MM-dd'T'HH:mm"); // Format as YYYY-MM-DDTHH:MM in IST
    });
    const [weightUnits, setWeightUnits] = useState<WeightUnit[]>([]);
    const [selectedUnit, setSelectedUnit] = useState('');
    const [formData, setFormData] = useState({
        weight: '',
        item: '',
        weightTypeSno: '',
        weightType: '',
    });

    // Initialize selectedUser with data from initial booking if available
    const [selectedUser, setSelectedUser] = useState({
        user_profile_sno: '', // This might need to be fetched or derived if not directly available from booking
        name: initialBookingName || '',
        phoneNumber: initialBookingMobileNumber || 0,
    });

    const { data } = useSelector((state: RootState) => state.customer);

    useEffect(() => {
        dispatch(fetchCustomerData());
        fetchWeightUnits();
    }, [dispatch]);

    // Effect to set formData and selectedUser once initial data and weightUnits are available
    useEffect(() => {
        if (initialTypesOfGoods || initialWeightOfGoods) {
            const newFormData: typeof formData = { ...formData };
            if (initialTypesOfGoods) {
                newFormData.item = initialTypesOfGoods;
            }

            if (initialWeightOfGoods) {
                const weightMatch = initialWeightOfGoods.match(/^(\d+(\.\d+)?)\s*([a-zA-Z]+)?$/);
                if (weightMatch) {
                    newFormData.weight = weightMatch[1];
                    const unitString = weightMatch[3]?.toLowerCase();

                    if (unitString && weightUnits.length > 0) {
                        const matchedUnit = weightUnits.find(unit => unit.cd_value.toLowerCase() === unitString);
                        if (matchedUnit) {
                            newFormData.weightTypeSno = matchedUnit.codes_dtl_sno.toString();
                            newFormData.weightType = matchedUnit.cd_value;
                            setSelectedUnit(matchedUnit.codes_dtl_sno.toString());
                        }
                    }
                } else {
                    newFormData.weight = initialWeightOfGoods;
                }
            }
            setFormData(newFormData);
        }

        // Set selectedUser if initialBookingName/MobileNumber are present
        if (initialBookingName || initialBookingMobileNumber) {
            setSelectedUser(prev => ({
                ...prev,
                name: initialBookingName || prev.name,
                phoneNumber: initialBookingMobileNumber || prev.phoneNumber,
            }));
        }
    }, [initialTypesOfGoods, initialWeightOfGoods, initialBookingName, initialBookingMobileNumber, weightUnits]);


    const customSelectStyles = {
        control: (provided: any) => ({
            ...provided,
            backgroundColor: 'transparent',
            border: '1px solid #2d3748',
            borderRadius: '0.75rem',
            padding: '0.5rem 0.25rem',
            color: 'white',
            minHeight: '2.5rem',
            '&:hover': {
                borderColor: '#4a5568',
            },
        }),
        input: (provided: any) => ({
            ...provided,
            color: 'white',
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: '#1a202c',
            border: '1px solid #2d3748',
            borderRadius: '0.75rem',
            marginTop: '0.25rem',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#e53e3e' : '#1a202c',
            color: 'white',
            '&:hover': {
                backgroundColor: '#2d3748',
            },
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: 'white',
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: '#a0aec0',
        }),
    };

    const fetchWeightUnits = async () => {
        try {
            const response: any = await apiService.get(`enums?clientService=WEIGHT`);
            if (response.isSuccess && response.json) {
                setWeightUnits(response.json as WeightUnit[]);
                if (response.json.length > 0 && !selectedUnit) {
                    const firstUnit = response.json[0];
                    setSelectedUnit(firstUnit.codes_dtl_sno.toString());
                    setFormData((prev) => ({
                        ...prev,
                        weightTypeSno: firstUnit.codes_dtl_sno.toString(),
                        weightType: firstUnit.cd_value,
                    }));
                }
            } else {
                console.error('Failed to fetch weight units:', response.error);
            }
        } catch (error) {
            console.error('Error fetching weight units:', error);
        }
    };

    const userOptions = data.map((profile) => ({
        label: profile.name,
        value: profile.user_profile_sno,
    }));

    const methods = useForm({
        defaultValues: {
            schedulePickupDate: '',
            expectedDeliveryDate: '',
        },
    });

    const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDateTime(e.target.value);
    };

    const handleClick = (buttonName: string) => {
        setActiveButton(buttonName);
    };

    const handleUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setSelectedUnit(value);
        const selectedWeight = weightUnits.find(
            (unit) => unit.codes_dtl_sno.toString() === value
        );
        if (selectedWeight) {
            setFormData((prev) => ({
                ...prev,
                weightTypeSno: selectedWeight.codes_dtl_sno.toString(),
                weightType: selectedWeight.cd_value,
            }));
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await apiService.get('/service/subcategory', undefined, {
                params: { category_sno: 2 },
            });
            const subCategoryData = response;
            navigate("/vehicleorder", {
                state: {
                    pickupDetails,
                    dropDetails,
                    selectedDateTime,
                    selectedUnit: formData.weightType,
                    formData,
                    distance: distance ?? null,
                    subCategoryData,
                    selectedUser, // Pass selectedUser (which now includes pre-filled data)
                },
            });
        } catch (error) {
            console.error('Failed to fetch subcategories:', error);
        }
    };

    const handleUserChange = (selectedOption: any) => {
        const selected_user = data.find(
            (item) => item?.user_profile_sno == selectedOption?.value
        );
        setSelectedUser({
            name: selected_user?.name ?? "",
            phoneNumber: selected_user?.phoneNumber ?? 0,
            user_profile_sno: selected_user?.user_profile_sno?.toString() ?? "",
        });
    };

    return (
        <FormProvider {...methods}>
            <div className="bg-black min-h-screen flex flex-col">
                {/* Navigation breadcrumbs */}
                <div className="bg-black text-white p-4 flex items-center text-sm">
                    <span className="text-gray-400">Order management</span>
                    <ChevronsRight className="w-4 h-4 mx-2" />
                    <span>Create new order</span>
                </div>
                {/* Main Content */}
                <div className="flex-1 px-8 pt-6 pb-4 text-white max-w-2xl mx-auto w-full">
                    <h1 className="text-3xl text-center font-normal mb-12">
                        Add customer's Your Requirement
                    </h1>
                    {/* Divider */}
                    <div className="border-b border-gray-900 mb-8"></div>
                    {/* Schedule */}
                    <div className="mb-10 max-w-md mx-auto">
                        <label className="block text-xs text-gray-300 mb-2">
                            Schedule Pick up date and time
                        </label>
                        <div className="mb-5">
                            <div className="relative">
                                <Input
                                    type="datetime-local"
                                    name="datetime"
                                    value={selectedDateTime}
                                    onChange={handleDateTimeChange}
                                    className="w-full bg-transparent border border-gray-800 rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                                    min={new Date().toISOString().slice(0, 16)} // Prevent past dates
                                />
                            </div>
                        </div>
                    </div>
                    {/* Items & Weight */}
                    <div className="mb-10 max-w-md mx-auto">
                        <label className="block text-white font-medium mb-6">
                            Items & Weight
                        </label>
                        {/* Item Weight */}
                        <div className="mb-5">
                            <label className="block text-xs text-gray-300 mb-2">
                                Enter Item Weight
                            </label>
                            <div className="flex">
                                <Input
                                    type="text"
                                    name="weight"
                                    placeholder="00"
                                    value={formData.weight}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            weight: e.target.value,
                                        }))
                                    }
                                    className="w-[350px] bg-transparent border border-gray-800 rounded-l-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                                />
                                {/* Dynamic Weight Unit Dropdown */}
                                <div className="relative inline-block">
                                    <Select
                                        name="unit"
                                        value={selectedUnit}
                                        onChange={handleUnitChange}
                                        options={weightUnits.map((unit) => ({
                                            value: unit.codes_dtl_sno.toString(),
                                            label: unit.cd_value,
                                        }))}
                                        className="w-24 appearance-none bg-gray-800 text-white rounded-r-full pl-2 pr-10 py-3 text-sm focus:outline-none border-l border-gray-700"
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
                                        <ChevronDown className="h-5 w-5 mr-2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Item Name */}
                        <div>
                            <label className="block text-xs text-gray-300 mb-2">
                                Add Items
                            </label>
                            <Input
                                type="text"
                                name="item"
                                placeholder="E.g. Apples"
                                value={formData.item}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        item: e.target.value,
                                    }))
                                }
                                className="w-full bg-transparent border border-gray-800 rounded-full px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                            />
                        </div>
                        {/* Users Section - Re-added */}
                        <div>
                            <label className="block text-xs text-gray-300 mb-2 mt-4">
                                Users
                            </label>
                            {selectedUser.name && selectedUser.phoneNumber ? (
                                <div className="bg-transparent border border-gray-800 rounded-xl px-5 py-3 text-white text-sm flex items-center justify-between">
                                    <span>{selectedUser.name} ({selectedUser.phoneNumber})</span>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser({ user_profile_sno: '', name: '', phoneNumber: 0 })}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <ReactSelect
                                    name="users"
                                    options={userOptions}
                                    placeholder="Select User"
                                    onChange={handleUserChange}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    classNamePrefix="react-select"
                                />
                            )}
                        </div>
                    </div>
                </div>
                {/* Progress Dots */}
                <div className="flex space-x-3 py-6 mb-2">
                    <div className="h-1 w-96 bg-white rounded-full"></div>
                    <div className="h-1 w-72 bg-gray-700 rounded-full"></div>
                    <div className="h-1 w-72 bg-gray-700 rounded-full"></div>
                    <div className="h-1 w-72 bg-gray-700 rounded-full"></div>
                    <div className="h-1 w-72 bg-gray-700 rounded-full"></div>
                    <div className="h-1 w-72 bg-gray-700 rounded-full"></div>
                </div>
                {/* Bottom Navigation Buttons */}
                <div className="bg-black p-5 flex justify-between items-center border-t border-gray-900">
                    <Button
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 bg-transparent hover:bg-gray-900 text-white border border-gray-700 rounded-full flex items-center transition-colors focus:outline-none"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        BACK
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            !selectedDateTime ||
                            !formData.weight ||
                            !formData.item ||
                            !formData.weightTypeSno ||
                            !selectedUser.user_profile_sno // Ensure a user is selected/pre-filled
                        }
                        className={`px-6 py-2 text-white rounded-full flex items-center transition-colors ${!selectedDateTime ||
                            !formData.weight ||
                            !formData.item ||
                            !formData.weightTypeSno ||
                            !selectedUser.user_profile_sno
                            ? "bg-red-500 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                            }`}
                    >
                        NEXT
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </FormProvider>
    );
}
