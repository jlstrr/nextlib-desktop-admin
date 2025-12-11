import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Grid3X3, List, Calendar, ChevronUp, ChevronDown, Search, MapPin, Clock } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { getSubjectSchedules, createSubjectSchedule, deleteSubjectSchedule, updateSubjectSchedule } from '../api/subject-scheduler';

interface Schedule {
  id: string;
  subjectName: string;
  instructorName: string;
  date: string;
  timeslot: string;
  isRepeat: boolean;
  repeatInterval?: string;
  repeatEndDate?: string;
}

// Mock data
const mockSchedules: Schedule[] = [];

type ViewType = 'row' | 'grid' | 'calendar';

interface FormData {
  subjectName: string;
  instructorName: string;
  date: string;
  timeslot: string;
  isRepeat: boolean;
  repeatInterval: string;
  repeatEndDate: string;
}

function SubjectScheduler() {
  const [view, setView] = useState<ViewType>('row');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 5));
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Load schedules from API on component mount
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const data = await getSubjectSchedules();
        if (Array.isArray(data)) {
          setSchedules(mapApiResponseToSchedules(data));
        }
      } catch (error) {
        console.error('Error loading schedules:', error);
        // Keep mock data on error
      }
    };
    loadSchedules();
  }, []);
  
  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    subjectName: '',
    instructorName: '',
    date: '',
    timeslot: '',
    isRepeat: false,
    repeatInterval: '',
    repeatEndDate: '',
  });
  
  // Error states
  const [createError, setCreateError] = useState<string>('');
  const [editError, setEditError] = useState<string>('');

  // Table state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'subjectName' | 'date' | 'timeslot'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [repeatFilter, setRepeatFilter] = useState<'all' | 'repeat' | 'non-repeat'>('all');
  const itemsPerPage = 10;

  // Helper function to map API response to Schedule interface
  const mapApiResponseToSchedules = (data: any[]): Schedule[] => {
    return data.map((schedule: any) => ({
      id: schedule._id,
      subjectName: schedule.subjectName,
      instructorName: schedule.instructorName,
      date: schedule.date,
      timeslot: schedule.timeslot,
      isRepeat: schedule.isRepeat,
      repeatInterval: schedule.repeatInterval,
      repeatEndDate: schedule.repeatEndDate,
    }));
  };

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getSchedulesForDate = (date: string) => {
    return schedules.filter(schedule => {
      // Extract date part from ISO format (2025-12-09T00:00:00.000Z -> 2025-12-09)
      const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
      return scheduleDate === date;
    });
  };

  const handleCreateNew = () => {
    setFormData({
      subjectName: '',
      instructorName: '',
      date: '',
      timeslot: '',
      isRepeat: false,
      repeatInterval: '',
      repeatEndDate: '',
    });
    setStartTime('');
    setEndTime('');
    setCreateError('');
    setIsCreateOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    // Convert ISO date format to yyyy-MM-dd format
    const dateOnly = schedule.date.split('T')[0];
    const repeatDateOnly = schedule.repeatEndDate ? schedule.repeatEndDate.split('T')[0] : '';
    
    setFormData({
      subjectName: schedule.subjectName,
      instructorName: schedule.instructorName,
      date: dateOnly,
      timeslot: schedule.timeslot,
      isRepeat: schedule.isRepeat,
      repeatInterval: schedule.repeatInterval || '',
      repeatEndDate: repeatDateOnly,
    });
    // Parse timeslot into start and end time
    if (schedule.timeslot) {
      const [start, end] = schedule.timeslot.split(' - ');
      setStartTime(start?.trim() || '');
      setEndTime(end?.trim() || '');
    }
    setEditError('');
    setIsEditOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingScheduleId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingScheduleId) {
      try {
        console.log('Deleting schedule with ID:', deletingScheduleId);
        await deleteSubjectSchedule(deletingScheduleId);
        console.log('Schedule deleted successfully');
        setIsDeleteOpen(false);
        setDeletingScheduleId(null);
        // Refetch schedules
        const data = await getSubjectSchedules();
        if (Array.isArray(data)) {
          setSchedules(mapApiResponseToSchedules(data));
        }
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert(`Error deleting schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleCreateSubmit = async () => {
    if (formData.subjectName && formData.instructorName && formData.date && startTime && endTime) {
      try {
        setCreateError('');
        const timeslot = `${startTime} - ${endTime}`;
        // Convert date from yyyy-MM-dd to ISO format for API
        const isoDate = new Date(formData.date).toISOString();
        const repeatEndIsoDate = formData.repeatEndDate ? new Date(formData.repeatEndDate).toISOString() : undefined;
        
        const payload = {
          subjectName: formData.subjectName,
          instructorName: formData.instructorName,
          date: isoDate,
          timeslot: timeslot,
          isRepeat: formData.isRepeat,
          ...(formData.isRepeat && {
            repeatInterval: formData.repeatInterval,
            repeatEndDate: repeatEndIsoDate,
          }),
        };
        await createSubjectSchedule(payload);
        setIsCreateOpen(false);
        // Refetch schedules
        const data = await getSubjectSchedules();
        if (Array.isArray(data)) {
          setSchedules(mapApiResponseToSchedules(data));
        }
      } catch (error) {
        console.error('Error creating schedule:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error creating schedule';
        setCreateError(errorMessage);
      }
    }
  };

  const handleEditSubmit = async () => {
    if (editingSchedule && formData.subjectName && formData.instructorName && formData.date && startTime && endTime) {
      try {
        setEditError('');
        const timeslot = `${startTime} - ${endTime}`;
        // Convert date from yyyy-MM-dd to ISO format for API
        const isoDate = new Date(formData.date).toISOString();
        const repeatEndIsoDate = formData.repeatEndDate ? new Date(formData.repeatEndDate).toISOString() : undefined;
        
        const payload = {
          subjectName: formData.subjectName,
          instructorName: formData.instructorName,
          date: isoDate,
          timeslot: timeslot,
          isRepeat: formData.isRepeat,
          ...(formData.isRepeat && {
            repeatInterval: formData.repeatInterval,
            repeatEndDate: repeatEndIsoDate,
          }),
        };
        await updateSubjectSchedule(editingSchedule.id, payload);
        setIsEditOpen(false);
        setEditingSchedule(null);
        // Refetch schedules
        const data = await getSubjectSchedules();
        if (Array.isArray(data)) {
          setSchedules(mapApiResponseToSchedules(data));
        }
      } catch (error) {
        console.error('Error updating schedule:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error updating schedule';
        setEditError(errorMessage);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDateFull = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const ScheduleCard = ({ schedule }: { schedule: Schedule }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{schedule.subjectName}</h3>
          <p className="text-sm text-gray-600">{schedule.instructorName}</p>
        </div>
        <div className="flex gap-2">
          {schedule.isRepeat && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded">
              Repeating
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-700 mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span>{formatDate(schedule.date)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>{schedule.timeslot}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleEdit(schedule)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteClick(schedule.id)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
        >
          Delete
        </button>
      </div>
    </div>
  );

  // Row View
  const RowView = () => {
    // Filter schedules
    let filtered = schedules.filter(schedule => {
      const matchesSearch = 
        schedule.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRepeat = 
        repeatFilter === 'all' ||
        (repeatFilter === 'repeat' && schedule.isRepeat) ||
        (repeatFilter === 'non-repeat' && !schedule.isRepeat);
      
      return matchesSearch && matchesRepeat;
    });

    // Sort schedules
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (sortBy) {
        case 'subjectName':
          aValue = a.subjectName;
          bValue = b.subjectName;
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'timeslot':
          aValue = a.timeslot;
          bValue = b.timeslot;
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedData = sorted.slice(start, start + itemsPerPage);

    const handleSort = (column: 'subjectName' | 'date' | 'timeslot') => {
      if (sortBy === column) {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(column);
        setSortOrder('asc');
      }
      setCurrentPage(1);
    };

    const SortHeader = ({ column, label }: { column: 'subjectName' | 'date' | 'timeslot'; label: string }) => (
      <button
        onClick={() => handleSort(column)}
        className="flex items-center gap-2 hover:text-blue-600 transition-colors"
      >
        {label}
        {sortBy === column && (
          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
        )}
      </button>
    );

    return (
      <div className="bg-white overflow-hidden">
        {/* Filter and Search Bar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subjects or instructors..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={repeatFilter}
                onChange={(e) => {
                  setRepeatFilter(e.target.value as 'all' | 'repeat' | 'non-repeat');
                  setCurrentPage(1);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 bg-white"
              >
                <option value="all">All Classes</option>
                <option value="repeat">Repeating</option>
                <option value="non-repeat">Non-Repeating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className=" text-black border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold">No.</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  <SortHeader column="subjectName" label="Subject Name" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Instructor Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  <SortHeader column="date" label="Date" />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  <SortHeader column="timeslot" label="Timeslot" />
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Repeat</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((schedule, index) => (
                  <tr
                    key={schedule.id}
                  >
                    <td className="px-6 py-4 text-sm text-gray-700">{start + index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{schedule.subjectName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{schedule.instructorName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {formatDate(schedule.date)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <span>
                        {schedule.timeslot}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {schedule.isRepeat ? (
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="inline-block bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(schedule.id)}
                          className="inline-block bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-gray-500 text-sm">No schedules found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing {start + 1} to {Math.min(start + itemsPerPage, sorted.length)} of {sorted.length} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Grid View
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {schedules.length > 0 ? (
        schedules.map(schedule => (
          <ScheduleCard key={schedule.id} schedule={schedule} />
        ))
      ) : (
        <p className="text-gray-500 text-center py-8">No schedules available</p>
      )}
    </div>
  );

  // Calendar View
  const CalendarView = () => {
    const daysCount = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysCount; i++) {
      days.push(i);
    }

    const formatDateKey = (day: number) => {
      return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex gap-6">
          {/* Calendar Section */}
          <div className="flex-1">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">{monthName}</h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 py-2 text-sm">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const dateKey = formatDateKey(day);
                const schedulesForDay = getSchedulesForDate(dateKey);
                const isToday = new Date().toDateString() === new Date(dateKey).toDateString();
                const isSelected = selectedDate === dateKey;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`aspect-square p-2 rounded-lg border-2 transition-all flex flex-col items-start justify-start relative ${
                      isSelected
                        ? 'border-blue-400 bg-blue-60'
                        : isToday
                          ? 'border-blue-500 bg-blue-50'
                          : schedulesForDay.length > 0
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-sm font-semibold ${isSelected ? 'text-blue-400' : isToday ? 'text-blue-500' : 'text-gray-900'}`}>
                      {day}
                    </span>
                    {schedulesForDay.length > 0 && (
                      <span className="text-xs text-green-700 font-medium mt-1">
                        {schedulesForDay.length} class{schedulesForDay.length > 1 ? 'es' : ''}
                      </span>
                    )}
                    {isSelected && (
                      <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected date details - Right side */}
          <div className="w-80 border-l border-gray-200 pl-6">
            {selectedDate ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{formatDateFull(selectedDate)}</h3>
                {getSchedulesForDate(selectedDate).length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getSchedulesForDate(selectedDate).map(schedule => (
                      <ScheduleCard key={schedule.id} schedule={schedule} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No schedules for this date</p>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">Select a date to view schedules</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold text-gray-800">Subject Scheduler</h1>
            <p className="text-sm text-gray-500 mt-1">Dashboard / Subject Scheduler</p>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCreateNew}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Schedule new subject
          </button>

          {/* View Toggle Buttons */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setView('row')}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                view === 'row'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setView('grid')}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                view === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                view === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="">
        {view === 'row' && <RowView />}
        {view === 'grid' && <GridView />}
        {view === 'calendar' && <CalendarView />}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
              <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
                Schedule New Subject
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Data Structures"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Name</label>
                  <input
                    type="text"
                    value={formData.instructorName}
                    onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Dr. Juan Dela Cruz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timeslot</label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="pt-5 text-gray-600">-</div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isRepeat}
                    onChange={(e) => setFormData({ ...formData, isRepeat: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Repeating Class</label>
                </div>

                {formData.isRepeat && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Interval</label>
                      <select
                        value={formData.repeatInterval}
                        onChange={(e) => setFormData({ ...formData, repeatInterval: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select interval</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Repeat End Date</label>
                      <input
                        type="date"
                        value={formData.repeatEndDate}
                        onChange={(e) => setFormData({ ...formData, repeatEndDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {createError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{createError}</p>
                </div>
              )}

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSubmit}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
              <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
                Edit Subject Schedule
              </Dialog.Title>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={formData.subjectName}
                    onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Name</label>
                  <input
                    type="text"
                    value={formData.instructorName}
                    onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timeslot</label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="pt-5 text-gray-600">-</div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isRepeat}
                    onChange={(e) => setFormData({ ...formData, isRepeat: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">Repeating Class</label>
                </div>

                {formData.isRepeat && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Interval</label>
                      <select
                        value={formData.repeatInterval}
                        onChange={(e) => setFormData({ ...formData, repeatInterval: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select interval</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Repeat End Date</label>
                      <input
                        type="date"
                        value={formData.repeatEndDate}
                        onChange={(e) => setFormData({ ...formData, repeatEndDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {editError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{editError}</p>
                </div>
              )}

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
              <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                Delete Schedule
              </Dialog.Title>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this schedule? This action cannot be undone.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsDeleteOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default SubjectScheduler;