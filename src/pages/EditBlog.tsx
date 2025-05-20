
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBlog } from "@/context/BlogContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import RichTextEditor from "@/components/RichTextEditor";

const EditBlog = () => {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { currentBlog, fetchBlogById, updateBlog, isLoading } = useBlog();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchBlogById(id);
    }
  }, [id, fetchBlogById]);

  useEffect(() => {
    if (currentBlog) {
      setTitle(currentBlog.title);
      setContent(currentBlog.content);
      setCoverImage(currentBlog.coverImage || "");
      
      // Check if the user is the author
      if (user && currentBlog.author.id !== user.id) {
        navigate(`/blog/${id}`);
      }
    }
  }, [currentBlog, user, id, navigate]);

  const handleUpdate = async () => {
    if (!isAuthenticated || !id) {
      navigate("/login");
      return;
    }

    try {
      setIsUpdating(true);
      const updatedBlogData = {
        title: document.querySelector<HTMLInputElement>('input[type="text"]')?.value || title,
        content: document.querySelector<HTMLDivElement>('[contenteditable="true"]')?.innerHTML || content,
        coverImage,
        excerpt: document.querySelector<HTMLDivElement>('[contenteditable="true"]')?.textContent?.substring(0, 150) + "..." || "",
      };

      await updateBlog(id, updatedBlogData);
      navigate(`/blog/${id}`);
    } catch (error) {
      console.error("Error updating blog:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-medium mb-4">Blog Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The blog you're looking for doesn't exist or may have been removed.
        </p>
        <Button onClick={() => navigate("/blogs")}>Back to Blogs</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-4xl mx-auto p-6">
        <h1 className="font-serif text-3xl font-medium mb-8">Edit Blog Post</h1>
        
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
        
        <RichTextEditor initialContent={content} initialTitle={title} />
        
        <div className="mt-8 flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(`/blog/${id}`)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Blog"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EditBlog;
