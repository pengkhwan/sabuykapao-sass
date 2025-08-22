// sanity/inspect-xml.js
const fs = require('fs');
const xml2js = require('xml2js');

const xmlFilePath = './wordpress.xml';

async function inspectData() {
    try {
        console.log("กำลังอ่านและวิเคราะห์ไฟล์ xml...");
        const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');
        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(xmlData);

        const items = result.rss.channel[0].item;

        // หา item แรกที่เป็น 'post' จริงๆ
        const firstPost = items.find(item => item['wp:post_type'][0] === 'post');

        if (!firstPost) {
            console.error("ไม่พบบทความ (post) ในไฟล์ XML ของคุณ");
            return;
        }

        console.log("\n✅ พบข้อมูลตัวอย่างจากบทความแรก! นี่คือโครงสร้างข้อมูลทั้งหมดที่มี:");
        // แสดงผลข้อมูลทั้งหมดของ post แรกออกมาในรูปแบบ JSON ที่อ่านง่าย
        console.log(JSON.stringify(firstPost, null, 2));

    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error);
    }
}

inspectData();