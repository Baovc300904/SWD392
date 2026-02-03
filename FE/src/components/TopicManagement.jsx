// Topic Management Component for Student
import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const TopicManagement = () => {
  const [topics, setTopics] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    semester: ''
  });

  useEffect(() => {
    fetchTopics();
    fetchSemesters();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/topics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTopics(data.data);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
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
    }
  };

  const handleCreateTopic = async () => {
    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(newTopic)
      });
      const data = await response.json();
      
      if (data.success) {
        setTopics([...topics, data.data]);
        setOpenDialog(false);
        setNewTopic({ title: '', semester: '' });
      }
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: 'success',
      closed: 'destructive',
      pending: 'warning'
    };
    return (
      <Badge variant={variants[status] || 'default'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Topic Management</h1>
          <p className="text-gray-500">Propose and manage topics for projects</p>
        </div>
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Propose New Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Propose New Topic</DialogTitle>
              <DialogDescription>
                Submit a new topic proposal for approval
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Topic Title</Label>
                <Input
                  id="title"
                  placeholder="Enter topic title"
                  value={newTopic.title}
                  onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={newTopic.semester}
                  onValueChange={(value) => setNewTopic({ ...newTopic, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester._id} value={semester._id}>
                        {semester.name} - {semester.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTopic}>
                Submit Proposal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card key={topic._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{topic.title}</CardTitle>
                  {getStatusBadge(topic.status)}
                </div>
                <CardDescription>
                  {topic.semester?.name} - {topic.semester?.year}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  <p>Created by: {topic.createdBy?.name}</p>
                  <p className="text-xs mt-1">
                    {new Date(topic.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicManagement;
