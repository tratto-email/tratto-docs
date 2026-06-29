import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { tree } from '@/source';
import type { ReactNode } from 'react';

export default function APIReferenceLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={tree} nav={{ title: 'API Reference' }}>
      {children}
    </DocsLayout>
  );
}
