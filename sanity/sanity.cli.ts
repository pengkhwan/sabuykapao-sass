// sanity.cli.js

import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'ik92gukm', // <-- แก้ไขเป็น ID ที่ถูกต้อง
    dataset: 'production'
  },
  // ...
})