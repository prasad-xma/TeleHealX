import { useState, useEffect } from 'react';
import { getMyAvailability, setAvailability, blockDate } from '../../services/doctorService';
import { Calendar, Clock, Plus, Trash2, ToggleLeft, ToggleRight, Save, Loader2, X, AlertCircle, CheckCircle } from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AvailabilityPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({});
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [blockDateInput, setBlockDateInput] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await getMyAvailability();
      const data = response.data;
      
      // Initialize schedule from API response or defaults
      const initialSchedule: Record<string, DaySchedule> = {};
      daysOfWeek.forEach(day => {
        initialSchedule[day] = {
          enabled: data.weeklySchedule?.[day]?.enabled || false,
          slots: data.weeklySchedule?.[day]?.slots || []
        };
      });
      setSchedule(initialSchedule);
      setBlockedDates(data.blockedDates || []);
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      // Initialize empty schedule on error
      const emptySchedule: Record<string, DaySchedule> = {};
      daysOfWeek.forEach(day => {
        emptySchedule[day] = { enabled: false, slots: [] };
      });
      setSchedule(emptySchedule);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  const addSlot = (day: string) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '09:00',
      endTime: '10:00'
    };
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], slots: [...prev[day].slots, newSlot] }
    }));
  };

  const removeSlot = (day: string, slotId: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter(slot => slot.id !== slotId)
      }
    }));
  };

  const updateSlot = (day: string, slotId: string, field: 'startTime' | 'endTime', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map(slot =>
          slot.id === slotId ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const validateSlots = (day: string): string | null => {
    const daySchedule = schedule[day];
    if (!daySchedule.enabled) return null;

    for (const slot of daySchedule.slots) {
      if (slot.startTime >= slot.endTime) {
        return `End time must be after start time for ${day}`;
      }
    }

    // Check for overlaps
    const sortedSlots = [...daySchedule.slots].sort((a, b) => 
      a.startTime.localeCompare(b.startTime)
    );

    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i];
      const next = sortedSlots[i + 1];
      if (current.endTime > next.startTime) {
        return `Time slots overlap in ${day}`;
      }
    }

    return null;
  };

  const handleSaveSchedule = async () => {
    setError('');
    setSuccess('');

    // Validate all days
    for (const day of daysOfWeek) {
      const validationError = validateSlots(day);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setSaving(true);
    try {
      await setAvailability({ weeklySchedule: schedule });
      setSuccess('Schedule saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockDate = async () => {
    if (!blockDateInput) {
      setError('Please select a date to block');
      return;
    }

    if (blockedDates.includes(blockDateInput)) {
      setError('This date is already blocked');
      return;
    }

    setBlocking(true);
    setError('');
    try {
      await blockDate(blockDateInput);
      setBlockedDates([...blockedDates, blockDateInput]);
      setBlockDateInput('');
      setSuccess('Date blocked successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to block date');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblockDate = async (date: string) => {
    setBlockedDates(blockedDates.filter(d => d !== date));
    setSuccess('Date unblocked');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Fredoka+One&display=swap');
      `}</style>

      <div className="max-w-4xl mx-auto font-['Nunito',sans-serif] space-y-6">
        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle size={18} className="flex-shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Weekly Schedule Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <Calendar size={24} />
              <div>
                <h1 className="text-2xl font-bold font-['Fredoka_One',cursive]">Weekly Schedule</h1>
                <p className="text-blue-100 text-sm mt-1">Set your available time slots for each day</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {daysOfWeek.map(day => {
              const daySchedule = schedule[day];
              return (
                <div key={day} className="border border-blue-100 rounded-2xl p-4 bg-gradient-to-r from-blue-50/50 to-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-gray-800 text-lg">{day}</h3>
                      <button
                        onClick={() => toggleDay(day)}
                        className="p-1 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        {daySchedule.enabled ? (
                          <ToggleRight size={28} className="text-blue-600" />
                        ) : (
                          <ToggleLeft size={28} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                    {daySchedule.enabled && (
                      <button
                        onClick={() => addSlot(day)}
                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                      >
                        <Plus size={16} />
                        Add Slot
                      </button>
                    )}
                  </div>

                  {daySchedule.enabled && daySchedule.slots.length > 0 && (
                    <div className="space-y-3">
                      {daySchedule.slots.map(slot => (
                        <div key={slot.id} className="flex items-center gap-3 bg-white border border-blue-200 rounded-xl p-3">
                          <Clock size={18} className="text-blue-500 flex-shrink-0" />
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 font-medium mb-1 block">Start</label>
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateSlot(day, slot.id, 'startTime', e.target.value)}
                                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                            <span className="text-gray-400 mt-5">to</span>
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 font-medium mb-1 block">End</label>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateSlot(day, slot.id, 'endTime', e.target.value)}
                                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => removeSlot(day, slot.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {daySchedule.enabled && daySchedule.slots.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No time slots added yet</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={handleSaveSchedule}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  <span>Saving Schedule...</span>
                </>
              ) : (
                <>
                  <Save size={22} />
                  <span>Save Schedule</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Block Specific Dates Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <Calendar size={24} />
              <div>
                <h1 className="text-2xl font-bold font-['Fredoka_One',cursive]">Block Specific Dates</h1>
                <p className="text-blue-100 text-sm mt-1">Block dates when you're unavailable</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={blockDateInput}
                onChange={(e) => setBlockDateInput(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                onClick={handleBlockDate}
                disabled={blocking}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {blocking ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Blocking...</span>
                  </>
                ) : (
                  <>
                    <X size={18} />
                    <span>Block Date</span>
                  </>
                )}
              </button>
            </div>

            {blockedDates.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Blocked Dates:</p>
                <div className="flex flex-wrap gap-2">
                  {blockedDates.map(date => (
                    <div
                      key={date}
                      className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <button
                        onClick={() => handleUnblockDate(date)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {blockedDates.length === 0 && (
              <p className="text-gray-500 text-sm italic">No blocked dates</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AvailabilityPage;
