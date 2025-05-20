
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Blog } from '@/context/BlogContext';

interface BlogCardProps {
  blog: Blog;
  layout?: 'grid' | 'row';
  showAuthor?: boolean;
}

const BlogCard = ({ blog, layout = 'grid', showAuthor = true }: BlogCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "some time ago";
    }
  };

  if (layout === 'row') {
    return (
      <Link to={`/blog/${blog.id}`}>
        <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row h-full">
            {blog.coverImage && !imageError ? (
              <div className="md:w-1/3 h-48 md:h-full relative">
                <img 
                  src={blog.coverImage} 
                  alt={blog.title} 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
            ) : (
              <div className="md:w-1/3 h-48 md:h-full bg-muted flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
            <div className="flex-1 flex flex-col p-6">
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-serif font-medium text-lg md:text-xl mb-2 line-clamp-2">{blog.title}</h3>
                  {!blog.published && <Badge variant="outline" className="shrink-0">Draft</Badge>}
                </div>
                <p className="text-muted-foreground line-clamp-3 mb-4">{blog.excerpt}</p>
              </div>
              <div className="flex justify-between items-center text-sm">
                {showAuthor && (
                  <p className="text-muted-foreground">By {blog.author.username}</p>
                )}
                <p className="text-muted-foreground">{formatDate(blog.createdAt)}</p>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/blog/${blog.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        {blog.coverImage && !imageError ? (
          <div className="h-48 relative overflow-hidden">
            <img 
              src={blog.coverImage} 
              alt={blog.title} 
              className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              onError={handleImageError}
            />
          </div>
        ) : (
          <div className="h-48 bg-muted flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        <CardContent className="flex-1 flex flex-col pt-6">
          <div className="flex justify-between items-start gap-2 mb-2">
            <h3 className="font-serif font-medium text-lg line-clamp-2">{blog.title}</h3>
            {!blog.published && <Badge variant="outline" className="shrink-0">Draft</Badge>}
          </div>
          <p className="text-muted-foreground line-clamp-3 mb-4">{blog.excerpt}</p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm border-t pt-4">
          {showAuthor && (
            <p className="text-muted-foreground">By {blog.author.username}</p>
          )}
          <p className="text-muted-foreground">{formatDate(blog.createdAt)}</p>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default BlogCard;
