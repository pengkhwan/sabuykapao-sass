// src/lib/sanityImageUrl.js
import imageUrlBuilder from '@sanity/image-url';
import { client } from './sanityClient'; // Import client ที่เราสร้างไว้

const builder = imageUrlBuilder(client);

export function urlFor(source) {
  return builder.image(source);
}