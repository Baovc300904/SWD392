// Question & Answer Component for Group Chat
import { useState, useEffect } from 'react';
import { Send, MessageCircle, CheckCircle2, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const QuestionAnswer = ({ groupId }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [answerText, setAnswerText] = useState({});
  const [assignedTo, setAssignedTo] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (groupId) {
      fetchQuestions();
      fetchMembers();
    }
  }, [groupId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/questions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data);
        // Fetch answers for each question
        data.data.forEach(q => fetchAnswers(q._id));
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMembers(data.data.members || []);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchAnswers = async (questionId) => {
    try {
      const response = await fetch(`/api/questions/${questionId}/answers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAnswers(prev => ({ ...prev, [questionId]: data.data }));
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      const response = await fetch(`/api/groups/${groupId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          content: newQuestion,
          assignedTo: assignedTo || undefined
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setQuestions([data.data, ...questions]);
        setNewQuestion('');
        setAssignedTo('');
      }
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  const handleAnswerQuestion = async (questionId) => {
    const answer = answerText[questionId];
    if (!answer?.trim()) return;

    try {
      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ content: answer })
      });
      const data = await response.json();
      
      if (data.success) {
        fetchAnswers(questionId);
        setAnswerText(prev => ({ ...prev, [questionId]: '' }));
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error answering question:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      answered: { color: 'bg-green-100 text-green-800', label: 'Answered' },
      closed: { color: 'bg-gray-100 text-gray-800', label: 'Closed' }
    };
    const variant = variants[status] || variants.pending;
    return (
      <Badge className={variant.color}>
        {variant.label}
      </Badge>
    );
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const filteredQuestions = questions.filter(q => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return q.status === 'pending';
    if (activeTab === 'answered') return q.status === 'answered';
    if (activeTab === 'my') {
      const userId = localStorage.getItem('userId');
      return q.askedBy?._id === userId || q.assignedTo?._id === userId;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
          <CardDescription>Post your question to the group</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Your Question</Label>
              <Textarea
                id="question"
                placeholder="Type your question here..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignTo">Assign to (Optional)</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Anyone</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAskQuestion} className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask Question
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="answered">Answered</TabsTrigger>
          <TabsTrigger value="my">My Questions</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-gray-500">
                No questions found
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question) => (
              <Card key={question._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar>
                        <AvatarImage src={question.askedBy?.avatar} />
                        <AvatarFallback>
                          {getInitials(question.askedBy?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{question.askedBy?.name}</span>
                          {question.assignedTo && (
                            <Badge variant="outline" className="text-xs">
                              <User className="w-3 h-3 mr-1" />
                              Assigned to {question.assignedTo?.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(question.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(question.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-800">{question.content}</p>

                  {answers[question._id]?.length > 0 && (
                    <div className="border-t pt-4 space-y-3">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Answers ({answers[question._id].length})
                      </h4>
                      {answers[question._id].map((answer) => (
                        <div
                          key={answer._id}
                          className="flex gap-3 p-3 rounded-lg bg-gray-50"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={answer.answeredBy?.avatar} />
                            <AvatarFallback>
                              {getInitials(answer.answeredBy?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold">
                                {answer.answeredBy?.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(answer.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{answer.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.status !== 'closed' && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your answer..."
                        value={answerText[question._id] || ''}
                        onChange={(e) =>
                          setAnswerText(prev => ({
                            ...prev,
                            [question._id]: e.target.value
                          }))
                        }
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAnswerQuestion(question._id);
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        onClick={() => handleAnswerQuestion(question._id)}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionAnswer;
