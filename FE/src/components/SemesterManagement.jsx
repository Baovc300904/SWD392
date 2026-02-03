// Semester Management Component (Admin Only)
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';

const SemesterManagement = () => {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: ''
  });
  const [selectedSemester, setSelectedSemester] = useState(null);

  useEffect(() => {
    fetchSemesters();
  }, []);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/semesters', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSemesters(data.data);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editMode && selectedSemester
        ? `/api/semesters/${selectedSemester._id}`
        : '/api/semesters';
      
      const method = editMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        fetchSemesters();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving semester:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this semester?')) return;

    try {
      const response = await fetch(`/api/semesters/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        fetchSemesters();
      }
    } catch (error) {
      console.error('Error deleting semester:', error);
    }
  };

  const handleEdit = (semester) => {
    setSelectedSemester(semester);
    setFormData({
      name: semester.name,
      year: semester.year,
      startDate: semester.startDate?.split('T')[0] || '',
      endDate: semester.endDate?.split('T')[0] || ''
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedSemester(null);
    setFormData({
      name: '',
      year: new Date().getFullYear(),
      startDate: '',
      endDate: ''
    });
  };

  const isActive = (semester) => {
    const now = new Date();
    const start = new Date(semester.startDate);
    const end = new Date(semester.endDate);
    return now >= start && now <= end;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Semester Management</h1>
          <p className="text-gray-500">Manage academic semesters</p>
        </div>
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditMode(false)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Semester
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editMode ? 'Edit Semester' : 'Add New Semester'}
              </DialogTitle>
              <DialogDescription>
                {editMode ? 'Update semester information' : 'Create a new academic semester'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Semester Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Fall, Spring, Summer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2024"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editMode ? 'Update' : 'Create'} Semester
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {semesters.map((semester) => (
            <Card key={semester._id} className={isActive(semester) ? 'border-blue-500 border-2' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {semester.name} {semester.year}
                    </CardTitle>
                    {isActive(semester) && (
                      <Badge className="mt-2 bg-blue-100 text-blue-800">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">Start:</span>{' '}
                    {semester.startDate ? new Date(semester.startDate).toLocaleDateString() : 'N/A'}
                  </p>
                  <p>
                    <span className="font-semibold">End:</span>{' '}
                    {semester.endDate ? new Date(semester.endDate).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400 pt-2">
                    Created: {new Date(semester.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleEdit(semester)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(semester._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SemesterManagement;
