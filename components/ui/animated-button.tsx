import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, variant = 'default', size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'py-1 px-3 text-xs',
      md: 'py-2 px-4 text-sm',
      lg: 'py-3 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px font-semibold leading-6 text-white inline-block',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      >
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </span>
        <div
          className={cn(
            'relative flex space-x-2 items-center justify-center z-10 rounded-full bg-zinc-950 ring-1 ring-white/10',
            sizeClasses[size]
          )}
        >
          <span>{children}</span>
        </div>
        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-white/0 via-white/90 to-white/0 transition-opacity duration-500 group-hover:opacity-40" />
      </button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
