// sanity/schemaTypes/product.js
export default {
  name: 'product',
  title: 'Products',
  type: 'document',
  fieldsets: [
    { name: 'salesChannels', title: 'ช่องทางการขาย' },
    { name: 'media', title: 'สื่อเพิ่มเติม' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    {
      name: 'sku',
      title: 'SKU (รหัสสินค้า)',
      type: 'string',
      description: 'ใช้สำหรับค้นหาภายใน (ไม่ต้องแสดงหน้าเว็บ)',
      hidden: false, // 👈 ถ้าอยากให้ใช้แค่ค้นหา เปลี่ยนเป็น true
      validation: (Rule) => Rule.required().error('กรุณาใส่รหัสสินค้า (SKU)'),
    },
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required().error('กรุณาใส่ชื่อสินค้า'),
    },
    { name: 'shortDescription', title: 'Short Description', type: 'text', rows: 3 },
    {
      name: 'features',
      title: 'Product Features',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'ใส่จุดเด่นของสินค้าแต่ละข้อ เช่น ผลิตจากหนังแท้ 100%',
    },
    {
      name: 'slug',
      title: 'Slug (EN only)',
      type: 'slug',
      options: { source: 'name', maxLength: 60 },
      validation: (Rule) =>
        Rule.required()
          .custom((slug) => {
            if (!slug || !slug.current) return 'ต้องมี slug'
            const ok = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.current)
            return ok || 'slug ต้องเป็นอังกฤษล้วน a–z, 0–9 และขีดกลาง (-) เท่านั้น'
          }),
    },
    {
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required().error('กรุณาอัปโหลดรูปภาพหลัก'),
      fields: [
        {
          name: 'alt',
          title: 'Alternative text (คำอธิบายรูปภาพสำหรับ SEO)',
          type: 'string',
          description: 'สำคัญมาก: อธิบายสั้นๆ ว่ารูปนี้คืออะไร',
          validation: (Rule) => Rule.required().error('กรุณาใส่ Alt Text'),
        },
      ],
    },
    {
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [
        {
          name: 'galleryImage',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
              description: 'อธิบายรูปภาพนี้ (จำเป็นสำหรับ SEO)',
              options: { isHighlighted: true },
              validation: (Rule) => Rule.required().error('กรุณาใส่ Alt Text'),
            },
          ],
          preview: {
            select: { alt: 'alt', media: 'asset' },
            prepare(selection) {
              const { alt, media } = selection
              return {
                title: alt || '(กรุณาใส่ Alt Text)',
                media,
              }
            },
          },
        },
      ],
    },
    { name: 'price', title: 'Price', type: 'number' },
    { name: 'youtubeUrl', title: 'ลิงก์วิดีโอ YouTube', type: 'url', fieldset: 'media' },
    { name: 'shopeeUrl', title: 'ลิงก์ Shopee', type: 'url', fieldset: 'salesChannels' },
    { name: 'lazadaUrl', title: 'ลิงก์ Lazada', type: 'url', fieldset: 'salesChannels' },
    { name: 'tiktokUrl', title: 'ลิงก์ TikTok Shop', type: 'url', fieldset: 'salesChannels' },
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
      description: 'สินค้าชิ้นนี้อยู่ในหมวดหมู่ไหน (เลือกได้มากกว่า 1)',
      validation: (Rule) => Rule.required().min(1).error('ต้องเลือกอย่างน้อย 1 หมวดหมู่'),
    },
    {
      name: 'seo',
      title: 'SEO & Social Settings',
      type: 'seo',
      validation: (Rule) => Rule.required().error('กรุณากรอกข้อมูล SEO'),
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'sku',
      media: 'image',
    },
  },
}
