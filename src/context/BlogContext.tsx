import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { useAuth } from './AuthContext';

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  author: {
    id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  published: boolean;
  likes: string[]; // Array of user IDs
}

interface DraftBlog {
  id?: string;
  userId?: string;
  title: string;
  content: string;
  coverImage?: string;
  lastSaved?: string;
}

interface BlogContextType {
  blogs: Blog[];
  userBlogs: Blog[];
  draftBlogs: DraftBlog[];
  currentBlog: Blog | null;
  currentDraft: DraftBlog | null;
  isLoading: boolean;
  fetchBlogs: () => Promise<Blog[]>; // Changed return type
  fetchBlogById: (id: string) => Promise<void>;
  createBlog: (blog: Partial<Blog>) => Promise<Blog>;
  updateBlog: (id: string, blog: Partial<Blog>) => Promise<Blog>;
  deleteBlog: (id: string) => Promise<void>;
  publishBlog: (id: string) => Promise<Blog>;
  likeBlog: (id: string) => Promise<void>;
  saveDraft: (draft: DraftBlog) => Promise<DraftBlog>;
  getDraftById: (id: string) => Promise<DraftBlog>; // Changed return type
  publishDraft: (draftId: string) => Promise<Blog>;
  deleteDraft: (id: string) => Promise<void>;
  setCurrentDraft: (draft: DraftBlog | null) => void;
}

const BlogContext = createContext<BlogContextType | null>(null);

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

// Mock data for blogs
const mockBlogs: Blog[] = [
  {
    id: '1',
    title: 'Getting Started with React',
    content: '<p>React is a popular JavaScript library for building user interfaces, particularly single-page applications. It\'s used for handling the view layer in web and mobile apps. React allows us to create reusable UI components.</p><h2>Why React?</h2><p>React was created by Facebook and has gained significant adoption in the developer community. Here are some reasons why:</p><ul><li>Component-based architecture</li><li>Virtual DOM for better performance</li><li>Unidirectional data flow</li><li>JSX syntax which is easy to understand</li></ul><p>If you\'re just getting started with React, the official documentation is an excellent resource. Good luck on your React journey!</p>',
    excerpt: 'Learn the basics of React and how to create your first application with this powerful JavaScript library.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1470&auto=format&fit=crop',
    author: { id: '2', username: 'janesmith' },
    createdAt: '2023-11-01T12:00:00Z',
    updatedAt: '2023-11-01T12:00:00Z',
    published: true,
    likes: ['3', '4']
  },
  {
    id: '2',
    title: 'The Art of Writing Clean Code',
    content: '<p>Clean code is not just about making your code work. It\'s about creating code that is readable, maintainable, and respects the time and mental energy of other developers who will interact with it.</p><h2>Principles of Clean Code</h2><p>There are several principles that can guide you toward writing cleaner code:</p><ol><li>DRY (Don\'t Repeat Yourself)</li><li>KISS (Keep It Simple, Stupid)</li><li>SOLID principles</li><li>Meaningful variable and function names</li></ol><p>Remember that code is read many more times than it is written. Optimizing for readability will pay off in the long run.</p>',
    excerpt: 'Discover the principles and practices that lead to code that is not just functional, but also maintainable and elegant.',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1470&auto=format&fit=crop',
    author: { id: '3', username: 'alexjohnson' },
    createdAt: '2023-11-15T10:30:00Z',
    updatedAt: '2023-11-15T10:30:00Z',
    published: true,
    likes: ['2', '4', '5']
  },
  {
    id: '3',
    title: 'Understanding Asynchronous JavaScript',
    content: '<p>Asynchronous programming in JavaScript can be challenging to understand at first, but it\'s an essential concept for web developers.</p><h2>Callbacks, Promises, and Async/Await</h2><p>JavaScript has evolved over time to handle asynchronous operations better:</p><ul><li>Callbacks were the original way to handle asynchronous code</li><li>Promises improved on callbacks by providing better error handling and chaining</li><li>Async/Await syntax makes asynchronous code look and behave more like synchronous code</li></ul><p>Understanding these concepts will help you write more efficient and maintainable JavaScript code.</p>',
    excerpt: 'Dive into the world of asynchronous JavaScript and learn how to work with callbacks, promises, and async/await.',
    coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1374&auto=format&fit=crop',
    author: { id: '1', username: 'johndoe' },
    createdAt: '2023-12-05T15:45:00Z',
    updatedAt: '2023-12-05T15:45:00Z',
    published: true,
    likes: ['2', '3']
  }
];

export const BlogProvider = ({ children }: { children: React.ReactNode }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
  const [draftBlogs, setDraftBlogs] = useState<DraftBlog[]>([]);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [currentDraft, setCurrentDraft] = useState<DraftBlog | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { user } = useAuth();
  
  // Load blogs from localStorage or initialize with mock data
  useEffect(() => {
    const storedBlogs = localStorage.getItem('blogs');
    if (storedBlogs) {
      setBlogs(JSON.parse(storedBlogs));
    } else {
      setBlogs(mockBlogs);
      localStorage.setItem('blogs', JSON.stringify(mockBlogs));
    }
    
    // Load drafts from localStorage
    const storedDrafts = localStorage.getItem('drafts');
    if (storedDrafts) {
      setDraftBlogs(JSON.parse(storedDrafts));
    }
  }, []);

  // Update userBlogs when user or blogs change
  useEffect(() => {
    if (user && blogs.length) {
      const filteredBlogs = blogs.filter(blog => blog.author.id === user.id);
      setUserBlogs(filteredBlogs);
    } else {
      setUserBlogs([]);
    }
  }, [user, blogs]);

  // Fetch all published blogs
  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      const publishedBlogs = blogs.filter(blog => blog.published);
      setIsLoading(false);
      return publishedBlogs;
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to fetch blogs");
      console.error("Error fetching blogs:", error);
      throw error;
    }
  };

  // Fetch a single blog by ID
  const fetchBlogById = async (id: string) => {
    try {
      setIsLoading(true);
      // In a real app, this would be an API call
      const blog = blogs.find(b => b.id === id);
      if (!blog) {
        throw new Error("Blog not found");
      }
      setCurrentBlog(blog);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to fetch blog");
      console.error("Error fetching blog:", error);
      throw error;
    }
  };

  // Create a new blog
  const createBlog = async (blogData: Partial<Blog>) => {
    if (!user) throw new Error("You must be logged in to create a blog");
    
    try {
      setIsLoading(true);
      const newBlog: Blog = {
        id: Date.now().toString(),
        title: blogData.title || "Untitled Blog",
        content: blogData.content || "",
        excerpt: blogData.excerpt || "",
        coverImage: blogData.coverImage || undefined,
        author: {
          id: user.id,
          username: user.username,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        published: blogData.published || false,
        likes: [],
      };
      
      const updatedBlogs = [...blogs, newBlog];
      setBlogs(updatedBlogs);
      localStorage.setItem('blogs', JSON.stringify(updatedBlogs));
      
      setIsLoading(false);
      toast.success("Blog created successfully!");
      return newBlog;
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to create blog");
      console.error("Error creating blog:", error);
      throw error;
    }
  };

  // Update an existing blog
  const updateBlog = async (id: string, blogData: Partial<Blog>) => {
    if (!user) throw new Error("You must be logged in to update a blog");
    
    try {
      setIsLoading(true);
      
      const blogIndex = blogs.findIndex(b => b.id === id);
      if (blogIndex === -1) {
        throw new Error("Blog not found");
      }
      
      const blog = blogs[blogIndex];
      if (blog.author.id !== user.id) {
        throw new Error("You can only edit your own blogs");
      }
      
      const updatedBlog = {
        ...blog,
        ...blogData,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedBlogs = [...blogs];
      updatedBlogs[blogIndex] = updatedBlog;
      
      setBlogs(updatedBlogs);
      localStorage.setItem('blogs', JSON.stringify(updatedBlogs));
      
      setIsLoading(false);
      toast.success("Blog updated successfully!");
      return updatedBlog;
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to update blog");
      console.error("Error updating blog:", error);
      throw error;
    }
  };

  // Delete a blog
  const deleteBlog = async (id: string) => {
    if (!user) throw new Error("You must be logged in to delete a blog");
    
    try {
      setIsLoading(true);
      
      const blog = blogs.find(b => b.id === id);
      if (!blog) {
        throw new Error("Blog not found");
      }
      
      if (blog.author.id !== user.id) {
        throw new Error("You can only delete your own blogs");
      }
      
      const updatedBlogs = blogs.filter(b => b.id !== id);
      setBlogs(updatedBlogs);
      localStorage.setItem('blogs', JSON.stringify(updatedBlogs));
      
      setIsLoading(false);
      toast.success("Blog deleted successfully!");
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to delete blog");
      console.error("Error deleting blog:", error);
      throw error;
    }
  };

  // Publish a blog
  const publishBlog = async (id: string) => {
    if (!user) throw new Error("You must be logged in to publish a blog");
    
    try {
      setIsLoading(true);
      
      const blogIndex = blogs.findIndex(b => b.id === id);
      if (blogIndex === -1) {
        throw new Error("Blog not found");
      }
      
      const blog = blogs[blogIndex];
      if (blog.author.id !== user.id) {
        throw new Error("You can only publish your own blogs");
      }
      
      const updatedBlog = {
        ...blog,
        published: true,
        updatedAt: new Date().toISOString(),
      };
      
      const updatedBlogs = [...blogs];
      updatedBlogs[blogIndex] = updatedBlog;
      
      setBlogs(updatedBlogs);
      localStorage.setItem('blogs', JSON.stringify(updatedBlogs));
      
      setIsLoading(false);
      toast.success("Blog published successfully!");
      return updatedBlog;
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to publish blog");
      console.error("Error publishing blog:", error);
      throw error;
    }
  };

  // Like a blog
  const likeBlog = async (id: string) => {
    if (!user) throw new Error("You must be logged in to like a blog");
    
    try {
      setIsLoading(true);
      
      const blogIndex = blogs.findIndex(b => b.id === id);
      if (blogIndex === -1) {
        throw new Error("Blog not found");
      }
      
      const blog = blogs[blogIndex];
      const userLiked = blog.likes.includes(user.id);
      
      let updatedLikes = [];
      if (userLiked) {
        // Unlike
        updatedLikes = blog.likes.filter(userId => userId !== user.id);
      } else {
        // Like
        updatedLikes = [...blog.likes, user.id];
      }
      
      const updatedBlog = {
        ...blog,
        likes: updatedLikes,
      };
      
      const updatedBlogs = [...blogs];
      updatedBlogs[blogIndex] = updatedBlog;
      
      setBlogs(updatedBlogs);
      if (currentBlog && currentBlog.id === id) {
        setCurrentBlog(updatedBlog);
      }
      
      localStorage.setItem('blogs', JSON.stringify(updatedBlogs));
      
      setIsLoading(false);
      toast.success(userLiked ? "Blog unliked" : "Blog liked");
    } catch (error) {
      setIsLoading(false);
      toast.error("Action failed");
      console.error("Error liking/unliking blog:", error);
      throw error;
    }
  };

  // Save draft
  const saveDraft = async (draft: DraftBlog) => {
    if (!user) throw new Error("You must be logged in to save a draft");
    
    try {
      let updatedDrafts = [...draftBlogs];
      const now = new Date().toISOString();
      
      if (draft.id) {
        // Update existing draft
        const draftIndex = draftBlogs.findIndex(d => d.id === draft.id);
        if (draftIndex !== -1) {
          updatedDrafts[draftIndex] = {
            ...draft,
            userId: user.id, // Ensure userId is set
            lastSaved: now,
          };
        } else {
          throw new Error("Draft not found");
        }
      } else {
        // Create new draft with user ID
        const newDraft = {
          ...draft,
          id: `${user.id}-draft-${Date.now()}`, // Include user ID in the draft ID
          userId: user.id,
          lastSaved: now,
        };
        updatedDrafts = [...draftBlogs, newDraft];
        setCurrentDraft(newDraft);
      }
      
      setDraftBlogs(updatedDrafts);
      localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
      
      toast.success("Draft saved");
      return updatedDrafts.find(d => d.id === draft.id) || updatedDrafts[updatedDrafts.length - 1];
    } catch (error) {
      toast.error("Failed to save draft");
      console.error("Error saving draft:", error);
      throw error;
    }
  };

  // Get draft by ID
  const getDraftById = async (id: string) => {
    try {
      const draft = draftBlogs.find(d => d.id === id);
      if (!draft) {
        throw new Error("Draft not found");
      }
      setCurrentDraft(draft);
      return draft;
    } catch (error) {
      toast.error("Failed to load draft");
      console.error("Error getting draft:", error);
      throw error;
    }
  };

  // Publish draft
  const publishDraft = async (draftId: string) => {
    if (!user) throw new Error("You must be logged in to publish a draft");
    
    try {
      setIsLoading(true);
      
      const draft = draftBlogs.find(d => d.id === draftId);
      if (!draft) {
        throw new Error("Draft not found");
      }
      
      // Create new blog from draft
      const newBlog = await createBlog({
        title: draft.title,
        content: draft.content,
        excerpt: draft.content.substring(0, 150) + "...",
        coverImage: draft.coverImage,
        published: true,
      });
      
      // Delete the draft
      await deleteDraft(draftId);
      
      setIsLoading(false);
      toast.success("Draft published successfully!");
      return newBlog;
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to publish draft");
      console.error("Error publishing draft:", error);
      throw error;
    }
  };

  // Delete draft
  const deleteDraft = async (id: string) => {
    try {
      const updatedDrafts = draftBlogs.filter(d => d.id !== id);
      setDraftBlogs(updatedDrafts);
      localStorage.setItem('drafts', JSON.stringify(updatedDrafts));
      
      if (currentDraft && currentDraft.id === id) {
        setCurrentDraft(null);
      }
      
      toast.success("Draft deleted");
    } catch (error) {
      toast.error("Failed to delete draft");
      console.error("Error deleting draft:", error);
      throw error;
    }
  };

  return (
    <BlogContext.Provider
      value={{
        blogs,
        userBlogs,
        draftBlogs,
        currentBlog,
        currentDraft,
        isLoading,
        fetchBlogs,
        fetchBlogById,
        createBlog,
        updateBlog,
        deleteBlog,
        publishBlog,
        likeBlog,
        saveDraft,
        getDraftById,
        publishDraft,
        deleteDraft,
        setCurrentDraft,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};
