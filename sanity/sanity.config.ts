// sanity/sanity.config.js
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'

// ปลั๊กอิน AI actions (ไฟล์ JS)
import aiActions from './src/plugins/ai-actions/index.js'

// schema หลัก
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'SabuyKapao',

  projectId: 'ik92gukm',
  dataset: 'production',

  // เปิดปลั๊กอิน AI
  plugins: [deskTool(), visionTool(), aiActions()],

  schema: {
    types: schemaTypes,
  },
})
