// sanity/sanity.config.js
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

// --- ตอนนี้เราจะ Import แค่จาก index.js ที่เดียว ---
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'SabuyKapao',

  projectId: 'ik92gukm',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    // --- และลงทะเบียนแค่ตัวแปรเดียว ทำให้โค้ดสะอาดมาก ---
    types: schemaTypes,
  },
})