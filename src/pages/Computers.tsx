import { useState, useEffect } from 'react';
import { getAllComputers } from '../api/computers';

interface Laboratory {
  name: string;
  status: string;
  id: string;
}

interface Computer {
  id: string;
  laboratory_id: Laboratory;
  pc_number: string;
  status: string;
  notes: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  status: number;
  message: string;
  data: {
    computers: Computer[];
  };
}

function Computers() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchComputers();
  }, []);

  const fetchComputers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: ApiResponse = await getAllComputers();
      setComputers(response.data.computers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch computers');
      console.error('Error fetching computers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComputerClick = (computer: Computer) => {
    setSelectedComputer(computer);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedComputer(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'border-green-500';
      case 'occupied':
        return 'border-blue-500';
      case 'reserved':
        return 'border-purple-500';
      case 'maintenance':
        return 'border-yellow-500';
      case 'broken':
      case 'locked':
        return 'border-red-500';
      case 'inactive':
      case 'unavailable':
        return 'border-gray-400';
      default:
        return 'border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const usageCounts = {
    available: computers.filter(c => c.status.toLowerCase() === 'available').length,
    occupied: computers.filter(c => c.status.toLowerCase() === 'occupied').length,
    reserved: computers.filter(c => c.status.toLowerCase() === 'reserved').length,
    maintenance: computers.filter(c => c.status.toLowerCase() === 'maintenance').length,
    broken: computers.filter(c => c.status.toLowerCase() === 'broken').length,
    inactive: computers.filter(c => c.status.toLowerCase() === 'inactive').length,
  };

  const totalInUse = computers.length - usageCounts.available - usageCounts.inactive;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Computer Management</h1>
          <p className="text-sm text-gray-500">Dashboard / Computer</p>
        </div>
        <button className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Add New Computer
        </button>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
                <div className="text-gray-500">Loading computers...</div>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-500">{error}</div>
            </div>
          ) : computers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">No computers found</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-4 mb-8">
                {computers.map((computer) => (
                  <div
                    key={computer.id}
                    onClick={() => handleComputerClick(computer)}
                    className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg ${getStatusColor(computer.status)} bg-white hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <svg className="w-12 h-12 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="1.5" />
                      <path d="M8 21h8" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M12 17v4" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">{computer.pc_number}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                Pro tip: The boxes represent the computers. Click on it to display the details.
              </div>
            </>
          )}
        </div>

        <div className="w-64 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">Usage</h2>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-indigo-600">{totalInUse}/{computers.length}</div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-green-500 rounded"></div>
                <span className="text-sm text-gray-700">Available</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{usageCounts.available}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                <span className="text-sm text-gray-700">Occupied</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{usageCounts.occupied}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-500 rounded"></div>
                <span className="text-sm text-gray-700">Reserved</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{usageCounts.reserved}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-yellow-500 rounded"></div>
                <span className="text-sm text-gray-700">Maintenance</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{usageCounts.maintenance}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-red-500 rounded"></div>
                <span className="text-sm text-gray-700">Broken</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{usageCounts.broken}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                <span className="text-sm text-gray-700">Inactive</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{usageCounts.inactive}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Computer Details Dialog */}
      {showDialog && selectedComputer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeDialog}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Computer Details</h2>
              <button
                onClick={closeDialog}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">PC Number</label>
                <p className="text-gray-900">{selectedComputer.pc_number}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Laboratory</label>
                <p className="text-gray-900">{selectedComputer.laboratory_id.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  selectedComputer.status.toLowerCase() === 'available' ? 'bg-green-100 text-green-800' :
                  selectedComputer.status.toLowerCase() === 'occupied' ? 'bg-blue-100 text-blue-800' :
                  selectedComputer.status.toLowerCase() === 'reserved' ? 'bg-purple-100 text-purple-800' :
                  selectedComputer.status.toLowerCase() === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  selectedComputer.status.toLowerCase() === 'broken' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusLabel(selectedComputer.status)}
                </span>
              </div>
              
              {selectedComputer.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Notes</label>
                  <p className="text-gray-900">{selectedComputer.notes}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created At</label>
                <p className="text-gray-900">{new Date(selectedComputer.createdAt).toLocaleString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                <p className="text-gray-900">{new Date(selectedComputer.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeDialog}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  console.log('Edit computer:', selectedComputer.id);
                  // TODO: Implement edit functionality
                }}
                className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Computers;