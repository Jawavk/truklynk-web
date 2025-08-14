import { ChevronsRight, Search, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ArrowLeft, ArrowRight, Truck } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { ReactNode, useState } from "react";
import { Input } from "@/components/ui/form/Input";

interface Vehicle {
    description: ReactNode;
    image: string | undefined;
    id: number;
    name: string;
}

export default function VehicleOrder() {
    const navigate = useNavigate();
    const methods = useForm();
    const location = useLocation();
    const [selectedValue, setSelectedValue] = useState('1');
    const [isOpen, setIsOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
    const { selectedUnit } = location.state || {};
    const { formData } = location.state || {};
    const { pickupDetails, dropDetails } = location.state || {};
    const { distance } = location.state || {};
    const { selectedDate } = location.state || {};
    const { subCategoryData } = location.state || {};
    const { selectedUser } = location.state || {};
    const [notesData, setnotesData] = useState({
        notes: '',
    });

    const options = [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
    ];

    const onSubmit = () => {
        navigate("/orderinformation", {
            state: {
                pickupDetails,
                dropDetails,
                selectedDate,
                selectedUnit,
                formData,
                distance: distance ?? null,
                subCategoryData,
                selectedVehicleId,
                notesData,
                selectedUser,
            }
        })
    }
    const handleVehicleSelect = (vehicle: Vehicle) => {
        if (selectedVehicles.length < parseInt(selectedValue)) {
            setSelectedVehicles([...selectedVehicles, vehicle]);
            setSelectedVehicleId(vehicle.id);
        }
        setIsPopupOpen(false);
    };


    const removeVehicle = (index: number) => {
        const newVehicles = [...selectedVehicles];
        setSelectedVehicles(newVehicles);
        setSelectedVehicleId(null);
    };

    return (
        <FormProvider {...methods}>
            <div className="bg-black min-h-screen flex flex-col">
                {/* Navigation Breadcrumbs */}
                <div className="bg-black text-white p-4 flex items-center text-sm">
                    <span className="text-gray-400">Order management</span>
                    <ChevronsRight className="w-4 h-4 mx-2" />
                    <span>Create new order</span>
                </div>

                {/* Main Content */}
                <div className="flex-1 px-6 text-white">
                    <h1 className="text-3xl text-center font-normal mb-12">
                        Add Customer's Requirement
                    </h1>

                    {/* Divider */}
                    <div className="border-b border-gray-900 mb-4"></div>

                    {/* Vehicle Selection */}
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-md mx-auto">
                        <div className="relative">
                            <div
                                className="bg-transparent border border-gray-800 rounded-2xl flex items-center justify-between cursor-pointer"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <div className="py-6 px-4 text-gray-300 text-sm">
                                    Number of vehicles
                                </div>
                                <div className="flex items-center py-1 px-4 bg-zinc-800 rounded-full mr-4">
                                    <span className="text-white mr-1 bg-black rounded-full px-2 font-medium">{selectedValue}</span>
                                    <ChevronDown className="w-4 h-4 text-red-600" />
                                </div>
                            </div>

                            {isOpen && (
                                <div className="absolute mt-1 w-full z-10">
                                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                                        {options.map((option) => (
                                            <div
                                                key={option.value}
                                                className={`px-4 py-2 cursor-pointer hover:bg-gray-700 ${selectedValue === option.value ? 'bg-gray-700' : ''}`}
                                                onClick={() => {
                                                    setSelectedValue(option.value);
                                                    setIsOpen(false);
                                                    if (parseInt(option.value) < selectedVehicles.length) {
                                                        setSelectedVehicles(selectedVehicles.slice(0, parseInt(option.value)));
                                                    }
                                                }}
                                            >
                                                <span className="text-white">{option.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <label className="block text-xs text-gray-300 mb-3 mt-4">Pick Vehicles</label>
                        <div className="space-y-3">
                            <div className="relative">
                                <div
                                    className="bg-transparent border border-gray-800 rounded-lg p-3 flex items-center justify-between cursor-pointer"
                                    onClick={() => setIsPopupOpen(true)}
                                >
                                    <div className="flex items-center">
                                        <Truck className="w-5 h-5 mr-3 text-gray-400" />
                                        <span className="text-sm">Select vehicle</span>
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                </div>

                                {selectedVehicles.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        {selectedVehicles.map((vehicle, index) => (
                                            <div key={index} className="bg-zinc-900 border border-gray-800 rounded-lg p-3 flex items-center">
                                                <img
                                                    src='assets/images/truck1.png'
                                                    alt={vehicle.name}
                                                    className="h-10 w-10 object-contain mr-3"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-gray-400 text-xs">{vehicle.description}</p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeVehicle(index);
                                                    }}
                                                    className="ml-2 text-gray-400 hover:text-white"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs text-gray-300 mb-2 mt-4">Name</label>
                                <Input
                                    type="text"
                                    name="item"
                                    placeholder="Name"
                                    value={selectedUser.name}
                                    // value={selectedUser.value}
                                    className="w-full bg-transparent border border-gray-800 rounded-lg px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-300 mb-2 mt-4">Mobile Number</label>
                                <Input
                                    type="text"
                                    name="item"
                                    placeholder="Phone Number"
                                    value={selectedUser.phoneNumber}
                                    className="w-full bg-transparent border border-gray-800 rounded-lg px-5 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-500"
                                />
                            </div>

                        </div>

                        {/* Notes */}
                        <div className="mb-14">
                            <label className="block text-sm mb-3 mt-4">Notes</label>
                            <textarea
                                placeholder="Notes for vehicle owners"
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-gray-700 h-32 resize-none"
                                {...methods.register("notes")}
                            />
                        </div>
                    </form>
                </div>

                {/* Progress bar */}
                <div className="flex space-x-3 py-6 mb-2">
                    <div className="h-1 w-96 bg-white rounded-full"></div>
                    <div className="h-1 w-72 bg-white rounded-full"></div>
                    <div className="h-1 w-72 bg-gray-700 rounded-full"></div>
                    <div className="h-1 w-72 bg-gray-700 rounded-full"></div>
                    <div className="h-1 w-72 bg-gray-700 rounded-full"></div>
                </div>

                <div className="bg-black p-5 flex justify-between items-center border-t border-gray-900">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-8 py-3 bg-transparent hover:bg-gray-900 text-white border border-gray-700 rounded-full flex items-center transition-colors focus:outline-none"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        BACK
                    </button>
                    <button
                        onClick={methods.handleSubmit(onSubmit)}
                        className={`px-8 py-3 ${selectedVehicles.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 cursor-not-allowed'} text-white rounded-full flex items-center transition-colors focus:outline-none`}
                    >
                        NEXT
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>

                {isPopupOpen && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center">
                        <div className="bg-zinc-950 rounded-xl shadow-xl max-w-2xl w-full mx-4 my-4 transform transition-all duration-300">
                            <div className="p-6 flex items-center justify-between border-b border-gray-800">
                                <div className="flex items-center">
                                    <h2 className="text-white text-xl font-semibold mr-2">Pick Vehicle</h2>
                                    <span className="text-yellow-500 text-sm">
                                        {selectedVehicles.length}/{selectedValue} selected
                                    </span>
                                </div>
                                <button onClick={() => setIsPopupOpen(false)}>
                                    <X className="w-6 h-6 text-white hover:text-gray-400 transition-colors" />
                                </button>
                            </div>

                            <div className="px-6 py-4 flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        className="bg-gray-900 rounded-xl border border-gray-600 py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                                    />
                                </div>
                                <button className="bg-gray-900 rounded-xl border border-gray-600 px-5 py-3 text-white text-sm flex items-center hover:bg-gray-800 transition-colors">
                                    Name <ChevronDown className="ml-2 w-5 h-5" />
                                </button>
                                <button className="bg-gray-900 rounded-xl border border-gray-600 px-5 py-3 text-white text-sm flex items-center hover:bg-gray-800 transition-colors">
                                    5 tone <ChevronDown className="ml-2 w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[60vh] ">
                                <div className="grid grid-cols-3 gap-10 ">
                                    {subCategoryData && subCategoryData.json.map((item) => (
                                        <div
                                            key={item.subcategory_sno}
                                            className='bg-zinc-900 rounded-lg h-full p-4 cursor-pointer transition-colors relative border'
                                            onClick={() => handleVehicleSelect({
                                                id: item.subcategory_sno,
                                                name: item.subcategory_name,
                                                description: item.description,
                                                image: item.media[0]?.mediaUrl
                                            })}
                                        >
                                            <div className="absolute top-[-12px] left-[-20px] bg-white p-1 rounded-lg">
                                                {item.media && item.media.length > 0 && (
                                                    <img
                                                        src={
                                                            item.media && item.media.length > 0 && item.media.mediaUrl
                                                                ? item.media[0].mediaUrl
                                                                : 'assets/images/truck1.png'
                                                        }
                                                        alt={item.subcategory_name}
                                                        className="h-14 object-contain rounded-md"
                                                    />

                                                )
                                                }
                                            </div>
                                            <div className="pt-10">
                                                <h3 className="text-sm font-semibold text-white">{item.subcategory_name}</h3>
                                                <p className="text-gray-300 text-xs mt-1">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </FormProvider>
    );
}