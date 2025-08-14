import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { setEventStatus } from "@/store/slice/customerSlice";

export default function OrderTabs() {
    const [activeTab, setActiveTab] = useState("ongoing");
    const dispatch = useDispatch();

    return (
        <>
            <div className="flex px-4 py-2">
                <button
                    className={`px-4 py-2 font-semibold ${activeTab === "ongoing" ? "bg-white text-black rounded-lg" : "text-gray-500"}`}
                    onClick={() => {
                        setActiveTab("ongoing");
                        dispatch(setEventStatus(0));
                    }}
                >
                    Ongoing
                </button>
                <button
                    className={`px-4 py-2 font-semibold ${activeTab === "previous" ? "bg-white text-black rounded-lg" : "text-gray-500"}`}
                    onClick={() => {
                        setActiveTab("previous");
                        dispatch(setEventStatus(1));
                    }}
                >
                    Previous
                </button>
            </div>
        </>
    );
}
