
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ErrorBoundary } from './components/utility/ErrorBoundary';
// import { ToastProvider } from './context/ToastContext';
// import { ThemeProvider } from './context/ThemeContext';
// import { AuthProvider, useAuth } from '@/context/AuthContext';
// import { Layout } from './components/Layout';
// import { ProtectedRoute } from './components/utility/ProtectedRoute';
// import { NotFound } from './components/NotFound';
// import LoginPage from './pages/LoginPage';

// const AppRoutes = () => {
//   const { isAuthenticated, loading } = useAuth();

//   return (
//     <Routes>
//       <Route path="/login" element={<LoginPage />} />
//       <Route
//         path="/*"
//         element={
//           <ProtectedRoute
//             isAuthenticated={isAuthenticated}
//             authenticationPath="/login"
//             loading={loading}
//           >
//             <Layout />
//           </ProtectedRoute>
//         }
//       />
//       <Route path="*" element={<NotFound />} />
//     </Routes>
//   );
// };

// export const App: React.FC = () => {
//   return (
//     <ErrorBoundary>
//       <Router>
//         <AuthProvider>
//           <ToastProvider>
//             <ThemeProvider>
//               <AppRoutes />
//             </ThemeProvider>
//           </ToastProvider>
//         </AuthProvider>
//       </Router>
//     </ErrorBoundary>
//   );
// };


import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/utility/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/utility/ProtectedRoute';
import { NotFound } from './components/NotFound';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/Signup';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <ThemeProvider>
              <Routes>
                <Route path='/login' element={<LoginPage />} />
                <Route path='/signup' element={<SignUpPage />} />
                <Route
                  path='/*'
                  element={
                    <ProtectedRoute isAuthenticated={true} authenticationPath='/login'>
                      <Layout />
                    </ProtectedRoute>
                  }
                />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </ThemeProvider>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};


