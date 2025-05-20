
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBlog } from "@/context/BlogContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Heart } from "lucide-react";

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBlog, fetchBlogById, isLoading, likeBlog, deleteBlog } = useBlog();
  const { user, isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isUserAuthor, setIsUserAuthor] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBlogById(id);
    }
  }, [id, fetchBlogById]);

  useEffect(() => {
    if (currentBlog && user) {
      setIsLiked(currentBlog.likes.includes(user.id));
      setLikeCount(currentBlog.likes.length);
      setIsUserAuthor(currentBlog.author.id === user.id);
    } else if (currentBlog) {
      setLikeCount(currentBlog.likes.length);
    }
  }, [currentBlog, user]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (id) {
      await likeBlog(id);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    }
  };

  const handleEdit = () => {
    if (id && isUserAuthor) {
      navigate(`/edit-blog/${id}`);
    }
  };

  const handleDelete = async () => {
    if (id && isUserAuthor) {
      if (window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) {
        await deleteBlog(id);
        navigate("/dashboard");
      }
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
    <article className="container mx-auto py-10 px-4">
      {/* Cover Image */}
      {currentBlog.coverImage && (
        <div className="w-full h-[400px] mb-8 overflow-hidden rounded-lg">
          <img
            src={currentBlog.coverImage}
            alt={currentBlog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="font-serif text-4xl md:text-5xl font-medium mb-6">
        {currentBlog.title}
      </h1>

      {/* Author and Date */}
      <div className="flex items-center justify-between mb-8 pb-8 border-b">
        <div className="flex items-center">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarFallback>
              {currentBlog.author.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{currentBlog.author.username}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(currentBlog.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ${isLiked ? "text-red-500" : ""}`}
            onClick={handleLike}
          >
            <Heart
              className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
            />
            <span>{likeCount}</span>
          </Button>

          {isUserAuthor && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Blog Content */}
      <div 
        className="prose lg:prose-xl mx-auto"
        dangerouslySetInnerHTML={{ __html: currentBlog.content }}
      />
    </article>
  );
};

export default BlogDetail;
