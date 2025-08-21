// sanity/sanity.config.js
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

// Import Schema ที่เป็น Document Types
import category from './schemaTypes/category'
import product from './schemaTypes/product'
import article from './schemaTypes/article'
import portfolio from './schemaTypes/portfolio'

// Import Schema ที่เป็น Object Types (ถ้ามี)
import seo from './schemaTypes/seo'

// (เผื่อในอนาคต) Import Schema อื่นๆ จาก index.js
import {schemaTypes} from './schemaTypes'


export default defineConfig({
  name: 'default',
  title: 'SabuyKapao',

  projectId: 'ik92gukm',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    // ลงทะเบียน Schema ทั้งหมดที่นี่
    types: [
      // Document Types
      product, 
      category, 
      article, 
      portfolio, 
      
      // Object Types
      seo, 
      
      // Other types from index.js (if any)
      ...schemaTypes
    ],
  },
})