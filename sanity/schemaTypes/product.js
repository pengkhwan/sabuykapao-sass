// sanity/schemaTypes/product.js
export default {
  name: 'product',
  title: 'Products',
  type: 'document',
  fieldsets: [
    { name: 'salesChannels', title: 'ช่องทางการขาย' },
    { name: 'media', title: 'สื่อเพิ่มเติม' }
  ],
  fields: [
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
      description: 'ใส่จุดเด่นของสินค้าแต่ละข้อ (เช่น ผลิตจากหนังแท้ 100%) กด Add item เพื่อเพิ่มทีละข้อ'
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required().error('กรุณากด Generate Slug'),
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
          description: 'สำคัญมาก: อธิบายสั้นๆ ว่ารูปภาพนี้คืออะไร',
          validation: (Rule) => Rule.required().error('กรุณาใส่คำอธิบายรูปภาพ (Alt Text)'),
        }
      ]
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
              validation: (Rule) => Rule.required().error('กรุณาใส่คำอธิบายรูปภาพ (Alt Text)'),
            }
          ],
          preview: {
            select: { alt: 'alt', media: 'asset' },
            prepare(selection) {
              const {alt, media} = selection
              return {
                title: alt || '(กรุณาใส่ Alt Text)',
                media: media
              }
            }
          }
        }
      ],
    },
    { name: 'price', title: 'Price', type: 'number' },
    { name: 'youtubeUrl', title: 'ลิงก์วิดีโอ YouTube', type: 'url', fieldset: 'media' },
    { name: 'shopeeUrl', title: 'ลิงก์ Shopee', type: 'url', fieldset: 'salesChannels' },
    { name: 'lazadaUrl', title: 'ลิงก์ Lazada', type: 'url', fieldset: 'salesChannels' },
    { name: 'tiktokUrl', title: 'ลิงก์ TikTok Shop', type: 'url', fieldset: 'salesChannels' },
    { name: 'description', title: 'Description', type: 'array', of: [ { type: 'block' } ] },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [ { type: 'reference', to: [{type: 'category'}] } ],
      description: 'สินค้าชิ้นนี้อยู่ในหมวดหมู่ไหน (เลือกได้มากกว่า 1)',
      validation: (Rule) => Rule.required().min(1).error('ต้องเลือกอย่างน้อย 1 หมวดหมู่'),
    },
    {
      name: 'seo',
      title: 'SEO & Social Settings',
      type: 'seo',
      // --- เพิ่ม: Validation Rule สำหรับ SEO object ---
      validation: (Rule) => Rule.required().error('กรุณากรอกข้อมูล SEO'),
    }
  ],
}