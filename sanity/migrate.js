// sanity/migrate.js
import {createClient} from '@sanity/client'
import 'dotenv/config' // เพื่อให้สคริปต์รู้จัก Token จาก .env

// ตั้งค่า Client ให้เหมือนกับสคริปต์ import
const client = createClient({
  projectId: process.env.SANITY_STUDIO_API_PROJECT_ID || 'ik92gukm',
  dataset: process.env.SANITY_STUDIO_API_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-08-22',
  useCdn: false,
})

// 1. ค้นหาเอกสาร Category ทั้งหมดที่มีฟิลด์ 'name' แต่ยังไม่มี 'title'
const docsToMigrate = await client.fetch(`*[_type == "category" && defined(name) && !defined(title)]`)

if (!docsToMigrate || docsToMigrate.length === 0) {
  console.log('ไม่พบเอกสารที่ต้องย้ายข้อมูล')
  process.exit()
}

console.log(`พบ ${docsToMigrate.length} เอกสารที่ต้องย้ายข้อมูล...`)

// 2. สร้าง transaction เพื่อแก้ไขเอกสารทั้งหมดในครั้งเดียว
const transaction = client.transaction()
docsToMigrate.forEach(doc => {
  console.log(`  - กำลังย้ายข้อมูลสำหรับ: ${doc.name}`)
  transaction.patch(doc._id, {
    set: { title: doc.name }, // 3. สร้างฟิลด์ 'title' ใหม่โดยใช้ค่าจาก 'name'
    unset: ['name']           // 4. ลบฟิลด์ 'name' เก่าทิ้ง
  })
})

// 5. ส่ง transaction ไปยัง Sanity
await transaction.commit()

console.log(`\n✅ ย้ายข้อมูลสำเร็จ ${docsToMigrate.length} รายการ!`)