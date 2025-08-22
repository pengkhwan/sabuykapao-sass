// sanity/schemaTypes/category.js
import {defineField, defineType} from 'sanity'

export default defineType({
  // --- ใช้ defineType ครอบ schema ทั้งหมด ---
  name: 'category',
  title: 'Categories',
  type: 'document',
  fields: [
    // --- ใช้ defineField สำหรับแต่ละฟิลด์ ---
    defineField({
      name: 'title', // <-- ปรับจาก 'name' เป็น 'title' ตามมาตรฐาน
      title: 'Category Name',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title', // <-- อัปเดต source ให้ตรงกับ field ใหม่
        maxLength: 96,
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'คำอธิบายสั้นๆ เกี่ยวกับหมวดหมู่นี้ (สำคัญต่อ SEO และผู้ใช้งาน)',
      rows: 4,
    }),
    defineField({
      name: 'image',
      title: 'Category Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
  ],
})