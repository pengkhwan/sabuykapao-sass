// sanity/schemaTypes/article.js
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'article',
  title: 'Articles',
  type: 'document',
  
  groups: [
    { name: 'content', title: 'เนื้อหาหลัก', default: true },
    { name: 'seo', title: 'SEO' },
  ],

  fields: [
    // --- ฟิลด์ในแท็บ "เนื้อหาหลัก" ---
    defineField({
      name: 'title',
      title: 'Article Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),

    // --- จุดที่แก้ไข ---
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      description: 'รูปภาพหลักของบทความ (ภาพปก)',
      options: {
        hotspot: true,
      },
      // เพิ่ม fields เข้าไปเพื่อให้มีช่อง alt
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text (คำอธิบายรูปภาพ)',
          type: 'string',
          description: 'ข้อความอธิบายรูปภาพสำหรับ SEO และผู้พิการทางสายตา',
          validation: (Rule) => Rule.required(), // บังคับกรอก alt text
        })
      ],
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    // --------------------

    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      description: 'เนื้อหาย่อสำหรับแสดงในหน้าแรกหรือการ์ดบทความ',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      options: { layout: 'grid' },
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', title: 'Alternative text', type: 'string' }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
          ],
        },
      ],
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),

    // --- ฟิลด์ในแท็บ "SEO" ---
    defineField({
      name: 'focusKeyword',
      title: 'Focus Keyword',
      type: 'string',
      description: 'คำค้นหาหลักของบทความนี้ (จาก Rank Math)',
      group: 'seo',
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'seo',
      group: 'seo',
      validation: (Rule) => Rule.required(),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'featuredImage',
    },
  },
})