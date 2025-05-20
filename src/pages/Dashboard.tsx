
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBlog, Blog } from "@/context/BlogContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BlogCard from "@/components/BlogCard";

const Dashboard = () => {
  const { userBlogs, draftBlogs, deleteBlog, isLoading } = useBlog();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [publishedBlogs, setPublishedBlogs] = useState<Blog[]>([]);
  const [draftedBlogs, setDraftedBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (userBlogs.length > 0) {
      setPublishedBlogs(userBlogs.filter(blog => blog.published));
      setDraftedBlogs(userBlogs.filter(blog => !blog.published));
    }
  }, [userBlogs]);

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog? This action cannot be undone.")) {
      await deleteBlog(id);
    }
  };

  if (!isAuthenticated || !user) {
    return null; // Redirect will handle this case
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium">Your Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your blogs and drafts
          </p>
        </div>
        <Button asChild>
          <Link to="/new-post">Create New Post</Link>
        </Button>
      </div>
      
      <Tabs defaultValue="published">
        <TabsList className="mb-8">
          <TabsTrigger value="published">
            Published ({publishedBlogs.length})
          </TabsTrigger>
          <TabsTrigger value="drafted">
            Saved Drafts ({draftedBlogs.length + draftBlogs.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="published">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : publishedBlogs.length > 0 ? (
            <div className="grid gap-6">
              {publishedBlogs.map((blog) => (
                <div key={blog.id} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <BlogCard blog={blog} layout="row" showAuthor={false} />
                  </div>
                  <div className="flex flex-row md:flex-col gap-2 pt-4 md:pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/edit-blog/${blog.id}`}>
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteBlog(blog.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No published blogs yet</h3>
              <p className="text-muted-foreground mb-6">
                When you publish blogs, they'll appear here.
              </p>
              <Button asChild>
                <Link to="/new-post">Write Your First Blog</Link>
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="drafted">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : draftedBlogs.length > 0 || draftBlogs.length > 0 ? (
            <div className="space-y-8">
              {/* Unpublished blogs */}
              {draftedBlogs.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mb-4">Unpublished Blogs</h3>
                  <div className="grid gap-6">
                    {draftedBlogs.map((blog) => (
                      <div key={blog.id} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <BlogCard blog={blog} layout="row" showAuthor={false} />
                        </div>
                        <div className="flex flex-row md:flex-col gap-2 pt-4 md:pt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/edit-blog/${blog.id}`}>
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteBlog(blog.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {/* Draft blogs */}
              {draftBlogs.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mb-4 mt-8">Draft Blogs</h3>
                  <div className="grid gap-6">
                    {draftBlogs.map((draft) => (
                      <div key={draft.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between">
                        <div>
                          <h4 className="font-medium text-lg mb-2">
                            {draft.title || "Untitled Draft"}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Last edited: {new Date(draft.lastSaved || "").toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/edit-draft/${draft.id}`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No drafts yet</h3>
              <p className="text-muted-foreground mb-6">
                Your saved drafts will appear here.
              </p>
              <Button asChild>
                <Link to="/new-post">Create a Draft</Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
