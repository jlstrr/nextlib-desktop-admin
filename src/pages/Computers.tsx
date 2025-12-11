import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { getAllComputers, createComputer, updateComputer, deleteComputer, updateComputerStatus } from '../api/computers';
import { getAllLaboratories } from '../api/laboratory';

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
  const [selectedComputers, setSelectedComputers] = useState<string[]>([]);
  const [isBulkLocking, setIsBulkLocking] = useState(false);
  const [isBulkUnlocking, setIsBulkUnlocking] = useState(false);
  const [isBulkMaintaining, setIsBulkMaintaining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingComputer, setEditingComputer] = useState<Computer | null>(null);
  const [computerToDelete, setComputerToDelete] = useState<Computer | null>(null);
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; computer: Computer } | null>(null);
  const [formData, setFormData] = useState({
    laboratory_id: '',
    pc_number: '',
    status: 'available',
    notes: ''
  });

  useEffect(() => {
    fetchComputers();
    fetchLaboratories();
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

  const fetchLaboratories = async () => {
    try {
      const response: any = await getAllLaboratories();
      setLaboratories(response.data.laboratories || []);
    } catch (err) {
      console.error('Error fetching laboratories:', err);
    }
  };

  const handleAddNewComputer = () => {
    setShowAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setShowAddDialog(false);
    setFormData({
      laboratory_id: '',
      pc_number: '',
      status: 'available',
      notes: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitComputer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingComputer) {
        await updateComputer(editingComputer.id, formData);
        handleCloseEditDialog();
      } else {
        await createComputer(formData);
        handleCloseAddDialog();
      }
      fetchComputers();
    } catch (err) {
      console.error('Failed to save computer:', err);
      alert(err instanceof Error ? err.message : 'Failed to save computer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setEditingComputer(null);
    setFormData({
      laboratory_id: '',
      pc_number: '',
      status: 'available',
      notes: ''
    });
  };

  const handleEditComputer = (computer: Computer) => {
    setEditingComputer(computer);
    setFormData({
      laboratory_id: computer.laboratory_id.id,
      pc_number: computer.pc_number,
      status: computer.status,
      notes: computer.notes || ''
    });
    setShowEditDialog(true);
    setContextMenu(null);
  };

  const handleDeleteClick = (computer: Computer) => {
    setComputerToDelete(computer);
    setShowDeleteDialog(true);
    setContextMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!computerToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteComputer(computerToDelete.id);
      setShowDeleteDialog(false);
      setComputerToDelete(null);
      fetchComputers();
    } catch (err) {
      console.error('Failed to delete computer:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete computer');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setComputerToDelete(null);
  };

  const handleComputerClick = (computer: Computer) => {
    setSelectedComputer(computer);
    setShowDialog(true);
  };

  const handleSelectComputer = (id: string) => {
    setSelectedComputers(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedComputers.length === computers.length) {
      setSelectedComputers([]);
    } else {
      setSelectedComputers(computers.map(c => c.id));
    }
  };

  const handleBulkLock = async () => {
    if (selectedComputers.length === 0) return;
    setIsBulkLocking(true);
    try {
      await Promise.all(
        selectedComputers.map(id => {
          const comp = computers.find(c => c.id === id);
          if (comp && comp.status.toLowerCase() !== 'locked') {
            return updateComputerStatus(id, 'locked');
          }
          return Promise.resolve();
        })
      );
      setSelectedComputers([]);
      fetchComputers();
    } catch (err) {
      alert('Failed to lock selected computers.');
    } finally {
      setIsBulkLocking(false);
    }
  };

  const handleBulkUnlock = async () => {
    if (selectedComputers.length === 0) return;
    setIsBulkUnlocking(true);
    try {
      await Promise.all(
        selectedComputers.map(id => {
          const comp = computers.find(c => c.id === id);
          if (comp && comp.status.toLowerCase() === 'locked') {
            return updateComputerStatus(id, 'available');
          }
          return Promise.resolve();
        })
      );
      setSelectedComputers([]);
      fetchComputers();
    } catch (err) {
      alert('Failed to unlock selected computers.');
    } finally {
      setIsBulkUnlocking(false);
    }
  };

  const handleBulkMaintenance = async () => {
    if (selectedComputers.length === 0) return;
    setIsBulkMaintaining(true);
    try {
      await Promise.all(
        selectedComputers.map(id => {
          const comp = computers.find(c => c.id === id);
          if (comp && comp.status.toLowerCase() !== 'maintenance') {
            return updateComputerStatus(id, 'maintenance');
          }
          return Promise.resolve();
        })
      );
      setSelectedComputers([]);
      fetchComputers();
    } catch (err) {
      alert('Failed to set maintenance for selected computers.');
    } finally {
      setIsBulkMaintaining(false);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedComputer(null);
  };

  const handleContextMenu = (e: React.MouseEvent, computer: Computer) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      computer
    });
  };

  const handleLock = async (computer: Computer) => {
    try {
      await updateComputerStatus(computer.id, 'locked');
      fetchComputers();
      setContextMenu(null);
    } catch (err) {
      console.error('Failed to lock computer:', err);
      alert(err instanceof Error ? err.message : 'Failed to lock computer');
    }
  };

  const handleUnlock = async (computer: Computer) => {
    try {
      await updateComputerStatus(computer.id, 'available');
      fetchComputers();
      setContextMenu(null);
    } catch (err) {
      console.error('Failed to unlock computer:', err);
      alert(err instanceof Error ? err.message : 'Failed to unlock computer');
    }
  };

  const handleSetAvailable = async (computer: Computer) => {
    try {
      await updateComputerStatus(computer.id, 'available');
      fetchComputers();
      setContextMenu(null);
    } catch (err) {
      console.error('Failed to set as available:', err);
      alert(err instanceof Error ? err.message : 'Failed to set as available');
    }
  };

  const handleMaintenance = async (computer: Computer) => {
    try {
      await updateComputerStatus(computer.id, 'maintenance');
      fetchComputers();
      setContextMenu(null);
    } catch (err) {
      console.error('Failed to set maintenance:', err);
      alert(err instanceof Error ? err.message : 'Failed to set maintenance');
    }
  };

  const handleViewDetails = (computer: Computer) => {
    setSelectedComputer(computer);
    setShowDialog(true);
    setContextMenu(null);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'border-green-500';
      case 'reserved':
        return 'border-purple-500';
      case 'maintenance':
        return 'border-yellow-500';
      case 'locked':
        return 'border-red-500';
      default:
        return 'border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'available') return 'bg-green-100 text-green-800';
    if (s === 'reserved') return 'bg-purple-100 text-purple-800';
    if (s === 'maintenance') return 'bg-yellow-100 text-yellow-800';
    if (s === 'locked') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const usageCounts = {
    available: computers.filter(c => c.status.toLowerCase() === 'available').length,
    reserved: computers.filter(c => c.status.toLowerCase() === 'reserved').length,
    maintenance: computers.filter(c => c.status.toLowerCase() === 'maintenance').length,
    locked: computers.filter(c => c.status.toLowerCase() === 'locked').length,
  };

  const totalInUse = computers.length - usageCounts.available;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Computer Management</h1>
          <p className="text-sm text-gray-500">Dashboard / Computer</p>
        </div>
        <button onClick={handleAddNewComputer} className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
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
                    className={`group relative flex flex-col items-center justify-center p-4 border-2 rounded-lg ${getStatusColor(computer.status)} bg-white hover:shadow-md transition-all cursor-pointer ${selectedComputers.includes(computer.id) ? 'ring-2 ring-indigo-500' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedComputers.includes(computer.id)}
                      onChange={() => handleSelectComputer(computer.id)}
                      className="absolute top-2 left-2 w-4 h-4 accent-indigo-600 cursor-pointer"
                      title="Select computer"
                    />
                    <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded ${getStatusBadgeClass(computer.status)}`}>
                      {getStatusLabel(computer.status)}
                    </span>
                    <div
                      onClick={() => handleComputerClick(computer)}
                      onContextMenu={(e) => handleContextMenu(e, computer)}
                      className="w-full h-full flex flex-col items-center justify-center"
                    >
                      <svg className="w-14 h-14 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="1.5" />
                        <path d="M8 21h8" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M12 17v4" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span className="text-base font-semibold text-gray-800">{computer.pc_number}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                Pro tip: The boxes represent the computers. Click on it to display the details.
              </div>

              <div className="mt-6 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={computers.length > 0 && selectedComputers.length === computers.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                  {selectedComputers.length === computers.length ? 'Deselect All' : 'Select All'}
                </label>

                <Menu>
                  <MenuButton
                    disabled={selectedComputers.length === 0}
                    className={`px-3 py-2 bg-indigo-600 text-white rounded text-sm font-medium border border-indigo-700 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Bulk Actions ({selectedComputers.length})
                  </MenuButton>
                  <MenuItems anchor="top end" className="z-10 mt-2 w-52 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                    <div className="p-1">
                      <MenuItem as="button"
                        onClick={handleBulkLock}
                        disabled={selectedComputers.length === 0 || isBulkLocking}
                        className="group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isBulkLocking ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" /> : null}
                        Lock Selected
                      </MenuItem>
                      <MenuItem as="button"
                        onClick={handleBulkUnlock}
                        disabled={selectedComputers.length === 0 || isBulkUnlocking}
                        className="group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isBulkUnlocking ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" /> : null}
                        Unlock Selected
                      </MenuItem>
                      <MenuItem as="button"
                        onClick={handleBulkMaintenance}
                        disabled={selectedComputers.length === 0 || isBulkMaintaining}
                        className="group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isBulkMaintaining ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" /> : null}
                        Set Maintenance
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
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
                <span className="text-sm text-gray-700">Locked</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{usageCounts.locked}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Computer Details Dialog */}
      <Dialog open={showDialog} onClose={closeDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-800">Computer Details</DialogTitle>
              <button
                onClick={closeDialog}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {selectedComputer && (
              <>
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
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedComputer.status.toLowerCase() === 'available' ? 'bg-green-100 text-green-800 capitalize' :
                  selectedComputer.status.toLowerCase() === 'reserved' ? 'bg-purple-100 text-purple-800 capitalize' :
                  selectedComputer.status.toLowerCase() === 'maintenance' ? 'bg-yellow-100 text-yellow-800 capitalize' :
                  selectedComputer.status.toLowerCase() === 'locked' ? 'bg-red-100 text-red-800 capitalize' :
                  'bg-gray-100 text-gray-800 capitalize'
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
                  if (selectedComputer) {
                    handleEditComputer(selectedComputer);
                    closeDialog();
                  }
                }}
                className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Edit
              </button>
            </div>
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
        >
          <button
            onClick={() => handleViewDetails(contextMenu.computer)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </button>
          
          {contextMenu.computer.status.toLowerCase() !== 'locked' && (
            <button
              onClick={() => handleLock(contextMenu.computer)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Lock Computer
            </button>
          )}
          

          <button
            onClick={() => handleMaintenance(contextMenu.computer)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Set Maintenance
          </button>

          {['locked', 'maintenance', 'reserved'].includes(contextMenu.computer.status.toLowerCase()) && (
            <button
              onClick={() => handleSetAvailable(contextMenu.computer)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Unlock Computer
            </button>
          )}
          
          <div className="border-t border-gray-200 my-1"></div>
          
          <button
            onClick={() => handleEditComputer(contextMenu.computer)}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          
          <button
            onClick={() => handleDeleteClick(contextMenu.computer)}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}

      {/* Add Computer Dialog */}
      <Dialog open={showAddDialog} onClose={handleCloseAddDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-800">Add New Computer</DialogTitle>
              <button
                onClick={handleCloseAddDialog}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitComputer}>
              <div className="p-6 space-y-4">
                {/* Laboratory Select */}
                <div>
                  <label htmlFor="laboratory_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Laboratory
                  </label>
                  <select
                    id="laboratory_id"
                    name="laboratory_id"
                    value={formData.laboratory_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select a laboratory</option>
                    {laboratories.map(lab => (
                      <option key={lab.id} value={lab.id}>{lab.name}</option>
                    ))}
                  </select>
                </div>

                {/* PC Number */}
                <div>
                  <label htmlFor="pc_number" className="block text-sm font-medium text-gray-700 mb-1">
                    PC Number
                  </label>
                  <input
                    type="text"
                    id="pc_number"
                    name="pc_number"
                    value={formData.pc_number}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., PC 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Status Select */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="locked">Locked</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Add any additional notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseAddDialog}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isSubmitting ? 'Adding...' : 'Add Computer'}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Edit Computer Dialog */}
      <Dialog open={showEditDialog} onClose={handleCloseEditDialog} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <DialogTitle className="text-xl font-bold text-gray-800">Edit Computer</DialogTitle>
              <button
                onClick={handleCloseEditDialog}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitComputer}>
              <div className="p-6 space-y-4">
                {/* Laboratory Select */}
                <div>
                  <label htmlFor="edit_laboratory_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Laboratory
                  </label>
                  <select
                    id="edit_laboratory_id"
                    name="laboratory_id"
                    value={formData.laboratory_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Select a laboratory</option>
                    {laboratories.map(lab => (
                      <option key={lab.id} value={lab.id}>{lab.name}</option>
                    ))}
                  </select>
                </div>

                {/* PC Number */}
                <div>
                  <label htmlFor="edit_pc_number" className="block text-sm font-medium text-gray-700 mb-1">
                    PC Number
                  </label>
                  <input
                    type="text"
                    id="edit_pc_number"
                    name="pc_number"
                    value={formData.pc_number}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., PC 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>

                {/* Status Select */}
                <div>
                  <label htmlFor="edit_status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="edit_status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="locked">Locked</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="edit_notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="edit_notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Add any additional notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseEditDialog}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isSubmitting ? 'Updating...' : 'Update Computer'}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={handleCancelDelete} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-md w-full bg-white rounded-xl shadow-xl">
            <div className="p-6">
              <DialogTitle className="text-xl font-bold text-gray-800 mb-4">
                Confirm Delete
              </DialogTitle>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{computerToDelete?.pc_number}</span>? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}

export default Computers;
