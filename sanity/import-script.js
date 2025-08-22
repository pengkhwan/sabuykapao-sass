// sanity/import-script.js (Final Version - Text Only with SEO)

require('dotenv').config();
const slugify = require('slugify');
const fs = require('fs');
const xml2js = require('xml2js');
const { JSDOM } = require('jsdom');
const { createClient } = require('@sanity/client');

const sanityClient = createClient({
  projectId: process.env.SANITY_STUDIO_API_PROJECT_ID || 'ik92gukm',
  dataset: process.env.SANITY_STUDIO_API_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-08-22',
  useCdn: false,
});

const outputFilename = 'import-data.ndjson';
const xmlFilePath = './wordpress.xml';

// --- ลบฟังก์ชัน uploadImage และแก้ไข htmlToPortableText ---
async function htmlToPortableText(html) {
  if (!html) return [];
  const dom = new JSDOM(html);
  const body = dom.window.document.body;
  const blocks = [];

  for (const node of Array.from(body.childNodes)) {
    if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'UL', 'OL', 'LI'].includes(node.nodeName)) {
       if (node.textContent.trim() === '') continue;
       // หมายเหตุ: การแปลง list (UL, OL) แบบง่ายๆ อาจจะไม่สมบูรณ์ 100%
       const style = node.nodeName.startsWith('H') ? node.nodeName.toLowerCase() : 'normal';
       blocks.push({
         _type: 'block',
         style: style,
         children: [{ _type: 'span', text: node.textContent.trim() }]
       });
    }
    // เราไม่ประมวลผล FIGURE หรือ IMG อีกต่อไป
  }
  return blocks;
}

async function prepareData() {
  try {
    if (fs.existsSync(outputFilename)) fs.unlinkSync(outputFilename);
    const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);
    const items = result.rss.channel[0].item;
    console.log(`พบ ${items.length} รายการ, กำลังคัดกรองบทความ...`);

    for (const item of items) {
      if (item['wp:post_type'][0] !== 'post') continue;
      
      const title = item.title && item.title[0] ? item.title[0] : 'No Title';
      const slug = item['wp:post_name'][0] || '';
      const postId = item['wp:post_id'][0];

      if (!postId) continue;
      
      console.log(`\n--- กำลังประมวลผล: "${title}" (ID: ${postId}) ---`);

      // --- 1. ดึงข้อมูล Excerpt และแปลง Post Meta ---
      const excerpt = item['excerpt:encoded']?.[0] || '';
      
      const postMeta = {};
      if (item['wp:postmeta']) {
        item['wp:postmeta'].forEach(meta => {
          const key = meta['wp:meta_key'][0];
          const value = meta['wp:meta_value'][0];
          postMeta[key] = value;
        });
      }
      // ---------------------------------------------

      let publishedDate = new Date(item.pubDate ? item.pubDate[0] : null);
      if (isNaN(publishedDate.getTime())) publishedDate = new Date();

      const contentHtml = item['content:encoded'][0];
      const body = await htmlToPortableText(contentHtml);

      const doc = {
        _id: `imported-wp-${postId}`,
        _type: 'article',
        title: title,
        slug: { _type: 'slug', current: `${slug}-${postId}` },
        publishedAt: publishedDate.toISOString(),
        body: body,

        // --- 2. นำข้อมูลใหม่มาใส่ใน Document ---
        excerpt: excerpt,
        focusKeyword: postMeta['rank_math_focus_keyword'] || '',
        seo: {
          _type: 'seo',
          title: postMeta['rank_math_title'] || title,
          description: postMeta['rank_math_description'] || excerpt,
        },
        // --------------------------------------
      };

      fs.appendFileSync(outputFilename, JSON.stringify(doc) + '\n');
    }
    console.log(`\n🎉 เตรียมข้อมูลสำเร็จ! -> ${outputFilename}`);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดร้ายแรง:', error);
  }
}

prepareData();