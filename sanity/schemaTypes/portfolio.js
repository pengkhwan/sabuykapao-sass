// sanity/schemaTypes/portfolio.js
export default {
  name: 'portfolio',
  title: 'Portfolio',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Item Title',
      type: 'string',
    },
    // --- ลบ field slug ทั้งหมดออกจากตรงนี้ ---
    {
      name: 'mainImage',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      // --- เพิ่ม field alt เข้ามาข้างใน image ---
      fields: [
        {
          name: 'alt',
          title: 'Alternative text (คำอธิบายรูปภาพสำหรับ SEO)',
          type: 'string',
          description: 'อธิบายสั้นๆ ว่ารูปภาพนี้คืออะไร เช่น "พวงกุญแจหนังรูปบ้านตอกชื่อ A"',
        }
      ]
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'คำอธิบายสั้นๆ เกี่ยวกับผลงานชิ้นนี้'
    },
  ],
  preview: {
    select: {
      title: 'title',
      media: 'mainImage',
    },
  },
}