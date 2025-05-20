
import { useCallback, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBlog } from '@/context/BlogContext';
import { toast } from 'sonner';

// Simple rich text editor using contenteditable
interface RichTextEditorProps {
  initialContent?: string;
  initialTitle?: string;
  draftId?: string;
  autoSave?: boolean;
}

const RichTextEditor = ({
  initialContent = '',
  initialTitle = '',
  draftId,
  autoSave = true
}: RichTextEditorProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { saveDraft, currentDraft } = useBlog();
  
  const contentRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastEditRef = useRef<Date>(new Date());

  // Load initial content if provided through currentDraft
  useEffect(() => {
    if (currentDraft) {
      setTitle(currentDraft.title || '');
      setContent(currentDraft.content || '');
    }
  }, [currentDraft]);

  // Initialize editor content
  useEffect(() => {
    if (contentRef.current && content) {
      contentRef.current.innerHTML = content;
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    if (!autoSave || !isAuthenticated) return;

    const autoSaveInterval = 10000; // 10 seconds of inactivity

    const setupAutoSaveTimer = () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        const now = new Date();
        const timeSinceLastEdit = now.getTime() - lastEditRef.current.getTime();
        
        if (timeSinceLastEdit >= autoSaveInterval) {
          handleAutoSave();
        }
      }, autoSaveInterval);
    };

    // Set up event listeners for user activity
    const handleUserActivity = () => {
      lastEditRef.current = new Date();
      setupAutoSaveTimer();
    };

    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('mousedown', handleUserActivity);

    setupAutoSaveTimer();

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('mousedown', handleUserActivity);
    };
  }, [autoSave, isAuthenticated, title, content]);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (contentRef.current) {
      setContent(contentRef.current.innerHTML);
    }
  }, []);

  // Handle auto-save
  const handleAutoSave = useCallback(async () => {
    if (!isAuthenticated || (!title && !content)) return;
    
    try {
      await saveDraft({
        id: draftId || currentDraft?.id,
        title: title || 'Untitled',
        content: contentRef.current?.innerHTML || content,
      });
      
      setLastSaved(new Date());
      toast.success("Draft auto-saved");
    } catch (error) {
      console.error('Error auto-saving draft:', error);
    }
  }, [isAuthenticated, title, content, draftId, currentDraft, saveDraft]);

  // Handle manual save
  const handleManualSave = async () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to save drafts");
      return;
    }
    
    try {
      await saveDraft({
        id: draftId || currentDraft?.id,
        title: title || 'Untitled',
        content: contentRef.current?.innerHTML || content,
      });
      
      setLastSaved(new Date());
      toast.success("Draft saved successfully");
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error("Failed to save draft");
    }
  };

  // Rich text formatting commands
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  return (
    <div className="flex flex-col w-full">
      <div className="border-b pb-4 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full font-serif text-3xl md:text-4xl font-medium focus:outline-none"
          dir="ltr"
          style={{ unicodeBidi: 'normal' }}
        />
      </div>

      {isEditing && (
        <div className="sticky top-16 z-10 bg-background border rounded-lg mb-6 flex flex-wrap gap-1 p-2">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="p-2 hover:bg-muted rounded"
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="p-2 hover:bg-muted rounded"
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="p-2 hover:bg-muted rounded"
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<h1>')}
            className="p-2 hover:bg-muted rounded"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<h2>')}
            className="p-2 hover:bg-muted rounded"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<p>')}
            className="p-2 hover:bg-muted rounded"
            title="Paragraph"
          >
            P
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="p-2 hover:bg-muted rounded"
            title="Ordered List"
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="p-2 hover:bg-muted rounded"
            title="Unordered List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => execCommand('createLink', prompt('Enter link URL') || '')}
            className="p-2 hover:bg-muted rounded"
            title="Insert Link"
          >
            🔗
          </button>
          <div className="flex-grow"></div>
          <button
            type="button"
            onClick={handleManualSave}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
          >
            Save Draft
          </button>
        </div>
      )}

      <div className="prose prose-lg">
        <div
          ref={contentRef}
          contentEditable={isEditing}
          onInput={handleContentChange}
          className="min-h-[300px] outline-none"
          dir="ltr"
          style={{
            unicodeBidi: 'normal',
            textAlign: 'left',
            writingMode: 'horizontal-tb'
          }}
        />
      </div>

      {lastSaved && (
        <div className="text-sm text-muted-foreground mt-4">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
