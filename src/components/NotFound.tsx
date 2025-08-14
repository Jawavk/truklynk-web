import { AlertCircle } from 'lucide-react';

export const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 animate-fadeIn">
            <div className="text-center m-auto">
                <div className="flex justify-center items-center">
                    <AlertCircle className="w-24 h-24 text-gray-400 mb-8 animate-bounce" />

                </div>
                <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Oops! Page not found</p>
                <a
                    href="/"
                    className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                >
                    Go Back Home
                </a>
            </div>
        </div>
    );
}; 