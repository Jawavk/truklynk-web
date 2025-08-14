import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  isHoverMessageShow?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  text,
  position = 'right',
  isHoverMessageShow = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return {
          tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
          arrow: 'bottom-[-4px] left-1/2 -translate-x-1/2 rotate-45',
        };
      case 'right':
        return {
          tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
          arrow: 'left-[-4px] top-1/2 -translate-y-1/2 rotate-45',
        };
      case 'bottom':
        return {
          tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
          arrow: 'top-[-4px] left-1/2 -translate-x-1/2 rotate-45',
        };
      case 'left':
        return {
          tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
          arrow: 'right-[-4px] top-1/2 -translate-y-1/2 rotate-45',
        };
      default:
        return {
          tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
          arrow: 'left-[-4px] top-1/2 -translate-y-1/2 rotate-45',
        };
    }
  };

  const { tooltip: tooltipPosition, arrow: arrowPosition } = getPositionClasses();

  return (
    <div className='relative inline-block'>
      {/* Only show question mark if not in hover message mode */}
      {!isHoverMessageShow && (
        <div
          ref={triggerRef}
          className='inline-flex items-center justify-center w-3.5 h-3.5 
                     rounded-full border border-gray-400 text-gray-600 
                     text-xs font-semibold cursor-pointer select-none border border-green-800 text-green-600'
          onClick={() => setIsVisible(!isVisible)}
        >
          ?
        </div>
      )}

      {/* Show tooltip either on click (normal mode) or always (hover message mode) */}
      {(isVisible || isHoverMessageShow) && (
        <div
          ref={tooltipRef}
          className={`absolute ${tooltipPosition}
                     bg-black text-white text-xs font-medium 
                     px-3 py-1.5 rounded shadow-md 
                     whitespace-nowrap z-50 opacity-100 transition-opacity duration-200`}
        >
          {text}
          {/* Tooltip Arrow */}
          <div className={`absolute w-2 h-2 bg-black ${arrowPosition}`} />
        </div>
      )}
    </div>
  );
};
