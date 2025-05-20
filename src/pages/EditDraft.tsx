
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBlog } from "@/context/BlogContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import RichTextEditor from "@/components/RichTextEditor";
import { toast } from "sonner";

const EditDraft = () => {
  const { id } = useParams<{ id: string }>();
  const [coverImage, setCoverImage] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { isAuthenticated } = useAuth();
  const { currentDraft, getDraftById, saveDraft, publishDraft } = useBlog();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (id) {
      // Fetch draft and handle not found case
      getDraftById(id).catch(error => {
        console.error("Error loading draft:", error);
        setNotFound(true);
        toast.error("Draft not found");
      });
    }
  }, [id, getDraftById, isAuthenticated, navigate]);

  useEffect(() => {
    if (currentDraft) {
      setCoverImage(currentDraft.coverImage || "");
    }
  }, [currentDraft]);

  const handlePublish = async () => {
    if (!isAuthenticated || !id) {
      navigate("/login");
      return;
    }

    try {
      setIsPublishing(true);
      const published = await publishDraft(id);
      navigate(`/blog/${published.id}`);
    } catch (error) {
      console.error("Error publishing draft:", error);
      toast.error("Failed to publish draft");
    } finally {
      setIsPublishing(false);
    }
  };

  // If draft not found, show a message and redirect option
  if (notFound) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="font-serif text-3xl font-medium mb-4">Draft Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The draft you're looking for doesn't exist or may have been deleted.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/drafts")}>
              View All Drafts
            </Button>
            <Button onClick={() => navigate("/new-post")}>
              Create New Post
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-4xl mx-auto p-6">
        <h1 className="font-serif text-3xl font-medium mb-8">Edit Draft</h1>
        
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
        
        {currentDraft && (
          <RichTextEditor 
            initialTitle={currentDraft.title} 
            initialContent={currentDraft.content} 
            draftId={id}
          />
        )}
        
        <div className="mt-8 flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate("/drafts")}
          >
            Back to Drafts
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isPublishing || !currentDraft}
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EditDraft;
