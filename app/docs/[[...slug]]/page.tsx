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

  const title = page.data.title;
  const description = page.data.description || 'Tratto Email API Documentation';
  const canonical = params.slug ? `/docs/${params.slug.join('/')}` : '/docs';

  return {
    title: `${title} — Tratto Docs`,
    description,
    canonical,
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      images: [
        {
          url: `/docs/${params.slug?.join('/') || 'index'}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    alternates: {
      languages: {
        en: `/docs/${params.slug?.join('/') || ''}`,
        it: `/docs/it/${params.slug?.join('/') || ''}`,
        'x-default': `/docs/${params.slug?.join('/') || ''}`,
      },
    },
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
