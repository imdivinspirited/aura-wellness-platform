import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useChatbotStore } from '@/stores/chatbotStore';
import { cn } from '@/lib/utils';

interface ChatTriggerProps {
  variant?: 'button' | 'link';
  className?: string;
  children?: React.ReactNode;
}

export function ChatTrigger({ variant = 'button', className, children }: ChatTriggerProps) {
  const setChatOpen = useChatbotStore((s) => s.setOpen);

  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className={cn('inline-flex items-center gap-2 text-primary hover:underline', className)}
        aria-label="Open chat"
      >
        {children ?? (
          <>
            <MessageCircle className="h-4 w-4" />
            Need help? Chat with us
          </>
        )}
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn('gap-2', className)}
      onClick={() => setChatOpen(true)}
      aria-label="Open chat"
    >
      <MessageCircle className="h-4 w-4" />
      {children ?? 'Chat with us'}
    </Button>
  );
}
