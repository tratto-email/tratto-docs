import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { tree } from '@/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={tree} nav={{ title: 'Tratto Docs' }}>
      {children}
    </DocsLayout>
  );
}
