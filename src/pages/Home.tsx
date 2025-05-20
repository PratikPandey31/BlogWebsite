
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBlog } from "@/context/BlogContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import BlogCard from "@/components/BlogCard";
import { Blog } from "@/context/BlogContext";

const Home = () => {
  const { blogs, isLoading, fetchBlogs } = useBlog();
  const { isAuthenticated } = useAuth();
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const getBlogs = async () => {
      await fetchBlogs();
    };
    getBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    if (blogs.length > 0) {
      // Get featured blogs (most liked)
      const sortedByLikes = [...blogs]
        .filter(blog => blog.published)
        .sort((a, b) => b.likes.length - a.likes.length)
        .slice(0, 3);
      setFeaturedBlogs(sortedByLikes);
      
      // Get recent blogs
      const sortedByDate = [...blogs]
        .filter(blog => blog.published)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);
      setRecentBlogs(sortedByDate);
    }
  }, [blogs]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-24">
        <div className="container mx-auto text-center px-4">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Your Thoughts, Beautifully Presented
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8 text-white/80">
            Create, share, and discover amazing stories on RevoltronX, the blogging platform designed for creative minds.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              <Link to="/blogs">Explore Blogs</Link>
            </Button>
            {isAuthenticated ? (
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
                <Link to="/new-post">Start Writing</Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/20">
                <Link to="/register">Get Started</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {featuredBlogs.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-3xl font-medium mb-8">Featured Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Posts Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-3xl font-medium">Recent Stories</h2>
            <Button asChild variant="ghost">
              <Link to="/blogs">View All</Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : recentBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">No blogs found.</p>
              {isAuthenticated ? (
                <Button asChild>
                  <Link to="/new-post">Write Your First Blog</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/register">Sign Up to Start</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-medium mb-4">Ready to Share Your Story?</h2>
          <p className="text-lg max-w-2xl mx-auto mb-8 text-muted-foreground">
            Join our community of writers and readers. Create an account to start writing and sharing your thoughts with the world.
          </p>
          {isAuthenticated ? (
            <Button asChild size="lg">
              <Link to="/new-post">Create New Post</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link to="/register">Join RevoltronX</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
