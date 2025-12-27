import { useEffect, useState } from 'react';
import { axiosInstance } from '../App';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, AlertCircle, Clock, CheckCircle, Trash2, User } from 'lucide-react';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    equipment_id: '',
    request_type: 'corrective',
    scheduled_date: '',
  });
  const [draggedRequest, setDraggedRequest] = useState(null);

  const stages = [
    { id: 'new', label: 'New', icon: AlertCircle, color: 'bg-blue-100 border-blue-200 text-blue-700' },
    { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'bg-orange-100 border-orange-200 text-orange-700' },
    { id: 'repaired', label: 'Repaired', icon: CheckCircle, color: 'bg-green-100 border-green-200 text-green-700' },
    { id: 'scrap', label: 'Scrap', icon: Trash2, color: 'bg-slate-100 border-slate-200 text-slate-700' },
  ];

  useEffect(() => {
    fetchRequests();
    fetchEquipment();
    fetchUsers();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get('/requests');
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await axiosInstance.get('/equipment');
      setEquipment(response.data);
    } catch (error) {
      console.error('Failed to load equipment');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/requests', formData);
      toast.success('Request created successfully!');
      setIsDialogOpen(false);
      resetForm();
      fetchRequests();
    } catch (error) {
      toast.error('Failed to create request');
    }
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      description: '',
      equipment_id: '',
      request_type: 'corrective',
      scheduled_date: '',
    });
    setSelectedRequest(null);
  };

  const handleDialogOpenChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleDragStart = (e, request) => {
    setDraggedRequest(request);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    if (!draggedRequest || draggedRequest.stage === newStage) {
      setDraggedRequest(null);
      return;
    }

    try {
      await axiosInstance.put(`/requests/${draggedRequest.id}`, { stage: newStage });
      toast.success(`Request moved to ${newStage.replace('_', ' ')}`);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update request');
    } finally {
      setDraggedRequest(null);
    }
  };

  const handleAssignUser = async (requestId, userId) => {
    try {
      await axiosInstance.put(`/requests/${requestId}`, { assigned_to: userId });
      toast.success('Technician assigned successfully!');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to assign technician');
    }
  };

  const getRequestsByStage = (stage) => {
    return requests.filter((req) => req.stage === stage);
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : 'Unassigned';
  };

  const isOverdue = (request) => {
    if (!request.scheduled_date || request.stage === 'repaired' || request.stage === 'scrap') return false;
    const scheduledDate = new Date(request.scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduledDate < today;
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8" data-testid="requests-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-4xl text-slate-900 mb-3" data-testid="requests-title">
              Maintenance Requests
            </h1>
            <p className="font-body text-slate-600">Track and manage maintenance workflows</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="add-request-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" data-testid="request-dialog">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">Create Maintenance Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div>
                  <Label htmlFor="subject" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    data-testid="request-subject-input"
                    placeholder="e.g., Leaking Oil, Broken Screen"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="request-description-input"
                    placeholder="Detailed description of the issue"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="equipment_id" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                      Equipment *
                    </Label>
                    <Select
                      value={formData.equipment_id}
                      onValueChange={(value) => setFormData({ ...formData, equipment_id: value })}
                      required
                    >
                      <SelectTrigger data-testid="equipment-select">
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id}>
                            {eq.name} - {eq.serial_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="request_type" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                      Request Type *
                    </Label>
                    <Select
                      value={formData.request_type}
                      onValueChange={(value) => setFormData({ ...formData, request_type: value })}
                    >
                      <SelectTrigger data-testid="request-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrective">Corrective (Breakdown)</SelectItem>
                        <SelectItem value="preventive">Preventive (Scheduled)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.request_type === 'preventive' && (
                  <div>
                    <Label htmlFor="scheduled_date" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                      Scheduled Date
                    </Label>
                    <Input
                      id="scheduled_date"
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                      data-testid="scheduled-date-input"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    data-testid="submit-request-button"
                  >
                    Create Request
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogOpenChange(false)}
                    data-testid="cancel-request-button"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stages.map((stage) => {
            const stageRequests = getRequestsByStage(stage.id);
            const StageIcon = stage.icon;
            return (
              <div
                key={stage.id}
                className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden"
                data-testid={`kanban-column-${stage.id}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className={`p-4 border-b-2 ${stage.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StageIcon className="w-5 h-5" />
                      <h3 className="font-heading font-semibold text-lg">{stage.label}</h3>
                    </div>
                    <span className="font-mono text-sm font-bold">{stageRequests.length}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3 kanban-column" style={{ minHeight: '500px' }}>
                  {stageRequests.map((request) => {
                    const overdue = isOverdue(request);
                    return (
                      <div
                        key={request.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, request)}
                        className={`bg-white border-2 border-slate-200 rounded-lg p-4 kanban-card hover:shadow-lg transition-all ${
                          draggedRequest?.id === request.id ? 'opacity-50' : ''
                        } ${overdue ? 'border-red-500' : ''}`}
                        data-testid={`request-card-${request.id}`}
                      >
                        {overdue && (
                          <div className="bg-red-500 text-white text-xs font-mono px-2 py-1 rounded mb-2 inline-block">
                            OVERDUE
                          </div>
                        )}
                        <h4 className="font-semibold text-slate-900 mb-2" data-testid={`request-subject-${request.id}`}>
                          {request.subject}
                        </h4>
                        {request.description && (
                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{request.description}</p>
                        )}

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-slate-500">Equipment:</span>
                            <span className="text-slate-700 font-medium">{request.equipment_name}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-slate-500">Type:</span>
                            <span
                              className={`px-2 py-1 rounded ${
                                request.request_type === 'corrective'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {request.request_type.toUpperCase()}
                            </span>
                          </div>
                          {request.scheduled_date && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-slate-500">Scheduled:</span>
                              <span className="text-slate-700">{request.scheduled_date}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-200">
                          <Label className="font-mono text-xs text-slate-500 mb-2 block">Assign to:</Label>
                          <Select
                            value={request.assigned_to || ''}
                            onValueChange={(value) => handleAssignUser(request.id, value)}
                          >
                            <SelectTrigger className="h-8 text-sm" data-testid={`assign-user-select-${request.id}`}>
                              <SelectValue placeholder="Unassigned">
                                {request.assigned_to ? (
                                  <div className="flex items-center gap-2">
                                    <User className="w-3 h-3" />
                                    <span>{getUserName(request.assigned_to)}</span>
                                  </div>
                                ) : (
                                  'Unassigned'
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Unassigned</SelectItem>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}