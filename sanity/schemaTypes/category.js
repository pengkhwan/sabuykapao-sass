// sanity/schemaTypes/category.js

export default {
  name: 'category',
  title: 'Categories',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Category Name',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    },
    // <-- เพิ่ม field นี้เข้ามาครับ -->
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'คำอธิบายสั้นๆ เกี่ยวกับหมวดหมู่นี้ (สำคัญต่อ SEO และผู้ใช้งาน)',
      rows: 4, // กำหนดความสูงของกล่องข้อความใน Studio
    },
    {
      name: 'image',
      title: 'Category Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
}