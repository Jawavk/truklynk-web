import { useState } from 'react';

export const DisplayDataContent = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [tableConfig, setTableConfig] = useState<any>(null);
  const [error, setError] = useState('');
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    try {
      const parsed = JSON.parse(e.target.value);
      setTableConfig(parsed);
      setError('');
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const copyToClipboard = () => {
    if (tableConfig) {
      navigator.clipboard.writeText(generateTableCode(tableConfig));
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    }
  };

  return (
    <div className='w-[100%] flex gap-6 p-8 bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Left side - JSON input */}
      <div className='w-1/2 space-y-6'>
        <div className='flex flex-col space-y-2'>
          <h2 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600'>
            Table Configuration
          </h2>
          <p className='text-gray-500'>Paste your JSON configuration below</p>
        </div>
        <div className='relative group'>
          <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000'></div>
          <textarea
            className='relative w-full h-[calc(100vh-250px)] p-6 font-mono text-sm border-0 rounded-xl shadow-lg bg-white/90 backdrop-blur-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none'
            value={jsonInput}
            onChange={handleJsonChange}
            placeholder='{ ... }'
          />
          {error && (
            <div className='absolute bottom-4 left-4 right-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg backdrop-blur-sm'>
              <div className='flex items-center space-x-2'>
                <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Generated React Code */}
      <div className='w-1/2 space-y-6'>
        <div className='flex justify-between items-center'>
          <div className='space-y-2'>
            <h2 className='text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600'>
              Generated Code
            </h2>
            <p className='text-gray-500'>Ready to use Table component</p>
          </div>
          <button
            onClick={copyToClipboard}
            className='group relative inline-flex items-center px-6 py-3 text-sm font-medium text-white transition-all duration-200 ease-in-out transform hover:scale-105'
          >
            <span className='absolute inset-0 w-full h-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-200 ease-in-out group-hover:opacity-90 shadow-lg group-hover:shadow-indigo-500/50'></span>
            <span className='relative flex items-center space-x-2'>
              {showCopyFeedback ? (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3'
                    />
                  </svg>
                  <span>Copy Code</span>
                </>
              )}
            </span>
          </button>
        </div>
        <div className='relative group'>
          <div className='absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000'></div>
          <pre className='relative h-[calc(100vh-250px)] p-6 bg-white/90 backdrop-blur-sm border-0 rounded-xl shadow-lg overflow-auto'>
            <code className='text-sm font-mono selection:bg-indigo-100 selection:text-indigo-900'>
              {tableConfig
                ? generateTableCode(tableConfig)
                : 'Enter valid JSON to see the generated React code'}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};

const generateTableCode = (config: any) => {
  if (!config) return '';
  function convertToCamelCase(str: any) {
    return str
      .replace(/-./g, (match: any) => match.charAt(1).toUpperCase())
      .replace(/^./, (match: any) => match.toLowerCase());
  }

  // Add ViewDetailsModal component code
  const viewDetailsModalCode = `
interface ViewDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ${config.component} | null;
}

function ViewDetailsModal({ isOpen, onClose, data }: ViewDetailsModalProps) {
    if (!data) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
            className="p-6"
        >
            <h2 className="text-xl font-semibold mb-4">${config.title} Details</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    ${Object.entries(config.interface || {})
                      .map(
                        ([key, type]) => `
                    <div className="text-sm font-medium text-gray-500">${key}</div>
                    <div>{data.${key}}</div>`,
                      )
                      .join('\n')}
                </div>
            </div>
        </Modal>
    );
}`;

  // Update main component code to include viewDetails state and modal
  return `import  { useEffect, useState, useMemo, useCallback } from 'react';
import { Table } from '@/components/ui/data-display/Table';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApiService from '@/services/api/apiService';
import { Badge } from '@/components/ui/feedback';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/ui/feedback/ConfirmationModal';
import { Modal } from '@/components/ui/layout/Modal';

interface ${config.component} {
    ${Object.entries(config.interface || {})
      .map(([key, type]) => `    ${key}: ${type};`)
      .join('\n')}
}

${viewDetailsModalCode}

export default function ${config.component}View() {
    const navigate = useNavigate();
    const [data, setData] = useState<${config.component}[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; itemId: number | null }>({
        isOpen: false,
        itemId: null
    });
    const [viewDetails, setViewDetails] = useState<{ isOpen: boolean; data: ${config.component} | null }>({
        isOpen: false,
        data: null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await ApiService.get<{ data: ${config.component}[] }>('masters/${convertToCamelCase(config.endpoint)}');
            setData(response.data);
            toast.success('Data loaded successfully');
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await ApiService.delete(\`${config.endpoint}/\${id}\`);
            toast.success('Item deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.error('Failed to delete item. Please try again.');
        } finally {
            setDeleteDialog({ isOpen: false, itemId: null });
        }
    };

    const columns = useMemo(() => [
        ${config.columns
          .map(
            (col: any) => `{
            key: '${col.key}',
            header: '${col.header}',
            ${col.sortable ? 'sortable: true,' : ''}
            ${
              col.render
                ? `render: (row: ${config.component}) => (
                ${col.render}
            )`
                : ''
            }
        }`,
          )
          .join(',\n        ')},
        {
            key: 'actions',
            header: 'Actions',
            render: (row: ${config.component}) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewDetails({ isOpen: true, data: row })}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="View"
                    >
                        <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                        onClick={() => navigate(\`${config.editPath}/\${row.id}\`)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                        onClick={() => setDeleteDialog({ isOpen: true, itemId: row.id })}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            )
        }
    ], [navigate]);

    const handleAdd = useCallback(() => {
        try {
            navigate('${config.createPath}');
        } catch (error) {
            console.error('Error navigating to create:', error);
            toast.error('Failed to open create page');
        }
    }, [navigate]);

    return (
        <>
            <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">${config.title}</h1>
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                        ${config.addButtonText}
                    </button>
                </div>
                
                <Table
                    data={data}
                    columns={columns}
                    pageSize={${config.pageSize || 10}}
                    searchable
                    enableExport
                    enableColumnVisibility
                    isLoading={loading}
                    buttonTxt='${config.title}'
                    onAddButtonClick={handleAdd}   
                     

                />
            </div>

            <ViewDetailsModal
                isOpen={viewDetails.isOpen}
                onClose={() => setViewDetails({ isOpen: false, data: null })}
                data={viewDetails.data}
            />

            <ConfirmationModal
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, itemId: null })}
                onConfirm={() => deleteDialog.itemId && handleDelete(deleteDialog.itemId.toString())}
                title="Confirm Deletion"
                message="Are you sure you want to delete this item? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </>
    );
}`;
};
