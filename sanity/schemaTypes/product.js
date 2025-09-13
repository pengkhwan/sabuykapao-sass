export default {
  name: 'product',
  title: 'Products',
  type: 'document',
  fields: [
    { 
      name: 'sku', 
      title: 'SKU (Stock Keeping Unit)', 
      type: 'string',
      description: 'รหัสสินค้าที่ใช้ในการจัดการสต็อกและอ้างอิง',
      validation: (Rule) => Rule.required().min(3).max(20).warning('SKU ควรยาว 3-20 ตัวอักษร'),
      placeholder: 'เช่น BAG-001, WALLET-2024'
    },
    { name: 'name', title: 'Name', type: 'string' },
    { name: 'shortDescription', title: 'Short Description', type: 'text', rows: 3 },
    {
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }]
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 60 }
    },
    {
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', title: 'Alt', type: 'string' }
      ]
    },
    {
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          name: 'galleryImage',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Alt', type: 'string' }
          ]
        }
      ]
    },
    { name: 'price', title: 'Price', type: 'number' },
    { name: 'youtubeUrl', title: 'YouTube URL', type: 'url' },
    { name: 'shopeeUrl', title: 'Shopee URL', type: 'url' },
    { name: 'lazadaUrl', title: 'Lazada URL', type: 'url' },
    { name: 'tiktokUrl', title: 'TikTok Shop URL', type: 'url' },
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }]
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }]
    },
    { name: 'seo', title: 'SEO', type: 'seo' }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'sku',
      media: 'image'
    }
  }
}
