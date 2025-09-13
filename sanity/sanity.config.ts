// sanity/sanity.config.js
import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'

// schema หลัก
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'SabuyKapao',

  projectId: 'ik92gukm',
  dataset: 'production',

  plugins: [deskTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
