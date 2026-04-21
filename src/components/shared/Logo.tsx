import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  showText?: boolean;
  to?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className, showText = true, to = '/', size = 'md' }: Props) => {
  const dims = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' }[size];
  const text = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' }[size];
  const content = (
    <div className={cn('flex items-center gap-2', className)}>
      <img src="/logo.png" alt="LyceeAI" className={cn(dims, 'object-contain drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]')} />
      {showText && (
        <span className={cn('font-display font-bold tracking-tight', text)}>
          Lycee<span className="gradient-text">AI</span>
        </span>
      )}
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
};
