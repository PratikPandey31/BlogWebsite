
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useBlog } from "@/context/BlogContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import RichTextEditor from "@/components/RichTextEditor";

const CreateBlog = () => {
  const [coverImage, setCoverImage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { currentDraft, draftBlogs, saveDraft, publishDraft } = useBlog();
  const navigate = useNavigate();
  
  // Get recent drafts (limited to 3) for current user only
  const recentDrafts = draftBlogs
    .filter(draft => {
      // Only include drafts from the current user
      const draftUserId = draft.id?.split('-')[0];
      return draftUserId === user?.id;
    })
    .sort((a, b) => {
      const dateA = a.lastSaved ? new Date(a.lastSaved).getTime() : 0;
      const dateB = b.lastSaved ? new Date(b.lastSaved).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setIsSaving(true);
      // The actual save is handled by RichTextEditor component
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving draft:", error);
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setIsPublishing(true);
      if (currentDraft?.id) {
        const published = await publishDraft(currentDraft.id);
        navigate(`/blog/${published.id}`);
      } else {
        // If no draft exists yet, create one first then publish it
        const draftToPublish = await saveDraft({
          title: document.querySelector<HTMLInputElement>('input[type="text"]')?.value || "Untitled",
          content: document.querySelector<HTMLDivElement>('[contenteditable="true"]')?.innerHTML || "",
          coverImage: coverImage,
        });
        
        if (draftToPublish.id) {
          const published = await publishDraft(draftToPublish.id);
          navigate(`/blog/${published.id}`);
        }
      }
    } catch (error) {
      console.error("Error publishing blog:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="p-6">
            <h1 className="font-serif text-3xl font-medium mb-8">Create New Blog Post</h1>
            
            <div className="mb-8">
              <Label htmlFor="coverImage" className="block mb-2">
                Cover Image URL (optional)
              </Label>
              <Input
                id="coverImage"
                type="text"
                placeholder="https://example.com/image.jpg"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="mb-2"
              />
              {coverImage && (
                <div className="mt-2 rounded-md overflow-hidden h-40">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/1200x400?text=Invalid+Image+URL";
                    }}
                  />
                </div>
              )}
            </div>
            
            <RichTextEditor />
            
            <div className="mt-8 flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving || isPublishing}
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isSaving || isPublishing}
              >
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="font-serif text-xl font-medium mb-4">Recent Drafts</h2>
            <Separator className="mb-4" />
            
            {recentDrafts.length > 0 ? (
              <div className="space-y-4">
                {recentDrafts.map(draft => (
                  <div key={draft.id} className="border rounded-lg p-3">
                    <h3 className="font-medium mb-1">
                      {draft.title || "Untitled Draft"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {draft.lastSaved ? new Date(draft.lastSaved).toLocaleString() : "No date"}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      className="w-full"
                    >
                      <Link to={`/edit-draft/${draft.id}`}>Continue Editing</Link>
                    </Button>
                  </div>
                ))}
                
                {recentDrafts.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild 
                    className="w-full mt-2"
                  >
                    <Link to="/drafts">View All Drafts</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent drafts found</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
