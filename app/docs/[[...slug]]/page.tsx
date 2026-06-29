import { notFound } from 'next/navigation';
import { getPage, getPages } from '@/source';
import { MDXContent } from 'fumadocs-mdx/components';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return getPages().map((page) => ({
    slug: page.slugs,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  const page = getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const page = getPage(params.slug);
  if (!page) notFound();

  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>{page.data.title}</h1>
      <MDXContent code={page.data.body} />
    </div>
  );
}
