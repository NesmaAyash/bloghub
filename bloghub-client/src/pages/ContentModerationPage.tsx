import { useState } from 'react';
import { mockReports, mockArticles, Report } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye,
  Trash2,
  Flag,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface ContentModerationPageProps {
  onNavigate: (page: string) => void;
}

export function ContentModerationPage({ onNavigate }: ContentModerationPageProps) {
  const [reports, setReports] = useState(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  const pendingReports = reports.filter(r => r.status === 'pending');
  const reviewedReports = reports.filter(r => r.status === 'reviewed');
  const resolvedReports = reports.filter(r => r.status === 'resolved');

  const handleApprove = (reportId: string) => {
    setReports(reports.map(r => 
      r.id === reportId ? { ...r, status: 'resolved' as const } : r
    ));
    toast.success('Report approved and resolved');
    setSelectedReport(null);
    setModerationNote('');
  };

  const handleReject = (reportId: string) => {
    setReports(reports.map(r => 
      r.id === reportId ? { ...r, status: 'reviewed' as const } : r
    ));
    toast.success('Report rejected');
    setSelectedReport(null);
    setModerationNote('');
  };

  const handleDeleteContent = (reportId: string) => {
    setReports(reports.map(r => 
      r.id === reportId ? { ...r, status: 'resolved' as const } : r
    ));
    toast.success('Content deleted and report resolved');
    setSelectedReport(null);
    setModerationNote('');
  };

  const getReportedContent = (report: Report) => {
    if (report.contentType === 'article') {
      return mockArticles.find(a => a.id === report.contentId);
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ReportCard = ({ report }: { report: Report }) => {
    const content = getReportedContent(report);
    const isSelected = selectedReport?.id === report.id;

    return (
      <Card 
        className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
          isSelected ? 'border-primary border-2' : ''
        }`}
        onClick={() => setSelectedReport(report)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${
              report.status === 'pending' ? 'bg-yellow-100' :
              report.status === 'reviewed' ? 'bg-blue-100' :
              'bg-green-100'
            }`}>
              {report.status === 'pending' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
              {report.status === 'reviewed' && <Eye className="h-5 w-5 text-blue-600" />}
              {report.status === 'resolved' && <CheckCircle className="h-5 w-5 text-green-600" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={
                      report.status === 'pending' ? 'destructive' :
                      report.status === 'reviewed' ? 'default' :
                      'secondary'
                    }>
                      {report.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {report.contentType}
                    </Badge>
                  </div>
                  <h4 className="font-medium truncate">
                    {content?.title || `Reported ${report.contentType}`}
                  </h4>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Flag className="h-4 w-4" />
                  <span>Reason: {report.reason}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(report.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Button
            variant="ghost"
            onClick={() => onNavigate('admin-dashboard')}
            className="mb-4 -ml-2 hover:bg-muted/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="mb-2">Content Moderation</h1>
          <p className="text-muted-foreground">
            Review and manage reported content
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingReports.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reviewed</p>
                  <p className="text-2xl font-bold">{reviewedReports.length}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{resolvedReports.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="pending" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="pending" className="flex-1">
                  Pending ({pendingReports.length})
                </TabsTrigger>
                <TabsTrigger value="all" className="flex-1">
                  All ({reports.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-3">
                {pendingReports.length > 0 ? (
                  pendingReports.map((report, index) => (
                    <div 
                      key={report.id}
                      className="animate-in fade-in slide-in-from-left-2 duration-500"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ReportCard report={report} />
                    </div>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p className="text-muted-foreground">No pending reports</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-3">
                {reports.map((report, index) => (
                  <div 
                    key={report.id}
                    className="animate-in fade-in slide-in-from-left-2 duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ReportCard report={report} />
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Report Details */}
          <Card className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            {selectedReport ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Report Details</CardTitle>
                    <Badge variant={
                      selectedReport.status === 'pending' ? 'destructive' :
                      selectedReport.status === 'reviewed' ? 'default' :
                      'secondary'
                    }>
                      {selectedReport.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Report Info */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Content Type</p>
                      <Badge variant="outline" className="capitalize">
                        {selectedReport.contentType}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reason</p>
                      <p>{selectedReport.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Reported At</p>
                      <p>{formatDate(selectedReport.createdAt)}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Content Preview */}
                  {selectedReport.contentType === 'article' && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Reported Content</p>
                        {(() => {
                          const article = getReportedContent(selectedReport);
                          return article ? (
                            <Card className="border-2">
                              <CardContent className="pt-6">
                                <div className="flex gap-4">
                                  <img 
                                    src={article.coverImage} 
                                    alt={article.title}
                                    className="w-24 h-24 rounded-lg object-cover"
                                  />
                                  <div className="flex-1">
                                    <h4 className="mb-2">{article.title}</h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {article.excerpt}
                                    </p>
                                    <Button 
                                      variant="link" 
                                      className="px-0 mt-2"
                                      onClick={() => onNavigate('article', article.id)}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Full Article
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <p className="text-muted-foreground">Content not found</p>
                          );
                        })()}
                      </div>

                      <Separator />
                    </>
                  )}

                  {/* Moderation Notes */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">Moderation Notes</p>
                    <Textarea
                      placeholder="Add notes about this report..."
                      value={moderationNote}
                      onChange={(e) => setModerationNote(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Actions */}
                  {selectedReport.status === 'pending' && (
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        onClick={() => handleApprove(selectedReport.id)}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve & Resolve
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleReject(selectedReport.id)}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject Report
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleDeleteContent(selectedReport.id)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Content
                      </Button>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Select a report to view details and take action
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}