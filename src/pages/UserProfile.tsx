import Button from "@/components/ui/form/Button";
import { Briefcase, Camera, Edit, Phone, Settings, Shield, ArrowLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
type UserData = {
    name: string;
    mobileNumber: string;
    [key: string]: any;
};

export default function UserProfile() {
    const [activeTab, setActiveTab] = useState("personal");
    const [userData, setUserData] = useState<UserData | null>(null);

    useEffect(() => {
        const storedData = localStorage.getItem("userData");
        console.log(storedData)
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            setUserData(parsedData);
        }
    }, []);

    const handleBackClick = () => {
        // Navigate back to previous page in browser history
        window.history.back();
    };

    if (!userData) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="p-4 text-white">Loading profile data...</div>
        </div>
    );

    return (
        <div className="bg-gray-900 min-h-screen text-gray-100">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="rounded-2xl overflow-hidden bg-gray-800 shadow-xl mb-8">
                    
                     <Button 
                            onClick={handleBackClick} 
                            className="relative top-0 left-0 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full transition duration-200 flex items-center justify-center shadow-lg"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                    <div className="h-40 bg-gradient-to-r from-red-600 via-gray-600 to-gray-700 relative">
                    </div>
                    <div className="px-8 pb-6 relative ">
                        <div className="flex flex-col md:flex-row">
                            <div className="relative -mt-16 mb-4">
                                <div className="w-32 h-32 border-4 border-gray-800 rounded-full overflow-hidden shadow-xl">
                                    <img src="assets/images/profile2.png" alt="User profile" className="w-full h-full object-cover" />
                                </div>
                                <Button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg transition duration-200">
                                    <Camera size={16} />
                                </Button>
                            </div>

                            <div className="md:ml-6 pt-2 flex-grow">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white mb-1">{userData.name}</h1>
                                    </div>
                                    {/* <Button className="mt-2 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-200 flex items-center self-start">
                                        <Settings size={16} className="mr-2" />
                                        <span>Edit Profile</span>
                                    </Button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Quick Stats */}
                        <div className="md:col-span-1">
                            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 ml-4 mb-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-300 flex items-center">
                                    <Shield size={18} className="mr-2 text-blue-500" />
                                    Account Status
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Account Type</span>
                                        <span className="font-medium text-white">Premium</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Verification</span>
                                        <span className="bg-green-500 bg-opacity-20 text-green-400 text-xs px-2 py-1 rounded-full">Verified</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Access Level</span>
                                        <span className="font-medium text-white">Full Access</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Contact Information */}
                        <div className="md:col-span-2 p-4">
                            <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                                {/* Tabs */}
                                <div className="px-6 pt-6 border-b border-gray-700">
                                    <div className="flex space-x-6">
                                        <Button
                                            onClick={() => setActiveTab("personal")}
                                            className={`pb-4 px-2 font-medium ${activeTab === "personal" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400 hover:text-gray-300"}`}
                                        >
                                            Personal Info
                                        </Button>
                                        <Button
                                            onClick={() => setActiveTab("security")}
                                            className={`pb-4 px-2 font-medium ${activeTab === "security" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400 hover:text-gray-300"}`}
                                        >
                                            Security
                                        </Button>
                                        <Button
                                            onClick={() => setActiveTab("preferences")}
                                            className={`pb-4 px-2 font-medium ${activeTab === "preferences" ? "text-blue-500 border-b-2 border-blue-500" : "text-gray-400 hover:text-gray-300"}`}
                                        >
                                            Preferences
                                        </Button>
                                    </div>
                                </div>

                                {/* Tab Content */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {/* Role */}
                                        <div className="flex items-center p-4 bg-gray-700 bg-opacity-30 rounded-xl transition-colors hover:bg-opacity-40">
                                            <div className="bg-blue-500 bg-opacity-20 p-3 rounded-xl mr-4">
                                                <Briefcase size={20} className="text-blue-500" />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-sm font-medium text-gray-400">Role</p>
                                                <p className="font-semibold text-white">Admin</p>
                                            </div>
                                            <Button className="text-gray-400 hover:text-blue-500 transition-colors">
                                                <Edit size={16} />
                                            </Button>
                                        </div>

                                        {/* Mobile */}
                                        <div className="flex items-center p-4 bg-gray-700 bg-opacity-30 rounded-xl transition-colors hover:bg-opacity-40">
                                            <div className="bg-green-500 bg-opacity-20 p-3 rounded-xl mr-4">
                                                <Phone size={20} className="text-green-500" />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-sm font-medium text-gray-400">Mobile</p>
                                                <p className="font-semibold text-white">{userData.mobileNumber}</p>
                                            </div>
                                            <Button className="text-gray-400 hover:text-blue-500 transition-colors">
                                                <Edit size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}