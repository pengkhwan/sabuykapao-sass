import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'seo',
  title: 'SEO & Social',
  type: 'object',
  fieldsets: [
    { name: 'social', title: 'Social Media / Open Graph' },
    { name: 'advanced', title: 'Advanced Settings' },
  ],
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO Title (Meta Title)',
      type: 'string',
      description: 'ถ้าเว้นว่าง ระบบ/หน้าเพจอาจ fallback เป็น title',
      validation: (Rule) => Rule.max(60).warning('ควรยาวไม่เกิน 60 ตัวอักษร'),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description (Meta Description)',
      type: 'text',
      rows: 3,
      description: 'แนะนำ 155–160 ตัวอักษร',
      validation: (Rule) => Rule.max(160).warning('ควรยาวไม่เกิน 160 ตัวอักษร'),
    }),
    defineField({
      name: 'ogTitle',
      title: 'Social Title (Open Graph)',
      type: 'string',
      fieldset: 'social',
      validation: (Rule) => Rule.max(60).warning('ควรยาวไม่เกิน 60 ตัวอักษร'),
    }),
    defineField({
      name: 'ogDescription',
      title: 'Social Description (Open Graph)',
      type: 'text',
      rows: 3,
      fieldset: 'social',
      validation: (Rule) => Rule.max(160).warning('ควรยาวไม่เกิน 160 ตัวอักษร'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Social Image (Open Graph)',
      type: 'image',
      fieldset: 'social',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alternative text', type: 'string' })
      ]
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide this page from search engines (noindex)',
      type: 'boolean',
      fieldset: 'advanced',
      initialValue: false,
    }),
    defineField({
      name: 'noFollowLinks',
      title: 'Do not follow links on this page (nofollow)',
      type: 'boolean',
      fieldset: 'advanced',
      initialValue: false,
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      fieldset: 'advanced',
      description: 'URL ที่เป็น canonical version ของหน้านี้ (สำหรับจัดการ duplicate content)',
    }),
    defineField({
      name: 'twitterCard',
      title: 'Twitter Card Type',
      type: 'string',
      fieldset: 'social',
      options: {
        list: [
          { title: 'Summary', value: 'summary' },
          { title: 'Summary Large Image', value: 'summary_large_image' },
          { title: 'App', value: 'app' },
          { title: 'Player', value: 'player' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'summary_large_image',
      description: 'ประเภทของ Twitter Card ที่จะแสดงเมื่อแชร์ลิงก์',
    }),
    defineField({
      name: 'twitterSite',
      title: 'Twitter Site (@username)',
      type: 'string',
      fieldset: 'social',
      description: 'Twitter username ของเว็บไซต์ (เช่น @sabuykapao)',
      validation: (Rule) => Rule.regex(/^@?[a-zA-Z0-9_]+$/, {
        name: 'twitter username',
        invert: false,
      }).warning('กรุณาใส่ Twitter username ที่ถูกต้อง (เช่น @sabuykapao)'),
    }),
  ],
})
