
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <h1 className="font-serif text-8xl font-bold mb-4">404</h1>
      <h2 className="text-3xl font-medium mb-6">Page Not Found</h2>
      <p className="max-w-lg mx-auto text-muted-foreground mb-8">
        We couldn't find the page you're looking for. The page might have been moved, deleted, or never existed.
      </p>
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link to="/">Go Home</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/blogs">Explore Blogs</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
