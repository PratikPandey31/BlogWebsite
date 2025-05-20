
import { useEffect, useState } from "react";
import { useBlog } from "@/context/BlogContext";
import BlogCard from "@/components/BlogCard";
import { Input } from "@/components/ui/input";
import { Blog } from "@/context/BlogContext";

const Blogs = () => {
  const { blogs, isLoading, fetchBlogs } = useBlog();
  const [displayedBlogs, setDisplayedBlogs] = useState<Blog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getBlogs = async () => {
      await fetchBlogs();
    };
    getBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    // Filter blogs based on search term
    if (blogs.length > 0) {
      const filtered = blogs
        .filter(blog => blog.published)
        .filter(blog => 
          blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setDisplayedBlogs(filtered);
    }
  }, [blogs, searchTerm]);

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="font-serif text-4xl font-medium mb-8">All Blogs</h1>
      
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : displayedBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? "No blogs found matching your search." 
              : "No blogs found."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Blogs;
