import React, { useEffect, useRef, useState, ReactNode, MouseEvent } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// Define prop types with detailed interface
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: React.ReactNode;
  type?: 'default' | 'warning' | 'success' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  dialogClassName?: string;
  overlayClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  type = 'default',
  size = 'md',
  closeOnOverlay = true,
  closeOnEscape = true,
  className = '',
  header,
  footer,
  dialogClassName = '',
  overlayClassName = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Modal type configurations
  const modalTypes = {
    default: {
      icon: null,
      iconClass: '',
      borderClass: 'border-gray-200'
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
      iconClass: 'text-yellow-500',
      borderClass: 'border-yellow-300'
    },
    success: {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      iconClass: 'text-green-500',
      borderClass: 'border-green-300'
    },
    error: {
      icon: <X className="w-6 h-6 text-red-500" />,
      iconClass: 'text-red-500',
      borderClass: 'border-red-300'
    },
    info: {
      icon: <Info className="w-6 h-6 text-orange-500" />,
      iconClass: 'text-orange-500',
      borderClass: 'border-orange-300'
    }
  };

  // Size configurations
  // const sizeClasses = {
  //     sm: 'max-w-sm',
  //     md: 'max-w-md',
  //     lg: 'max-w-lg',
  //     xl: 'w-4/12 max-w-xl',
  //     '2xl': 'w-6/12 max-w-2xl',
  //     full: 'w-11/12 max-w-6xl'
  // };

  // Animate modal in and out
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => {
        if (modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusableElements.length > 0) {
            (focusableElements[0] as HTMLElement).focus();
          }
        }
      }, 100);
      return; // 👈 Add this line to satisfy TS7030
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  

  // Keyboard and overlay event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Prevent rendering if not visible
  if (!isOpen && !isVisible) return null;

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOverlay) {
      onClose();
    }
  };

  const typeConfig = modalTypes[type] || modalTypes.default;

  return (
    <div
      className={`
                fixed inset-0 z-50 flex items-center justify-center 
                transition-all duration-300 ease-in-out 
                ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                ${overlayClassName}
            `}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: isOpen ? 'blur(4px)' : 'none'
      }}
      // onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className={`
                    relative rounded-md shadow-2xl
                    transform transition-all duration-300 ease-in-out p-4
                    border ${typeConfig.borderClass}

                    ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
                    ${dialogClassName}
                    ${className}
                `}
      >
        {/* Close Button */}  
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="
                        absolute top-5 right-4
                        text-gray-500 hover:text-gray-700 
                    "
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Custom or Default Header */}
        <div className="pt-4 pb-4 border-b border-gray-100 ">
          {header || (
            <div className="flex items-center space-x-3">
              {typeConfig.icon && (
                <div className={`${typeConfig.iconClass}`}>
                  {typeConfig.icon}
                </div>
              )}
              {title && (
                <h2 className="text-md font-semibold text-white">
                  {title}
                </h2>
              )}
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="px-6 pt-4">
          {children}
        </div>

        {/* Custom or Default Footer */}
        {footer && (
          <div className="px-4 mt-12 pb-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};



// function MyComponent() {
//     const [isModalOpen, setIsModalOpen] = useState(false);

//     return (
//       <>
//         <button onClick={() => setIsModalOpen(true)}>Open Modal</button>

  //         <Modal 
  //           isOpen={isModalOpen} 
  //           onClose={() => setIsModalOpen(false)}
  //           title="Confirm Action"
  //           type="warning"
  //           size="md"
  //           footer={
  //             <div className="flex justify-end space-x-2">
  //               <button 
  //                 className="px-4 py-2 bg-gray-200 rounded-md"
  //                 onClick={() => setIsModalOpen(false)}
  //               >
  //                 Cancel
  //               </button>
  //               <button 
  //                 className="px-4 py-2 bg-blue-600 text-white rounded-md"
  //                 onClick={() => {
  //                   // Perform action
  //                   setIsModalOpen(false);
  //                 }}
  //               >
  //                 Confirm
  //               </button>
  //             </div>
  //           }
  //         >
  //           <p>Are you sure you want to proceed with this action?</p>
  //         </Modal>
//       </>
//     );
//   }
// ${sizeClasses[size]}




// import React, { useEffect, useRef, useState, ReactNode } from 'react';
// import { X, ChevronRight, Sparkles } from 'lucide-react';

// interface ModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     children: ReactNode;
//     title?: React.ReactNode;
//     subtitle?: string;
//     illustration?: ReactNode;
// }

// export const Modal: React.FC<ModalProps> = ({
//     isOpen,
//     onClose,
//     children,
//     title,
//     subtitle,
//     illustration
// }) => {
//     const [isVisible, setIsVisible] = useState(false);
//     const [animationPhase, setAnimationPhase] = useState(0);
//     const modalRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (isOpen) {
//             setIsVisible(true);
//             document.body.style.overflow = 'hidden';
//             setTimeout(() => setAnimationPhase(1), 50);
//             setTimeout(() => setAnimationPhase(2), 200);
//         } else {
//             setAnimationPhase(0);
//             document.body.style.overflow = 'unset';
//             setTimeout(() => setIsVisible(false), 300);
//         }
//     }, [isOpen]);

//     if (!isVisible) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
//             {/* Backdrop */}
//             <div
//                 className={`
//                     fixed inset-0 bg-black/50 backdrop-blur-lg transition-opacity duration-500
//                     ${animationPhase > 0 ? 'opacity-100' : 'opacity-0'}
//                 `}
//                 onClick={onClose}
//             />

//             {/* Modal Container */}
//             <div
//                 ref={modalRef}
//                 className={`
//                     relative w-full max-w-3xl flex overflow-hidden
//                     bg-white rounded-lg shadow-2xl
//                     transition-transform duration-500 ease-out
//                     ${animationPhase > 0 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
//                 `}
//             >
//                 {/* Side Panel with Orange Gradient */}
//                 <div className={`
//                     hidden lg:flex lg:w-1/3 bg-gradient-to-br 
//                     from-orange-500 via-orange-400 to-orange-600
//                     p-6 flex-col justify-center items-center
//                     transition-all duration-700 ease-out
//                     ${animationPhase > 1 ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
//                 `}>
//                     <div className="relative h-full w-full flex items-center justify-center">
//                         {illustration || <Sparkles className="w-20 h-20 text-white" />}
//                     </div>
//                 </div>

//                 {/* Content Panel */}
//                 <div className="flex-1 flex flex-col bg-white">
//                     {/* Close Button */}
//                     <button
//                         onClick={onClose}
//                         className="absolute top-4 right-4 text-gray-700 hover:text-orange-500 transition-colors"
//                     >
//                         <X className="w-6 h-6" />
//                     </button>

//                     {/* Header */}
//                     <div className="p-6 border-b border-gray-100">
//                         {title && (
//                             <h2 className="text-2xl font-bold text-gray-800">
//                                 {title}
//                             </h2>
//                         )}
//                         {subtitle && (
//                             <p className="mt-1 text-gray-600">{subtitle}</p>
//                         )}
//                     </div>

//                     {/* Content */}
//                     <div className="p-6 flex-1 overflow-y-auto">
//                         {children}
//                     </div>

//                     {/* Footer */}
//                     <div className="p-6 bg-gray-50 flex justify-end">
//                         <button
//                             onClick={onClose}
//                             className="px-4 py-2 text-gray-600 hover:text-black transition-all duration-200"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             className="ml-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 
//                             text-white rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all"
//                         >
//                             Continue
//                             <ChevronRight className="inline-block ml-1 w-4 h-4" />
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Modal;