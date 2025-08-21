// src/sanity.js
import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'ik92gukm',
  dataset: 'production',
  apiVersion: '2025-08-19',
  useCdn: true,
});