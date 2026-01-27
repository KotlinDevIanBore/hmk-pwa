'use client';

import { useState, useEffect } from 'react';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Users, UserPlus, Mail, Shield, UserCheck, UserX, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface User {
  id: string;
  phoneNumber: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export default function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');

  // Invite dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('SUPPORT');

  useEffect(() => {
    fetchUsers();
    fetchAdminUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch('/api/admin/admin-users');
      if (!response.ok) throw new Error('Failed to fetch admin users');
      const data = await response.json();
      if (data.success) {
        setAdminUsers(data.adminUsers);
      }
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean, isAdmin: boolean = false) => {
    try {
      const endpoint = isAdmin ? '/api/admin/admin-users/toggle-active' : '/api/admin/users/toggle-active';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !isActive }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: `User ${!isActive ? 'activated' : 'deactivated'} successfully`,
        });
        if (isAdmin) {
          fetchAdminUsers();
        } else {
          fetchUsers();
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'error',
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string, isAdmin: boolean = false) => {
    try {
      const endpoint = isAdmin ? '/api/admin/admin-users/update-role' : '/api/admin/users/update-role';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: 'User role updated successfully',
        });
        if (isAdmin) {
          fetchAdminUsers();
        } else {
          fetchUsers();
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update role',
        variant: 'error',
      });
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'error',
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/invites/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: `Invite sent to ${inviteEmail}`,
        });
        setInviteDialogOpen(false);
        setInviteEmail('');
        setInviteRole('SUPPORT');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send invite',
        variant: 'error',
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.phoneNumber.includes(searchQuery) ||
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdminUsers = adminUsers.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-2 text-gray-600">
              Manage user accounts, roles, and send admin invites
            </p>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Admin Invite</DialogTitle>
                <DialogDescription>
                  Send an invitation email to create a new admin account
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="invite-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUPPORT">Support</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendInvite}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'users'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="inline mr-2 h-4 w-4" />
            Regular Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'admins'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="inline mr-2 h-4 w-4" />
            Admin Users ({adminUsers.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'users' ? 'Regular Users' : 'Admin Users'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'users'
                ? `${filteredUsers.length} users found`
                : `${filteredAdminUsers.length} admin users found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : activeTab === 'users' ? (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {user.firstName} {user.lastName}
                        </h3>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {user.phoneNumber} {user.email && `• ${user.email}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {formatDate(new Date(user.createdAt))}
                        {user.lastLogin && ` • Last login: ${formatDate(new Date(user.lastLogin))}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleUpdateRole(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PWD">PWD</SelectItem>
                          <SelectItem value="CAREGIVER">Caregiver</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant={user.isActive ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAdminUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
                          {user.firstName} {user.lastName}
                        </h3>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{user.role.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {formatDate(new Date(user.createdAt))}
                        {user.lastLogin && ` • Last login: ${formatDate(new Date(user.lastLogin))}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleUpdateRole(user.id, value, true)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SUPPORT">Support</SelectItem>
                          <SelectItem value="MODERATOR">Moderator</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant={user.isActive ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleToggleActive(user.id, user.isActive, true)}
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Activate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
