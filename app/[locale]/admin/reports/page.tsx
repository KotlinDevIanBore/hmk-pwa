'use client';

import { useState, useEffect } from 'react';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, Star, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Feedback {
  id: string;
  rating: number | null;
  category: string | null;
  message: string;
  isResolved: boolean;
  response: string | null;
  createdAt: string;
  user: {
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string;
  } | null;
}

export default function ReportsPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    resolved: 0,
    concerns: 0,
  });

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    filterFeedbacks();
  }, [feedbacks, categoryFilter, ratingFilter, resolvedFilter, searchQuery]);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/feedback');
      if (!response.ok) throw new Error('Failed to fetch feedbacks');
      
      const data = await response.json();
      if (data.success) {
        setFeedbacks(data.feedbacks);
        calculateStats(data.feedbacks);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (feedbacks: Feedback[]) => {
    const total = feedbacks.length;
    const withRating = feedbacks.filter(f => f.rating !== null);
    const averageRating = withRating.length > 0
      ? withRating.reduce((sum, f) => sum + (f.rating || 0), 0) / withRating.length
      : 0;
    const resolved = feedbacks.filter(f => f.isResolved).length;
    const concerns = feedbacks.filter(f => f.rating !== null && f.rating <= 2).length;

    setStats({ total, averageRating, resolved, concerns });
  };

  const filterFeedbacks = () => {
    let filtered = [...feedbacks];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(f => f.category === categoryFilter);
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(f => f.rating === rating);
    }

    // Resolved filter
    if (resolvedFilter !== 'all') {
      const isResolved = resolvedFilter === 'resolved';
      filtered = filtered.filter(f => f.isResolved === isResolved);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        f =>
          f.message.toLowerCase().includes(query) ||
          f.user?.firstName?.toLowerCase().includes(query) ||
          f.user?.lastName?.toLowerCase().includes(query) ||
          f.user?.phoneNumber.includes(query)
      );
    }

    setFilteredFeedbacks(filtered);
    setCurrentPage(1);
  };

  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-gray-600">
            View satisfaction rates, concerns, and user feedback
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concerns</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.concerns}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger id="category-filter">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rating-filter">Rating</Label>
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger id="rating-filter">
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="resolved-filter">Status</Label>
                <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
                  <SelectTrigger id="resolved-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="unresolved">Unresolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
            <CardDescription>
              Showing {paginatedFeedbacks.length} of {filteredFeedbacks.length} feedbacks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : paginatedFeedbacks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No feedback found</div>
            ) : (
              <div className="space-y-4">
                {paginatedFeedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="rounded-lg border p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {feedback.rating !== null && (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= (feedback.rating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          <Badge variant={feedback.isResolved ? 'default' : 'secondary'}>
                            {feedback.isResolved ? 'Resolved' : 'Unresolved'}
                          </Badge>
                          {feedback.category && (
                            <Badge variant="outline">{feedback.category}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{feedback.message}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          {feedback.user ? (
                            <span>
                              {feedback.user.firstName} {feedback.user.lastName} ({feedback.user.phoneNumber})
                            </span>
                          ) : (
                            <span>Anonymous</span>
                          )}
                          {' • '}
                          {formatDate(new Date(feedback.createdAt))}
                        </div>
                        {feedback.response && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <strong>Response:</strong> {feedback.response}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
