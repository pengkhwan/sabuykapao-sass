const fs = require('fs');
const xml2js = require('xml2js');
const { JSDOM } = require('jsdom');

const outputFilename = 'import-data.ndjson';
const xmlFilePath = './wordpress.xml';

// ฟังก์ชันสำหรับแปลง HTML เป็น Portable Text (รองรับรูปภาพ)
function htmlToPortableText(html) {
  if (!html) return [];
  
  const dom = new JSDOM(html);
  const body = dom.window.document.body;
  const blocks = [];

  body.childNodes.forEach(node => {
    if (node.nodeName === 'P' || node.nodeName.match(/^H[1-6]$/) || node.nodeName === 'BLOCKQUOTE') {
      if (node.textContent.trim() === '') return;
      const style = node.nodeName.match(/^H[1-6]$/) ? node.nodeName.toLowerCase() : 'normal';
      blocks.push({
        _type: 'block',
        style: style === 'BLOCKQUOTE' ? 'blockquote' : style,
        children: [{ _type: 'span', text: node.textContent.trim() }]
      });
    }
    
    if (node.nodeName === 'FIGURE' && node.querySelector('img')) {
      const img = node.querySelector('img');
      const imageUrl = img.getAttribute('src');
      const altText = img.getAttribute('alt') || '';
      
      blocks.push({
        _type: 'image',
        asset: {
          _type: 'sanity.imageAsset',
          _sanityAsset: `image@${imageUrl}`
        },
        alt: altText
      });
      
      const figcaption = node.querySelector('figcaption');
      if (figcaption && figcaption.textContent.trim() !== '') {
         blocks.push({
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', text: figcaption.textContent.trim() }]
        });
      }
    }
  });
  return blocks;
}

async function prepareData() {
  try {
    console.log(`กำลังล้างไฟล์เก่า...`);
    if (fs.existsSync(outputFilename)) fs.unlinkSync(outputFilename);

    console.log('กำลังอ่านไฟล์ XML...');
    const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');

    console.log('กำลังแปลง XML เป็น JSON...');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);
    
    const items = result.rss.channel[0].item;
    console.log(`พบ ${items.length} รายการ, กำลังคัดกรองบทความ...`);

    let articleCount = 0;
    for (const item of items) {
      if (item['wp:post_type'][0] !== 'post') continue;
      
      // เพิ่มการตรวจสอบ Title ที่อาจจะว่างเปล่า
      const title = item.title && item.title[0] ? item.title[0] : 'No Title';
      const slug = item['wp:post_name'][0];
      
      console.log(`กำลังประมวลผล: "${title}"`);
      
      // --- เพิ่มโค้ดสำหรับจัดการวันที่ที่อาจจะไม่มีอยู่ ---
      let publishedDate = new Date(item.pubDate ? item.pubDate[0] : null);
      if (isNaN(publishedDate.getTime())) {
        console.warn(`   > ‼️ คำเตือน: ไม่พบวันที่เผยแพร่ที่ถูกต้องสำหรับ "${title}", ใช้เวลาปัจจุบันแทน`);
        publishedDate = new Date();
      }
      // ---------------------------------------------------

      const contentHtml = item['content:encoded'][0];
      const body = htmlToPortableText(contentHtml);

      const doc = {
        _type: 'article',
        title: title,
        slug: { _type: 'slug', current: slug },
        publishedAt: publishedDate.toISOString(),
        body: body,
      };

      fs.appendFileSync(outputFilename, JSON.stringify(doc) + '\n');
      articleCount++;
    }

    console.log(`\n🎉 เตรียมข้อมูลบทความ ${articleCount} ชิ้น สำเร็จ! -> ${outputFilename}`);
  } catch (error) {
    console.error('เกิดข้อผิดพลาด:', error);
  }
}

prepareData();