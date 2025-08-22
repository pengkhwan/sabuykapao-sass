// sanity/import-script.js

require('dotenv').config();
const slugify = require('slugify');
const fs = require('fs');
const xml2js = require('xml2js');
const { JSDOM } = require('jsdom');
const { createClient } = require('@sanity/client');
const fetch = require('node-fetch');

const sanityClient = createClient({
  projectId: 'ik92gukm',
  dataset: 'production',
  apiVersion: '2024-08-22',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const outputFilename = 'import-data.ndjson';
const xmlFilePath = './wordpress.xml';

async function uploadImage(url) {
  try {
    console.log(`   > 📥 กำลังดาวน์โหลดรูปภาพจาก: ${url}`);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const imageBuffer = await response.buffer();
    
    console.log(`   > 📤 กำลังอัปโหลดรูปภาพไปยัง Sanity...`);
    const asset = await sanityClient.assets.upload('image', imageBuffer, {
      filename: url.split('/').pop(),
    });
    console.log(`   > ✅ อัปโหลดสำเร็จ, Asset ID: ${asset._id}`);
    return asset;
  } catch (error) {
    console.error(`   > ❌ เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ ${url}:`, error.message);
    return null;
  }
}

async function htmlToPortableText(html) {
  if (!html) return [];
  
  const dom = new JSDOM(html);
  const body = dom.window.document.body;
  const blocks = [];

  for (const node of Array.from(body.childNodes)) {
    if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE'].includes(node.nodeName)) {
      if (node.textContent.trim() === '') continue;
      const style = node.nodeName.startsWith('H') ? node.nodeName.toLowerCase() : 'normal';
      blocks.push({
        _type: 'block',
        style: style === 'BLOCKQUOTE' ? 'blockquote' : style,
        children: [{ _type: 'span', text: node.textContent.trim() }]
      });
    }
    
    if (node.nodeName === 'FIGURE' && node.querySelector('img')) {
      const img = node.querySelector('img');
      const imageUrl = img.getAttribute('src');

      if (!imageUrl || !imageUrl.startsWith('http')) {
        console.warn(`   > ⚠️ ข้ามรูปภาพเนื่องจาก URL ไม่ถูกต้อง: "${imageUrl}"`);
        continue;
      }
      
      const imageAsset = await uploadImage(imageUrl);
      if (!imageAsset) continue;

      const altText = img.getAttribute('alt') || '';
      const figcaption = node.querySelector('figcaption');
      const captionText = figcaption ? figcaption.textContent.trim() : undefined;

      blocks.push({
        _type: 'image',
        asset: { _type: 'reference', _ref: imageAsset._id },
        alt: altText,
        caption: captionText,
      });
    }
  }
  return blocks;
}

async function prepareData() {
  try {
    console.log(`>> กำลังตรวจสอบไฟล์ที่ path: '${xmlFilePath}'...`);
    if (!fs.existsSync(xmlFilePath)) {
      console.error(`❌ ไม่พบไฟล์! กรุณาตรวจสอบว่าไฟล์ 'wordpress.xml' อยู่ในโฟลเดอร์เดียวกับสคริปต์`);
      return;
    }
    console.log(`✅ พบไฟล์ '${xmlFilePath}'`);

    if (fs.existsSync(outputFilename)) fs.unlinkSync(outputFilename);
    const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);
    const items = result.rss.channel[0].item;
    console.log(`พบ ${items.length} รายการ, กำลังคัดกรองบทความ...`);

    for (const item of items) {
      if (item['wp:post_type'][0] !== 'post') continue;
      
      const title = item.title && item.title[0] ? item.title[0] : 'No Title';
      const slug = item['wp:post_name'][0];
      const postId = item['wp:post_id'][0];

      if (!postId) {
        console.warn(`   > ⚠️ ข้ามบทความ "${title}" เนื่องจากไม่พบ Post ID`);
        continue;
      }
      
      console.log(`\n--- กำลังประมวลผล: "${title}" (ID: ${postId}) ---`);
      
      let publishedDate = new Date(item.pubDate ? item.pubDate[0] : null);
      if (isNaN(publishedDate.getTime())) publishedDate = new Date();

      const contentHtml = item['content:encoded'][0];
      const body = await htmlToPortableText(contentHtml);

      const doc = {
        _id: `imported-wp-${postId}`,
        _type: 'article',
        title: title,
        slug: { _type: 'slug', current: slug },
        publishedAt: publishedDate.toISOString(),
        body: body,
      };

      fs.appendFileSync(outputFilename, JSON.stringify(doc) + '\n');
    }
    console.log(`\n🎉 เตรียมข้อมูลสำเร็จ! -> ${outputFilename}`);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดร้ายแรง:', error);
  }
}

prepareData();