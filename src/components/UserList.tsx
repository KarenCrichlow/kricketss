import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, User } from "lucide-react";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  division: string | null;
  created_at: string;
  updated_at: string;
  user_roles: Array<{ role: 'admin' | 'manager' | 'user' }>;
}

interface UserListProps {
  users: UserProfile[];
  onUpdateRole: (userId: string, role: 'admin' | 'manager' | 'user') => Promise<void>;
  onUpdateProfile: (userId: string, updates: { full_name?: string; division?: string }) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  isLoading: boolean;
}

export const UserList = ({ users, onUpdateRole, onUpdateProfile, onDeleteUser, isLoading }: UserListProps) => {
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFormData, setEditFormData] = useState({ full_name: "", division: "" });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'user': return 'secondary';
      default: return 'outline';
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name || "",
      division: user.division || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    await onUpdateProfile(editingUser.id, editFormData);
    setEditingUser(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Management ({users.length} users)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const userRole = user.user_roles[0]?.role || 'user';
                
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || "No name"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.division || "No division"}</TableCell>
                    <TableCell>
                      <Select 
                        value={userRole} 
                        onValueChange={(role: 'admin' | 'manager' | 'user') => onUpdateRole(user.id, role)}
                        disabled={isLoading}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User Profile</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit_full_name">Full Name</Label>
                                <Input
                                  id="edit_full_name"
                                  value={editFormData.full_name}
                                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit_division">Division</Label>
                                <Input
                                  id="edit_division"
                                  value={editFormData.division}
                                  onChange={(e) => setEditFormData({ ...editFormData, division: e.target.value })}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setEditingUser(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleSaveEdit}>
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteUser(user.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};