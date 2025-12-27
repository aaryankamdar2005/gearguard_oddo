import { useEffect, useState } from 'react';
import { axiosInstance } from '../App';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Calendar() {
  const [requests, setRequests] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get('/requests');
      const preventiveRequests = response.data.filter(
        (req) => req.request_type === 'preventive' && req.scheduled_date
      );
      setRequests(preventiveRequests);
    } catch (error) {
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getRequestsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return requests.filter((req) => req.scheduled_date === dateStr);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8" data-testid="calendar-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading font-bold text-4xl text-slate-900 mb-3" data-testid="calendar-title">
            Maintenance Calendar
          </h1>
          <p className="font-body text-slate-600">View scheduled preventive maintenance</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-semibold text-2xl text-slate-900" data-testid="current-month">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                data-testid="previous-month-button"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                data-testid="next-month-button"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="font-mono text-xs uppercase tracking-wider text-slate-500 text-center p-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              const dayRequests = date ? getRequestsForDate(date) : [];
              const isToday =
                date &&
                date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={index}
                  className={`min-h-28 border-2 rounded-lg p-2 ${
                    date
                      ? 'border-slate-200 bg-white hover:border-blue-300 transition-colors'
                      : 'border-transparent bg-slate-50'
                  } ${isToday ? 'border-blue-500 bg-blue-50' : ''}`}
                  data-testid={date ? `calendar-day-${date.getDate()}` : `calendar-empty-${index}`}
                >
                  {date && (
                    <>
                      <div
                        className={`font-mono text-sm font-medium mb-2 ${
                          isToday ? 'text-blue-700' : 'text-slate-700'
                        }`}
                      >
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayRequests.map((req) => (
                          <div
                            key={req.id}
                            className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 truncate"
                            title={req.subject}
                            data-testid={`calendar-request-${req.id}`}
                          >
                            {req.subject}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <h3 className="font-heading font-semibold text-xl text-slate-900 mb-4" data-testid="upcoming-maintenance-title">
            Upcoming Maintenance
          </h3>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No scheduled maintenance found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests
                .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
                .slice(0, 10)
                .map((req) => (
                  <div
                    key={req.id}
                    className="flex items-start justify-between border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                    data-testid={`upcoming-request-${req.id}`}
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">{req.subject}</h4>
                      <div className="text-sm text-slate-600">
                        <span className="font-mono">{req.equipment_name}</span>
                        {req.description && <span className="ml-2">- {req.description}</span>}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="font-mono text-sm font-medium text-slate-900">
                        {req.scheduled_date}
                      </div>
                      <div
                        className={`text-xs mt-1 px-2 py-1 rounded text-center ${
                          req.stage === 'new'
                            ? 'bg-blue-100 text-blue-700'
                            : req.stage === 'in_progress'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {req.stage.toUpperCase().replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}