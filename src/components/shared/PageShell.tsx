import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export const PageShell = ({ title, subtitle, actions, children }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="container py-6 md:py-10 max-w-6xl"
  >
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions}
    </div>
    {children}
  </motion.div>
);
