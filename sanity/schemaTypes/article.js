// sanity/schemaTypes/article.js
import {defineField, defineType} from 'sanity'

/**
 * หมายเหตุ:
 * - body: Portable Text รองรับ inline image (+ alt, caption)
 * - slug: บังคับอังกฤษเท่านั้น + slugify ตามกติกา (ตัดความยาว ~60)
 * - excerpt: ใช้เป็น meta/preview แนะนำไม่เกิน 160 ตัวอักษร
 * - references: list ของ {label, url}
 * - toc: list ของหัวข้อ {label, anchorId} (แก้ไขได้เอง หรือ generate ภายนอก)
 * - faq: list Q&A สำหรับ FAQ schema
 * - featuredImage: มี alt + caption
 * - youtubeUrl: optional พร้อมตรวจรูปแบบ URL พื้นฐาน
 * - seo: ใช้ object จาก seo.js ของคุณ (มีอยู่แล้ว)
 */

const slugifyEN = (input) =>
  (input || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)

export default defineType({
  name: 'article',
  title: 'Articles',
  type: 'document',

  groups: [
    { name: 'content', title: 'เนื้อหาหลัก', default: true },
    { name: 'media', title: 'สื่อ' },
    { name: 'extras', title: 'เสริม (TOC / FAQ / References)' },
    { name: 'seo', title: 'SEO' },
  ],

  fields: [
    // --- เนื้อหาหลัก ---
    defineField({
      name: 'title',
      title: 'Article Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().min(3).warning('ควรยาวอย่างน้อย 3 ตัวอักษร'),
    }),

    defineField({
      name: 'slug',
      title: 'Slug (English only)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 60,
        slugify: slugifyEN,
      },
      group: 'content',
      validation: (Rule) =>
        Rule.required()
          .custom((slug) => {
            if (!slug || !slug.current) return 'ต้องมี slug'
            const ok = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.current)
            return ok || 'slug ต้องเป็นอังกฤษล้วน a–z, 0–9 และขีดกลาง (-) เท่านั้น'
          }),
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      description: 'เนื้อหาย่อสำหรับการ์ดบทความ/SEO (แนะนำ ≤ 160 ตัวอักษร)',
      group: 'content',
      validation: (Rule) =>
        Rule.required()
          .min(30).warning('สั้นไป ควรมากกว่า ~30 ตัวอักษร')
          .max(220).warning('ยาวเกินไป ควรไม่เกิน ~160–180 สำหรับ SEO'),
    }),

    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
              validation: (Rule) =>
                Rule.required().min(3).warning('ควรใส่ alt เพื่อ SEO และการเข้าถึง'),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
        },
      ],
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),

    // --- สื่อ (ภาพ/วิดีโอ) ---
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      description: 'รูปภาพหลักของบทความ (ภาพปก + ใช้เป็น OG ได้)',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text (คำอธิบายรูปภาพ)',
          type: 'string',
          description: 'สำหรับ SEO และการเข้าถึง',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
        }),
      ],
      group: 'media',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL (optional)',
      type: 'url',
      description: 'ลิงก์วิดีโอ YouTube ที่เกี่ยวข้อง (ถ้ามี)',
      group: 'media',
      validation: (Rule) =>
        Rule.uri({
          allowRelative: false,
          scheme: ['http', 'https'],
        }).warning('ตรวจรูปแบบ URL ให้ถูกต้อง'),
    }),

    // --- เสริม (TOC / FAQ / References) ---
    defineField({
      name: 'toc',
      title: 'Table of Contents',
      group: 'extras',
      type: 'array',
      of: [
        defineField({
          name: 'tocItem',
          title: 'TOC Item',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string' }),
            defineField({
              name: 'anchorId',
              title: 'Anchor ID',
              type: 'string',
              description: 'เช่น h2-introduction (สำหรับลิงก์ข้ามในหน้า)',
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'anchorId' },
          },
        }),
      ],
    }),

    defineField({
      name: 'faq',
      title: 'FAQ (Q&A)',
      group: 'extras',
      type: 'array',
      of: [
        defineField({
          name: 'qa',
          title: 'Q&A',
          type: 'object',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string' }),
            defineField({ name: 'answer', title: 'Answer', type: 'text' }),
          ],
          preview: {
            select: { title: 'question', subtitle: 'answer' },
          },
        }),
      ],
    }),

    defineField({
      name: 'references',
      title: 'External References',
      group: 'extras',
      type: 'array',
      of: [
        defineField({
          name: 'refItem',
          title: 'Reference',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Text/Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) =>
                Rule.required().uri({
                  allowRelative: false,
                  scheme: ['http', 'https'],
                }),
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'url' },
          },
        }),
      ],
    }),

    // --- AI Preview (สำหรับผลลัพธ์จาก Inngest/Gemini) ---
    defineField({
      name: 'aiPreview',
      title: 'AI Preview',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      group: 'extras',
      fields: [
        defineField({ name: 'event', title: 'Event', type: 'string', readOnly: true }),
        defineField({ name: 'createdAt', title: 'Created At', type: 'datetime', readOnly: true }),
        defineField({
          name: 'meta',
          title: 'Meta',
          type: 'object',
          readOnly: true,
          fields: [defineField({ name: 'userId', title: 'User ID', type: 'string' })],
        }),
        defineField({
          name: 'result',
          title: 'Result',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({
              name: 'toc',
              title: 'Generated TOC',
              type: 'array',
              of: [
                defineField({
                  type: 'object',
                  fields: [
                    defineField({ name: 'text', title: 'Text', type: 'string' }),
                    defineField({ name: 'anchor', title: 'Anchor', type: 'string' }),
                  ],
                  preview: { select: { title: 'text', subtitle: 'anchor' } },
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    // --- SEO ---
    defineField({
      name: 'focusKeyword',
      title: 'Focus Keyword',
      type: 'string',
      description: 'คำค้นหาหลักของบทความนี้',
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
      subtitle: 'excerpt',
    },
  },
})
