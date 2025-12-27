import { useEffect, useState } from 'react';
import { axiosInstance } from '../App';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { CalendarPlus } from 'lucide-react';
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
    } catch {
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- GOOGLE CALENDAR ---------------- */
  const addToGoogleCalendar = (req) => {
    const start = req.scheduled_date.replace(/-/g, '');
    const end = start;

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', req.subject);
    url.searchParams.set(
      'details',
      `${req.description || ''}\nEquipment: ${req.equipment_name}`
    );
    url.searchParams.set('dates', `${start}/${end}`);
    url.searchParams.set('sf', 'true');
    url.searchParams.set('output', 'xml');

    window.open(url.toString(), '_blank');
  };

  /* ---------------- CALENDAR LOGIC ---------------- */
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const getRequestsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return requests.filter((r) => r.scheduled_date === dateStr);
  };

  const handlePreviousMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const days = getDaysInMonth(currentDate);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8" data-testid="calendar-page">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-4xl text-slate-900 mb-3">
            Maintenance Calendar
          </h1>
          <p className="text-slate-600">View scheduled preventive maintenance</p>
        </div>

        {/* MONTH VIEW */}
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((d) => (
              <div key={d} className="text-xs text-center text-slate-500 p-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((date, i) => {
              const dayRequests = date ? getRequestsForDate(date) : [];
              const isToday = date && date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={i}
                  className={`min-h-28 p-2 rounded-lg border ${
                    date ? 'bg-white' : 'bg-slate-50'
                  } ${isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
                >
                  {date && (
                    <>
                      <div className="text-sm font-medium mb-2">{date.getDate()}</div>
                      {dayRequests.map((req) => (
                        <div
                          key={req.id}
                          className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-1 truncate"
                        >
                          {req.subject}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* UPCOMING */}
        <div className="mt-8 bg-white border rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Upcoming Maintenance</h3>

          {requests.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">No scheduled maintenance</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests
                .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
                .slice(0, 10)
                .map((req) => (
                  <div
                    key={req.id}
                    className="border rounded-lg p-4 flex justify-between items-start"
                  >
                    <div>
                      <h4 className="font-semibold">{req.subject}</h4>
                      <p className="text-sm text-slate-600">
                        {req.equipment_name}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-mono">{req.scheduled_date}</span>
                       
<Button
  size="sm"
  variant="outline"
  className="flex items-center gap-2"
  onClick={() => addToGoogleCalendar(req)}
>
  <CalendarPlus className="w-4 h-4 text-blue-600" />
  Add to Google Calendar
</Button>
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
