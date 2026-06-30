import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';

export const { getPage, getPages, pageTree } = loader({
  baseUrl: '/docs',
  rootDir: 'content',
  source: createMDXSource(),
  languages: ['en', 'it'],
  defaultLanguage: 'en',
});

export const tree = pageTree;
