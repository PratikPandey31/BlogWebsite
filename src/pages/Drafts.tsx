
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBlog } from "@/context/BlogContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const Drafts = () => {
  const { draftBlogs, deleteDraft, isLoading } = useBlog();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Filter drafts to only show those belonging to current user
  const userDrafts = draftBlogs.filter(draft => {
    const draftUserId = draft.id?.split('-')[0] || draft.userId;
    return draftUserId === user?.id;
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const handleDeleteDraft = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this draft? This action cannot be undone.")) {
      await deleteDraft(id);
    }
  };

  if (!isAuthenticated) {
    return null; // Redirect will handle this case
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "some time ago";
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium">Your Drafts</h1>
          <p className="text-muted-foreground mt-2">
            Continue working on your drafts
          </p>
        </div>
        <Button asChild>
          <Link to="/new-post">Create New Draft</Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : userDrafts.length > 0 ? (
        <div className="grid gap-4">
          {userDrafts.map((draft) => (
            <div key={draft.id} className="border rounded-lg p-6 hover:border-primary/50 transition-colors">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-medium mb-2">
                    {draft.title || "Untitled Draft"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Last saved: {formatDate(draft.lastSaved)}
                  </p>
                </div>
                <div className="flex gap-2 items-start">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to={`/edit-draft/${draft.id}`}>
                      Continue Editing
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDraft(draft.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              
              {/* Preview of content */}
              <div className="mt-4 text-muted-foreground text-sm line-clamp-2">
                <div dangerouslySetInnerHTML={{ 
                  __html: draft.content.replace(/<[^>]*>/g, ' ').substring(0, 150) + "..." 
                }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No drafts yet</h3>
          <p className="text-muted-foreground mb-6">
            Your saved drafts will appear here.
          </p>
          <Button asChild>
            <Link to="/new-post">Create Your First Draft</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Drafts;
