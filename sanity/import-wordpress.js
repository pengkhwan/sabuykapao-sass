// Step 1: Import Libraries
const { createClient } = require('@sanity/client');
const fs = require('fs');
const xml2js = require('xml2js');
const { htmlToPortableText } = require('./html-converter.js');

// ####################################################
// ### CONFIGURATION - อัปเดต apiVersion ###
// ####################################################
const client = createClient({
  projectId: '1k92gukm',
  dataset: 'production',
  token: 'skbEmPdeOtBv9FvqLTE727ybLIi5apRfkwe72PMU9l2sf0MAcP8BlrcfX8Df291S1wHweQvVRLy5gF4D2Y9JUyQRbwnrFdXiGlu1DJTvrG73oxTCwNGMCSkS5sPSYRAet3mMneDv87ojppHc5PhCaFLeNNOVY2G9qjTE4UohMOVMcqNDKZrW',
  useCdn: false,
  apiVersion: '2025-08-22', // <--- แก้ไขเป็นวันที่ปัจจุบัน
});
// ####################################################

// Path to your WordPress export file
const xmlFilePath = './wordpress.xml';

// Main function to run the import
async function importData() {
  try {
    console.log('กำลังอ่านไฟล์ XML...');
    const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');

    console.log('กำลังแปลง XML เป็น JSON...');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);

    const posts = result.rss.channel[0].item;
    console.log(`พบ ${posts.length} บทความ เตรียมนำเข้า...`);

    for (const post of posts) {
      if (post['wp:post_type'][0] !== 'post') {
        continue;
      }

      const title = post.title[0];
      const slug = post['wp:post_name'][0];
      const publishedDate = new Date(post.pubDate[0]);
      
      console.log(`กำลังประมวลผล: "${title}"`);

      let body = [];
      try {
        const contentHtml = post['content:encoded'] ? post['content:encoded'][0] : '';
        if (contentHtml) {
          body = htmlToPortableText(contentHtml);
        }
      } catch (e) {
        console.warn(`‼️ คำเตือน: ไม่สามารถแปลงเนื้อหาของบทความ "${title}" ได้ จะนำเข้าเฉพาะหัวข้อ`);
        console.warn(`   > Error: ${e.message}`);
      }

      const doc = {
        _type: 'article',
        title: title,
        slug: {
          _type: 'slug',
          current: slug,
        },
        publishedAt: publishedDate.toISOString(),
        body: body,
      };

      await client.create(doc);
      console.log(`✅ นำเข้า "${title}" สำเร็จ!`);
    }

    console.log('\n🎉 การนำเข้าข้อมูลทั้งหมดเสร็จสมบูรณ์!');

  } catch (error) {
    console.error('เกิดข้อผิดพลาดร้ายแรงระหว่างการนำเข้า:', error);
  }
}

// Run the import
importData();