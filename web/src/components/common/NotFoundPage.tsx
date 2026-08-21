import { Link } from "react-router-dom";
import { useAuth } from "@/auth/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NotFoundPage() {
  const { isAuthenticated } = useAuth();
  const returnPath = isAuthenticated ? "/dashboard" : "/login";

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
        <CardDescription>The route you opened does not exist in this web app.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <Link to={returnPath}>Return home</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
