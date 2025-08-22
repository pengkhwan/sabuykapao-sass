// sanity/schemaTypes/index.js

// Import Document Types ที่เราใช้งานจริง
import article from './article'
import category from './category'
import product from './product'
import portfolio from './portfolio'

// Import Object Types ที่เราใช้งานจริง
import seo from './seo'

// Export Schema ทั้งหมดในรูปแบบ Array ที่ถูกต้อง
export const schemaTypes = [
    article,
    category,
    product,
    portfolio,
    seo
]