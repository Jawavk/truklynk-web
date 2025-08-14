// import React, { useState, useEffect } from 'react';
// import Button from '../components/ui/form/Button';
// import { ArrowRight, Moon } from 'lucide-react';
// import { useDispatch } from 'react-redux';
// import { AppDispatch } from '../store/store';
// import { v4 as uuidv4 } from 'uuid';
// import { useToast } from '../context/ToastContext';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@/context/AuthContext';
// import { z } from 'zod';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import apiService from '@/services/api/apiService';

// const ValidationSchema = z.object({
//     phoneNumber: z
//         .string()
//         .nonempty("Phone number is required")
//         .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
//         .refine((val) => val.length === 10, {
//             message: "Phone number must be exactly 10 digits",
//         })
// });

// type FormData = z.infer<typeof ValidationSchema>;

// export default function LoginPage({ length = 6 }: { length?: number }) {
//     const [isDropdownOpen, setDropdownOpen] = useState(false);
//     const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
//     const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
//     const [deviceId, setDeviceId] = useState('');
//     const [usersSno, setUsersSno] = useState<number | null>(null);
//     const dispatch = useDispatch<AppDispatch>();
//     const { showToast } = useToast();
//     const navigate = useNavigate();
//     const { login } = useAuth();

//     const {
//         register,
//         formState: { errors },
//         watch,
//         trigger,
//     } = useForm<FormData>({
//         resolver: zodResolver(ValidationSchema),
//         mode: 'onChange',
//     });

//     const phoneNumber = watch("phoneNumber");

//     useEffect(() => {
//         const storedId = localStorage.getItem('device_id');
//         if (storedId) {
//             setDeviceId(storedId);
//         } else {
//             const newId = uuidv4();
//             localStorage.setItem('device_id', newId);
//             setDeviceId(newId);
//         }
//     }, []);

//     const handleDropdownToggle = () => setDropdownOpen(prev => !prev);
//     const handleCountryCodeSelect = (code: string) => {
//         setSelectedCountryCode(code);
//         setDropdownOpen(false);
//     };

//     const handleChange = (value: string, index: number) => {
//         if (value && !/^[0-9]$/.test(value)) return;
//         const newOtp = [...otp];
//         newOtp[index] = value;
//         setOtp(newOtp);

//         if (value && index < otp.length - 1) {
//             const nextInput = document.getElementById(`otp-input-${index + 1}`);
//             if (nextInput) nextInput.focus();
//         }
//     };

//     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
//         if (e.key === 'Backspace' && !otp[index] && index > 0) {
//             const prevInput = document.getElementById(`otp-input-${index - 1}`);
//             if (prevInput) prevInput.focus();
//         }
//     };

//     function generatePushToken() {
//         return 'web-' + Math.random().toString(36).substring(2, 15);
//     }

//     const pushtoken = generatePushToken();


//     const handleVerify = async () => {
//         const isValid = await trigger("phoneNumber");
//         if (!isValid) return;

//         const params = {
//             countryCode: selectedCountryCode,
//             device_id: deviceId,
//             otpHashCode: 'zAjw0dVXYGS',
//             role: 'admin',
//             mobileNumber: phoneNumber,
//             type: 'login',
//         };

//         try {
//             const response : any = await apiService.post('/users/verify', params);
//             const verifyUser = response?.json?.[0]?.verifyuser;

//             if (verifyUser?.code > 0) {
//                 if (verifyUser?.otp) {
//                     const rawOtp = verifyUser.otp.toString().padStart(length, '0');
//                     const otpArray = rawOtp.split('').slice(0, length);
//                     setOtp(new Array(length).fill('').map((_, i) => otpArray[i] || ''));
//                 }

//                 if (verifyUser?.message) {
//                     showToast({ message: verifyUser.message, type: 'success' });
//                 }

//                 if (verifyUser?.usersSno) {
//                     setUsersSno(verifyUser.usersSno);
//                 }
//             } else {
//                 showToast({ message: verifyUser?.message || 'Verification failed', type: 'error' });
//             }
//         } catch (error: any) {
//             const errorMessage = error.response?.data?.message || 'Something went wrong';
//             showToast({ message: errorMessage, type: 'error' });
//         }
//     };


//     const handleSignin = async () => {
//         const isValid = await trigger("phoneNumber");
//         if (!isValid) return;

//         const formattedOtp = otp.join('');
//         if (!usersSno) return;

//         const params = {
//             device_id: deviceId,
//             device_type: 'web',
//             push_token: pushtoken,
//             users_sno: usersSno,
//             mobileNumber: phoneNumber,
//             otp: formattedOtp,
//         };

//         try {
//             const response : any = await apiService.post('/users/login', params);
//             const loginUser = response?.json?.[0]?.loginuser;

//             if (loginUser?.code > 0 && loginUser?.message === "Login successfully") {
//                 const userToStore = { ...loginUser, mobileNumber: phoneNumber };
//                 localStorage.setItem('userData', JSON.stringify(userToStore));
//                 showToast({ message: loginUser.message, type: 'success' });
//                 login();
//                 navigate('/');
//             } else {
//                 showToast({ message: loginUser?.message || 'Invalid user', type: 'error' });
//             }
//         } catch (error: any) {
//             const errorMessage = error.response?.data?.message || "Something went wrong";
//             showToast({ message: errorMessage, type: 'error' });
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-black via-[#1C1C1C] to-[#0A0A0A]">
//             <header className="w-full py-4 px-6 flex justify-between items-center">
//                 <img src="assets/images/logo.png" className="h-8" />
//                 <div className="flex gap-4">
//                     <button className="p-2 rounded-full hover:bg-white/10">
//                         <Moon className="text-white w-5 h-5" />
//                     </button>
//                     <Button
//                         variant="outline"
//                         className="text-white border-white/20 hover:bg-white/10 px-8 py-2 rounded-lg"
//                         onClick={() => navigate('/signup')}
//                     >
//                         Sign Up
//                     </Button>
//                 </div>
//             </header>

//             <main className="flex flex-col items-center justify-center px-4 py-12">
//                 <div className="w-full max-w-md bg-transparent p-8 rounded-xl">
//                     <h2 className="text-white text-5xl text-center mb-10">Sign In</h2>

//                     <Button variant="outline" className="w-full bg-white text-black flex justify-center items-center py-3">
//                         <img src="assets/images/google2.png" className="w-8 h-5 mr-2" />
//                         Google
//                     </Button>

//                     <div className="flex items-center my-6">
//                         <div className="flex-grow border-t border-white/20"></div>
//                         <span className="mx-4 text-white/70 text-sm">Or</span>
//                         <div className="flex-grow border-t border-white/20"></div>
//                     </div>
//                     <div className="mb-10">
//                         <div className="flex items-center rounded-lg bg-transparent">
//                             <div className="flex items-center h-12   border-b border-white/30 ">
//                                 <div className="pl-4 pr-3 text-white/80 flex items-center h-full">
//                                     <img src='assets/images/india.png' className='w-6 h-6 mr-2' />
//                                     <div className="relative">                                           
//                                          <div onClick={handleDropdownToggle} className="cursor-pointer flex items-center">
//                                         <span className="font-medium">{selectedCountryCode}</span>
//                                         <span>
//                                             <img src='assets/images/images.jpeg' className='ml-2 w-6 h-5' />
//                                         </span>
//                                     </div>

//                                         {isDropdownOpen && (
//                                             <div className="absolute top-full left-0 z-10 mt-1 w-32 bg-gray-800 text-white border border-white/30 rounded shadow-lg">
//                                                 <ul>
//                                                     <li onClick={() => handleCountryCodeSelect("+91")} className="px-4 py-2 cursor-pointer hover:bg-white/10">+91 - India</li>
//                                                     <li onClick={() => handleCountryCodeSelect("+1")} className="px-4 py-2 cursor-pointer hover:bg-white/10">+1 - USA</li>
//                                                     <li onClick={() => handleCountryCodeSelect("+44")} className="px-4 py-2 cursor-pointer hover:bg-white/10">+44 - UK</li>
//                                                 </ul>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="flex-1 flex items-center h-12 border-b border-white/30 ml-2">
//                                 <input
//                                     type="tel"
//                                     placeholder="Phone number"
//                                     {...register("phoneNumber")}
//                                     maxLength={10}
//                                     className="w-full px-3 py-3 bg-transparent text-white placeholder:text-white/60 outline-none"
//                                 />
//                             </div>
//                             <div className="ml-2 h-12 flex items-center border-b border-white/30">
//                                 <Button variant="primary" className="text-white h-full" onClick={handleVerify}>
//                                     Verify
//                                 </Button>
//                             </div>
//                         </div>
//                         {errors.phoneNumber && (
//                             <p className="text-red-500 text-sm mt-4">{errors.phoneNumber.message}</p>
//                         )}
//                     </div>


//                     <div className="mb-6">
//                         <label className="block text-white/80 text-xs mb-2">Verification</label>
//                         <div className="flex justify-center space-x-3">
//                             {otp.map((digit, index) => (
//                                 <input
//                                     key={index}
//                                     id={`otp-input-${index}`}
//                                     type="text"
//                                     maxLength={1}
//                                     value={digit}
//                                     onChange={(e) => handleChange(e.target.value, index)}
//                                     onKeyDown={(e) => handleKeyDown(e, index)}
//                                     onFocus={(e) => e.target.select()}
//                                     className="w-12 h-12 text-center text-xl border-b-2 border-gray-500 text-white bg-transparent focus:border-red-500 outline-none"
//                                     placeholder="•"
//                                 />
//                             ))}
//                         </div>
//                     </div>

//                     <Button
//                         size="md"
//                         onClick={handleSignin}
//                         className="w-full bg-red-600 hover:bg-red-700 text-white mt-6 py-3 rounded-lg font-medium"
//                     >
//                         Sign In
//                         <ArrowRight className="text-white w-4 h-4 ml-2" />
//                     </Button>
//                 </div>
//             </main>
//         </div>
//     );
// }



import React, { useState, useEffect } from 'react';
import Button from '../components/ui/form/Button';
import { ArrowRight, Moon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import apiService from '@/services/api/apiService';

const ValidationSchema = z.object({
    phoneNumber: z
        .string()
        .nonempty("Phone number is required")
        .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
        .refine((val) => val.length === 10, {
            message: "Phone number must be exactly 10 digits",
        })
});

type FormData = z.infer<typeof ValidationSchema>;

// Enhanced localStorage utilities
const localStorageUtils = {
    setItem: (key: string, value: any): boolean => {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            // Verify the data was stored correctly
            const stored = localStorage.getItem(key);
            console.log(`✅ Successfully stored ${key}:`, stored ? JSON.parse(stored) : null);
            return true;
        } catch (error) {
            console.error(`❌ Failed to store ${key}:`, error);
            return false;
        }
    },

    getItem: <T = any>(key: string): T | null => {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                console.log(`🔍 No data found for key: ${key}`);
                return null;
            }
            const parsed = JSON.parse(item);
            console.log(`✅ Retrieved ${key}:`, parsed);
            return parsed;
        } catch (error) {
            console.error(`❌ Failed to retrieve ${key}:`, error);
            return null;
        }
    },

    removeItem: (key: string): void => {
        try {
            localStorage.removeItem(key);
            console.log(`🗑️ Removed ${key} from localStorage`);
        } catch (error) {
            console.error(`❌ Failed to remove ${key}:`, error);
        }
    },

    checkAvailability: (): boolean => {
        try {
            const testKey = '__localStorage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch {
            return false;
        }
    }
};

export default function LoginPage({ length = 6 }: { length?: number }) {
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
    const [deviceId, setDeviceId] = useState('');
    const [usersSno, setUsersSno] = useState<number | null>(null);
    const [storageAvailable, setStorageAvailable] = useState(false);
    
    const dispatch = useDispatch<AppDispatch>();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { login } = useAuth();

    const {
        register,
        formState: { errors },
        watch,
        trigger,
    } = useForm<FormData>({
        resolver: zodResolver(ValidationSchema),
        mode: 'onChange',
    });

    const phoneNumber = watch("phoneNumber");

    // Enhanced useEffect for localStorage initialization
    useEffect(() => {
        // Check if localStorage is available
        const isAvailable = localStorageUtils.checkAvailability();
        setStorageAvailable(isAvailable);
        
        if (!isAvailable) {
            console.warn('⚠️ localStorage is not available');
            showToast({ 
                message: 'Browser storage not available. Login may not persist.', 
                type: 'warning' 
            });
            return;
        }

        // Log all current localStorage contents for debugging
        console.log('🔍 Current localStorage contents:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                console.log(`  ${key}:`, localStorageUtils.getItem(key));
            }
        }

        // Handle device ID
        const storedId = localStorageUtils.getItem<string>('device_id');
        if (storedId) {
            setDeviceId(storedId);
            console.log('📱 Using existing device ID:', storedId);
        } else {
            const newId = uuidv4();
            const success = localStorageUtils.setItem('device_id', newId);
            if (success) {
                setDeviceId(newId);
                console.log('📱 Generated new device ID:', newId);
            }
        }

        // Check for existing user data
        const userData = localStorageUtils.getItem('userData');
        if (userData) {
            console.log('👤 Found existing user data:', userData);
            // Optionally redirect to dashboard if user is already logged in
            // navigate('/dashboard');
        } else {
            console.log('👤 No existing user data found');
        }
    }, []);

    // Add window beforeunload event to ensure data persistence
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            // Force a final save attempt before page unload
            const userData = localStorageUtils.getItem('userData');
            if (userData) {
                localStorageUtils.setItem('userData', userData);
                console.log('💾 Final save before unload');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    const handleDropdownToggle = () => setDropdownOpen(prev => !prev);
    const handleCountryCodeSelect = (code: string) => {
        setSelectedCountryCode(code);
        setDropdownOpen(false);
    };

    const handleChange = (value: string, index: number) => {
        if (value && !/^[0-9]$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < otp.length - 1) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    function generatePushToken() {
        return 'web-' + Math.random().toString(36).substring(2, 15);
    }

    const pushtoken = generatePushToken();

    const handleVerify = async () => {
        const isValid = await trigger("phoneNumber");
        if (!isValid) return;

        const params = {
            countryCode: selectedCountryCode,
            device_id: deviceId,
            otpHashCode: 'zAjw0dVXYGS',
            role: 'admin',
            mobileNumber: phoneNumber,
            type: 'login',
        };

        try {
            const response: any = await apiService.post('/users/verify', params);
            const verifyUser = response?.json?.[0]?.verifyuser;

            if (verifyUser?.code > 0) {
                if (verifyUser?.otp) {
                    const rawOtp = verifyUser.otp.toString().padStart(length, '0');
                    const otpArray = rawOtp.split('').slice(0, length);
                    setOtp(new Array(length).fill('').map((_, i) => otpArray[i] || ''));
                }

                if (verifyUser?.message) {
                    showToast({ message: verifyUser.message, type: 'success' });
                }

                if (verifyUser?.usersSno) {
                    setUsersSno(verifyUser.usersSno);
                }
            } else {
                showToast({ message: verifyUser?.message || 'Verification failed', type: 'error' });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Something went wrong';
            showToast({ message: errorMessage, type: 'error' });
        }
    };

    const handleSignin = async () => {
        const isValid = await trigger("phoneNumber");
        if (!isValid) return;

        const formattedOtp = otp.join('');
        if (!usersSno) return;

        const params = {
            device_id: deviceId,
            device_type: 'web',
            push_token: pushtoken,
            users_sno: usersSno,
            mobileNumber: phoneNumber,
            otp: formattedOtp,
        };

        try {
            const response: any = await apiService.post('/users/login', params);
            const loginUser = response?.json?.[0]?.loginuser;

            if (loginUser?.code > 0 && loginUser?.message === "Login successfully") {
                const userToStore = { 
                    ...loginUser, 
                    mobileNumber: phoneNumber,
                    loginTimestamp: new Date().toISOString(), // Add timestamp for debugging
                    deviceId: deviceId
                };
                
                // Enhanced storage with multiple attempts and verification
                const storageSuccess = localStorageUtils.setItem('userData', userToStore);
                
                if (storageSuccess) {
                    // Verify the data was actually stored
                    const verifyStored = localStorageUtils.getItem('userData');
                    if (verifyStored) {
                        console.log('✅ User data successfully stored and verified');
                        showToast({ message: loginUser.message, type: 'success' });
                        login();
                        
                        // Small delay to ensure storage is complete before navigation
                        setTimeout(() => {
                            navigate('/');
                        }, 100);
                    } else {
                        console.error('❌ Storage verification failed');
                        showToast({ message: 'Login successful but session may not persist', type: 'warning' });
                    }
                } else {
                    console.error('❌ Failed to store user data');
                    showToast({ message: 'Login successful but session may not persist', type: 'warning' });
                }
            } else {
                showToast({ message: loginUser?.message || 'Invalid user', type: 'error' });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong";
            showToast({ message: errorMessage, type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-[#1C1C1C] to-[#0A0A0A]">
            {/* Debug info - remove in production */}
            {/* {process.env.NODE_ENV === 'development' && (
                <div className="fixed top-0 right-0 bg-black/80 text-white p-2 text-xs z-50 max-w-xs">
                    <div>Storage Available: {storageAvailable ? '✅' : '❌'}</div>
                    <div>Device ID: {deviceId.slice(0, 8)}...</div>
                    <div>User Data: {localStorageUtils.getItem('userData') ? '✅' : '❌'}</div>
                </div>
            )} */}
            
            <header className="w-full py-4 px-6 flex justify-between items-center">
                <img src="assets/images/logo.png" className="h-8" />
                <div className="flex gap-4">
                    <button className="p-2 rounded-full hover:bg-white/10">
                        <Moon className="text-white w-5 h-5" />
                    </button>
                    <Button
                        variant="outline"
                        className="text-white border-white/20 hover:bg-white/10 px-8 py-2 rounded-lg"
                        onClick={() => navigate('/signup')}
                    >
                        Sign Up
                    </Button>
                </div>
            </header>

            <main className="flex flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-md bg-transparent p-8 rounded-xl">
                    <h2 className="text-white text-5xl text-center mb-10">Sign In</h2>

                    <Button variant="outline" className="w-full bg-white text-black flex justify-center items-center py-3">
                        <img src="assets/images/google2.png" className="w-8 h-5 mr-2" />
                        Google
                    </Button>

                    <div className="flex items-center my-6">
                        <div className="flex-grow border-t border-white/20"></div>
                        <span className="mx-4 text-white/70 text-sm">Or</span>
                        <div className="flex-grow border-t border-white/20"></div>
                    </div>
                    
                    <div className="mb-10">
                        <div className="flex items-center rounded-lg bg-transparent">
                            <div className="flex items-center h-12 border-b border-white/30">
                                <div className="pl-4 pr-3 text-white/80 flex items-center h-full">
                                    <img src='assets/images/india.png' className='w-6 h-6 mr-2' />
                                    <div className="relative">                                           
                                        <div onClick={handleDropdownToggle} className="cursor-pointer flex items-center">
                                            <span className="font-medium">{selectedCountryCode}</span>
                                            <span>
                                                <img src='assets/images/images.jpeg' className='ml-2 w-6 h-5' />
                                            </span>
                                        </div>

                                        {isDropdownOpen && (
                                            <div className="absolute top-full left-0 z-10 mt-1 w-32 bg-gray-800 text-white border border-white/30 rounded shadow-lg">
                                                <ul>
                                                    <li onClick={() => handleCountryCodeSelect("+91")} className="px-4 py-2 cursor-pointer hover:bg-white/10">+91 - India</li>
                                                    <li onClick={() => handleCountryCodeSelect("+1")} className="px-4 py-2 cursor-pointer hover:bg-white/10">+1 - USA</li>
                                                    <li onClick={() => handleCountryCodeSelect("+44")} className="px-4 py-2 cursor-pointer hover:bg-white/10">+44 - UK</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex items-center h-12 border-b border-white/30 ml-2">
                                <input
                                    type="tel"
                                    placeholder="Phone number"
                                    {...register("phoneNumber")}
                                    maxLength={10}
                                    className="w-full px-3 py-3 bg-transparent text-white placeholder:text-white/60 outline-none"
                                />
                            </div>
                            <div className="ml-2 h-12 flex items-center border-b border-white/30">
                                <Button variant="primary" className="text-white h-full" onClick={handleVerify}>
                                    Verify
                                </Button>
                            </div>
                        </div>
                        {errors.phoneNumber && (
                            <p className="text-red-500 text-sm mt-4">{errors.phoneNumber.message}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-white/80 text-xs mb-2">Verification</label>
                        <div className="flex justify-center space-x-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-input-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onFocus={(e) => e.target.select()}
                                    className="w-12 h-12 text-center text-xl border-b-2 border-gray-500 text-white bg-transparent focus:border-red-500 outline-none"
                                    placeholder="•"
                                />
                            ))}
                        </div>
                    </div>

                    <Button
                        size="md"
                        onClick={handleSignin}
                        className="w-full bg-red-600 hover:bg-red-700 text-white mt-6 py-3 rounded-lg font-medium"
                    >
                        Sign In
                        <ArrowRight className="text-white w-4 h-4 ml-2" />
                    </Button>
                </div>
            </main>
        </div>
    );
}