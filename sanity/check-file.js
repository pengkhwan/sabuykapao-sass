// check-file.js
const fs = require('fs');
const path = require('path');

console.log("--- เริ่มการทำงานสคริปต์ตรวจสอบไฟล์ ---");

const expectedFile = './wordpress.xml';
const absolutePath = path.resolve(expectedFile);

console.log(`\nกำลังค้นหาไฟล์ที่ Path เต็มๆ คือ:\n${absolutePath}\n`);

if (fs.existsSync(expectedFile)) {
    console.log("✅ สำเร็จ: พบไฟล์ 'wordpress.xml' ในโฟลเดอร์ปัจจุบัน");
} else {
    console.error("❌ ผิดพลาด: ไม่พบไฟล์ 'wordpress.xml' ในโฟลเดอร์ปัจจุบัน");
    console.error("กรุณาตรวจสอบว่าคุณรันคำสั่ง node ในโฟลเดอร์ที่ถูกต้อง และชื่อไฟล์สะกดถูก 100%");
}

console.log("\n--- สคริปต์ตรวจสอบไฟล์ทำงานเสร็จสิ้น ---");