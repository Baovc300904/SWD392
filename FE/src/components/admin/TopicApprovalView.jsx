// Admin Topic Approval Component
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const AdminTopicApproval = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchTopics();
  }, [activeTab]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/topics?status=${activeTab}`, {
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

  const handleApproveTopic = async (topicId) => {
    try {
      const response = await fetch(`/api/topics/${topicId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        fetchTopics();
        setViewDialog(false);
      }
    } catch (error) {
      console.error('Error approving topic:', error);
    }
  };

  const handleRejectTopic = async (topicId) => {
    try {
      const response = await fetch(`/api/topics/${topicId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        fetchTopics();
        setViewDialog(false);
      }
    } catch (error) {
      console.error('Error rejecting topic:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      open: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      closed: { color: 'bg-red-100 text-red-800', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    
    return (
      <Badge className={variant.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Topic Approval Management</h1>
        <p className="text-gray-500">Review and approve student topic proposals</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="open">Approved</TabsTrigger>
          <TabsTrigger value="closed">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : topics.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-gray-500">
                No {activeTab} topics found
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <Card key={topic._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {topic.title}
                      </CardTitle>
                      {getStatusBadge(topic.status)}
                    </div>
                    <CardDescription>
                      <div className="space-y-1 text-xs">
                        <p>Semester: {topic.semester?.name} - {topic.semester?.year}</p>
                        <p>Proposed by: {topic.createdBy?.name}</p>
                        <p className="text-gray-400">
                          {new Date(topic.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedTopic(topic);
                          setViewDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {topic.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveTopic(topic._id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleRejectTopic(topic._id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedTopic?.title}</DialogTitle>
            <DialogDescription>
              Topic Details and Approval Actions
            </DialogDescription>
          </DialogHeader>
          
          {selectedTopic && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedTopic.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Semester</p>
                  <p className="mt-1">
                    {selectedTopic.semester?.name} - {selectedTopic.semester?.year}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Proposed By</p>
                  <p className="mt-1">{selectedTopic.createdBy?.name}</p>
                  <p className="text-xs text-gray-400">
                    {selectedTopic.createdBy?.studentCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Proposed Date</p>
                  <p className="mt-1">
                    {new Date(selectedTopic.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500">Description</p>
                <p className="mt-2 text-sm text-gray-700">
                  {selectedTopic.description || 'No description provided'}
                </p>
              </div>
            </div>
          )}

          {selectedTopic?.status === 'pending' && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRejectTopic(selectedTopic._id)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Topic
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleApproveTopic(selectedTopic._id)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Topic
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTopicApproval;
