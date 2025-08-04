import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CreateUserFormProps {
  onCreateUser: (userData: {
    email: string;
    password: string;
    full_name: string;
    division?: string;
    role: 'admin' | 'manager' | 'user';
  }) => Promise<boolean>;
  isLoading: boolean;
}

export const CreateUserForm = ({ onCreateUser, isLoading }: CreateUserFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    division: "",
    role: "user" as 'admin' | 'manager' | 'user',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onCreateUser({
      ...formData,
      division: formData.division || undefined,
    });
    
    if (success) {
      setFormData({
        email: "",
        password: "",
        full_name: "",
        division: "",
        role: "user",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                minLength={6}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="division">Division</Label>
              <Input
                id="division"
                type="text"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                placeholder="Optional"
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: 'admin' | 'manager' | 'user') => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create User
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};