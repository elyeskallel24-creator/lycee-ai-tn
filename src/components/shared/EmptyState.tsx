import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ emoji = '✨', title, description, action }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bento-card text-center py-12 px-6"
  >
    <div className="text-5xl mb-4">{emoji}</div>
    <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
    {description && <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </motion.div>
);
