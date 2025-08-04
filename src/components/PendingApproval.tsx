import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const PendingApproval = () => {
  const { profile, signOut } = useAuth();

  if (profile?.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle className="text-destructive">Account Rejected</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your account registration has been rejected. Please contact your administrator for more information.
            </p>
            <button
              onClick={signOut}
              className="text-primary hover:underline"
            >
              Sign out and try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Clock className="h-12 w-12 text-orange-500 mx-auto mb-2" />
          <CardTitle>Approval Pending</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Badge variant="outline" className="text-orange-600 border-orange-200">
            Pending Review
          </Badge>
          
          <div className="space-y-2">
            <p className="font-medium">Welcome, {profile?.full_name || profile?.email}!</p>
            <p className="text-muted-foreground">
              Your account is waiting for administrator approval. You'll receive access once your account has been reviewed.
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Account details:
            </p>
            <div className="text-sm space-y-1">
              <p><strong>Email:</strong> {profile?.email}</p>
              {profile?.division && (
                <p><strong>Division:</strong> {profile.division}</p>
              )}
            </div>
          </div>

          <button
            onClick={signOut}
            className="text-primary hover:underline text-sm"
          >
            Sign out
          </button>
        </CardContent>
      </Card>
    </div>
  );
};