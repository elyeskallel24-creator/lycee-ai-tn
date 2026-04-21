import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as pdfjs from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
(pdfjs as any).GlobalWorkerOptions.workerSrc = workerSrc;

export const PdfThumb = ({ filePath, className = '' }: { filePath: string; className?: string }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.storage.from('ressources').createSignedUrl(filePath, 60 * 5);
        if (!data?.signedUrl || cancelled) return;
        const pdf = await (pdfjs as any).getDocument(data.signedUrl).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = ref.current;
        if (!canvas || cancelled) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      } catch (e) { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [filePath]);
  return <canvas ref={ref} className={className} />;
};
