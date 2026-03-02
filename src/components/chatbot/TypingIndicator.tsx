import { cn } from '@/lib/utils';

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-2', className)}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/10">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#FF6B35]">
          <path d="M12 2c-.6 0-1.2.3-1.5.8L8.5 8.5C7.5 9.5 6 10 4.5 10c-1 0-1.5.5-1.5 1.5S3.5 13 4.5 13c2.5 0 4.5-1 6-2.5 1.5 1.5 3.5 2.5 6 2.5 1 0 1.5-.5 1.5-1.5s-.5-1.5-1.5-1.5c-1.5 0-3-.5-4-1.5l-2-5.7C10.2 2.3 11.4 2 12 2z" />
        </svg>
      </div>
      <div className="rounded-[20px] rounded-bl-[4px] bg-[#FAFAF8] px-4 py-3 shadow dark:bg-[#2D2D44]">
        <div className="flex gap-1.5">
          <span
            className="h-2 w-2 rounded-full bg-[#FF6B35] animate-bounce"
            style={{ animationDelay: '0ms' }}
          />
          <span
            className="h-2 w-2 rounded-full bg-[#FF6B35] animate-bounce"
            style={{ animationDelay: '150ms' }}
          />
          <span
            className="h-2 w-2 rounded-full bg-[#FF6B35] animate-bounce"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
