import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock } from 'lucide-react';

interface PendingApprovalMessageProps {
  userEmail: string | null;
}

const PendingApprovalMessage: React.FC<PendingApprovalMessageProps> = ({ userEmail }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Clock className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-xl">Account Pending Approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you for creating your account. Your registration is currently pending approval from an administrator.
          </p>
          
          {userEmail && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Registered email:</p>
              <p className="font-medium">{userEmail}</p>
            </div>
          )}
          
          <Badge variant="secondary" className="mt-4">
            Status: Pending
          </Badge>
          
          <p className="text-sm text-muted-foreground mt-4">
            You will receive access to the application once your account has been approved. 
            Please contact your administrator if you have any questions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApprovalMessage;