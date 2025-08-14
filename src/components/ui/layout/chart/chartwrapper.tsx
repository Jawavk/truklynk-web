import { useState, useRef, ReactNode } from 'react';
import { Download, Expand, Minimize2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ChartWrapperProps {
  children: ReactNode;
  title: string;
  downloadFileName: string;
  height?: number;
  className?: string;
  headerContent?: ReactNode;
}

export const ChartWrapper = ({
  children,
  title,
  downloadFileName,
  height = 400,
  className = "",
  headerContent
}: ChartWrapperProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const chartRef = useRef(null);

  const handleDownloadPDF = async () => {
    const chartElement = chartRef.current;
    if (chartElement) {
      const canvas = await html2canvas(chartElement);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${downloadFileName}.pdf`);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${isFullScreen ? 'fixed inset-0 z-50' : ''} ${className}`}>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <div className="flex items-center gap-4">
            {headerContent}
            <button
              onClick={handleDownloadPDF}
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              title="Download PDF"
            >
              <Download size={20} />
            </button>
            <button
              onClick={toggleFullScreen}
              className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              title={isFullScreen ? "Exit Fullscreen" : "View Fullscreen"}
            >
              {isFullScreen ? <Minimize2 size={20} /> : <Expand size={20} />}
            </button>
          </div>
        </div>
      </div>
      
      <div 
        ref={chartRef}
        style={{ height: isFullScreen ? 'calc(100vh - 200px)' : `${height}px` }}
      >
        {children}
      </div>
    </div>
  );
}; 