
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, Info } from "lucide-react";

interface PreviewMessageProps {
  action: string;
}

const PreviewMessage = ({ action }: PreviewMessageProps) => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="border-dashed border-2 border-amber-300">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-xl">Preview Mode</CardTitle>
          </div>
          <CardDescription>
            You're currently browsing in preview mode
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p>
            You need to sign in to {action}. Preview mode allows you to browse projects, but you'll need an account to contribute.
          </p>
        </CardContent>
        <CardFooter>
          <Link to="/auth" className="w-full">
            <Button className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign in or Create Account
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PreviewMessage;
