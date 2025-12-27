import { useEffect, useState } from 'react';
import { axiosInstance } from '../App';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Wrench, MapPin, Calendar, AlertCircle } from 'lucide-react';

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    category: '',
    department: '',
    assigned_employee: '',
    team_id: '',
    location: '',
    purchase_date: '',
    warranty_expiry: '',
  });

  useEffect(() => {
    fetchEquipment();
    fetchTeams();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await axiosInstance.get('/equipment');
      setEquipment(response.data);
    } catch (error) {
      toast.error('Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axiosInstance.get('/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Failed to load teams');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEquipment) {
        await axiosInstance.put(`/equipment/${selectedEquipment.id}`, formData);
        toast.success('Equipment updated successfully!');
      } else {
        await axiosInstance.post('/equipment', formData);
        toast.success('Equipment created successfully!');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchEquipment();
    } catch (error) {
      toast.error('Failed to save equipment');
    }
  };

  const handleEdit = (eq) => {
    setSelectedEquipment(eq);
    setFormData({
      name: eq.name,
      serial_number: eq.serial_number,
      category: eq.category,
      department: eq.department || '',
      assigned_employee: eq.assigned_employee || '',
      team_id: eq.team_id || '',
      location: eq.location || '',
      purchase_date: eq.purchase_date || '',
      warranty_expiry: eq.warranty_expiry || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      await axiosInstance.delete(`/equipment/${id}`);
      toast.success('Equipment deleted successfully!');
      fetchEquipment();
    } catch (error) {
      toast.error('Failed to delete equipment');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      serial_number: '',
      category: '',
      department: '',
      assigned_employee: '',
      team_id: '',
      location: '',
      purchase_date: '',
      warranty_expiry: '',
    });
    setSelectedEquipment(null);
  };

  const handleDialogOpenChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const [equipmentRequests, setEquipmentRequests] = useState({});
  const [requestsDialogOpen, setRequestsDialogOpen] = useState(false);
  const [currentEquipmentRequests, setCurrentEquipmentRequests] = useState([]);

  const fetchEquipmentRequests = async (equipmentId) => {
    try {
      const response = await axiosInstance.get(`/equipment/${equipmentId}/requests`);
      return response.data;
    } catch (error) {
      console.error('Failed to load equipment requests');
      return [];
    }
  };

  const handleViewRequests = async (eq) => {
    const requests = await fetchEquipmentRequests(eq.id);
    setCurrentEquipmentRequests(requests);
    setRequestsDialogOpen(true);
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Not assigned';
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8" data-testid="equipment-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-4xl text-slate-900 mb-3" data-testid="equipment-title">
              Equipment
            </h1>
            <p className="font-body text-slate-600">Manage your company assets</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="add-equipment-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="equipment-dialog">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">
                  {selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                      Equipment Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      data-testid="equipment-name-input"
                      placeholder="CNC Machine 01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serial_number" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                      Serial Number *
                    </Label>
                    <Input
                      id="serial_number"
                      value={formData.serial_number}
                      onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                      required
                      data-testid="serial-number-input"
                      placeholder="SN-2024-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                      Category *
                    </Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      data-testid="category-input"
                      placeholder="Machinery, Vehicle, Computer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                      Department
                    </Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      data-testid="department-input"
                      placeholder="Production, IT, Logistics"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assigned_employee" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                      Assigned Employee
                    </Label>
                    <Input
                      id="assigned_employee"
                      value={formData.assigned_employee}
                      onChange={(e) => setFormData({ ...formData, assigned_employee: e.target.value })}
                      data-testid="assigned-employee-input"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="team_id" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                      Maintenance Team
                    </Label>
                    <Select
                      value={formData.team_id}
                      onValueChange={(value) => setFormData({ ...formData, team_id: value })}
                    >
                      <SelectTrigger data-testid="team-select">
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No team</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    data-testid="location-input"
                    placeholder="Building A, Floor 2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchase_date" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                      Purchase Date
                    </Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                      data-testid="purchase-date-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="warranty_expiry" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                      Warranty Expiry
                    </Label>
                    <Input
                      id="warranty_expiry"
                      type="date"
                      value={formData.warranty_expiry}
                      onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                      data-testid="warranty-expiry-input"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    data-testid="submit-equipment-button"
                  >
                    {selectedEquipment ? 'Update Equipment' : 'Create Equipment'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogOpenChange(false)}
                    data-testid="cancel-equipment-button"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment.map((eq) => (
            <div
              key={eq.id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all group"
              data-testid={`equipment-card-${eq.id}`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  {eq.status === 'scrapped' && (
                    <span className="font-mono text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                      SCRAPPED
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2" data-testid={`equipment-name-${eq.id}`}>
                  {eq.name}
                </h3>
                <div className="font-mono text-xs text-slate-500 mb-4">
                  SN: {eq.serial_number}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-mono text-xs uppercase tracking-wider text-slate-500 w-24">Category:</span>
                    <span className="font-medium">{eq.category}</span>
                  </div>
                  {eq.department && (
                    <div className="flex items-center text-sm text-slate-600">
                      <span className="font-mono text-xs uppercase tracking-wider text-slate-500 w-24">Dept:</span>
                      <span>{eq.department}</span>
                    </div>
                  )}
                  {eq.location && (
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-3 h-3 mr-2" />
                      <span>{eq.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-slate-600">
                    <span className="font-mono text-xs uppercase tracking-wider text-slate-500 w-24">Team:</span>
                    <span>{getTeamName(eq.team_id)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewRequests(eq)}
                    className="flex-1"
                    data-testid={`view-requests-button-${eq.id}`}
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Requests
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(eq)}
                    data-testid={`edit-equipment-button-${eq.id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(eq.id)}
                    className="text-red-600 hover:text-red-700"
                    data-testid={`delete-equipment-button-${eq.id}`}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {equipment.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No equipment found. Add your first equipment to get started.</p>
          </div>
        )}
      </div>

      <Dialog open={requestsDialogOpen} onOpenChange={setRequestsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Equipment Maintenance Requests</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {currentEquipmentRequests.length === 0 ? (
              <p className="text-slate-600 text-center py-8">No maintenance requests found for this equipment.</p>
            ) : (
              <div className="space-y-3">
                {currentEquipmentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                    data-testid={`request-item-${req.id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{req.subject}</h4>
                      <span className={`font-mono text-xs px-2 py-1 rounded ${
                        req.stage === 'new' ? 'bg-blue-100 text-blue-700' :
                        req.stage === 'in_progress' ? 'bg-orange-100 text-orange-700' :
                        req.stage === 'repaired' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {req.stage.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{req.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Type: {req.request_type}</span>
                      {req.scheduled_date && <span>Scheduled: {req.scheduled_date}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}