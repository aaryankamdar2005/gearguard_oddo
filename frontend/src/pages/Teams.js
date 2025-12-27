import { useEffect, useState } from 'react';
import { axiosInstance } from '../App';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Users, User } from 'lucide-react';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    member_ids: [],
  });

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axiosInstance.get('/teams');
      setTeams(response.data);
    } catch (error) {
      toast.error('Failed to load teams');
    } finally {
      setLoading(false);
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
      if (selectedTeam) {
        await axiosInstance.put(`/teams/${selectedTeam.id}`, formData);
        toast.success('Team updated successfully!');
      } else {
        await axiosInstance.post('/teams', formData);
        toast.success('Team created successfully!');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchTeams();
    } catch (error) {
      toast.error('Failed to save team');
    }
  };

  const handleEdit = (team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      member_ids: team.member_ids || [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await axiosInstance.delete(`/teams/${id}`);
      toast.success('Team deleted successfully!');
      fetchTeams();
    } catch (error) {
      toast.error('Failed to delete team');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      member_ids: [],
    });
    setSelectedTeam(null);
  };

  const handleDialogOpenChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const getTeamMembers = (memberIds) => {
    return users.filter(user => memberIds.includes(user.id));
  };

  const handleMemberToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(userId)
        ? prev.member_ids.filter(id => id !== userId)
        : [...prev.member_ids, userId]
    }));
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8" data-testid="teams-page">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading font-bold text-4xl text-slate-900 mb-3" data-testid="teams-title">
              Maintenance Teams
            </h1>
            <p className="font-body text-slate-600">Manage your maintenance teams and members</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="add-team-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Team
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" data-testid="team-dialog">
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">
                  {selectedTeam ? 'Edit Team' : 'Add New Team'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div>
                  <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider mb-2 block">
                    Team Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="team-name-input"
                    placeholder="Mechanics, Electricians, IT Support"
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
                    data-testid="team-description-input"
                    placeholder="Brief description of the team's responsibilities"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="font-mono text-xs uppercase tracking-wider mb-3 block">
                    Team Members
                  </Label>
                  <div className="border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                    {users.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                        data-testid={`member-checkbox-${user.id}`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.member_ids.includes(user.id)}
                          onChange={() => handleMemberToggle(user.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    data-testid="submit-team-button"
                  >
                    {selectedTeam ? 'Update Team' : 'Create Team'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogOpenChange(false)}
                    data-testid="cancel-team-button"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const members = getTeamMembers(team.member_ids || []);
            return (
              <div
                key={team.id}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                data-testid={`team-card-${team.id}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-mono text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                      {members.length} MEMBERS
                    </span>
                  </div>

                  <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2" data-testid={`team-name-${team.id}`}>
                    {team.name}
                  </h3>
                  {team.description && (
                    <p className="text-sm text-slate-600 mb-4">{team.description}</p>
                  )}

                  <div className="mb-4">
                    {members.length > 0 ? (
                      <div className="space-y-2">
                        {members.slice(0, 3).map((member) => (
                          <div key={member.id} className="flex items-center gap-2 text-sm text-slate-600">
                            <User className="w-4 h-4" />
                            <span>{member.name}</span>
                          </div>
                        ))}
                        {members.length > 3 && (
                          <div className="text-sm text-slate-500">
                            +{members.length - 3} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400 italic">No members assigned</div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(team)}
                      className="flex-1"
                      data-testid={`edit-team-button-${team.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(team.id)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`delete-team-button-${team.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No teams found. Create your first team to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}