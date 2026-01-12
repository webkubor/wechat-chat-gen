import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const SVG_PATH = path.join(ROOT_DIR, 'public/logo.svg')
const PUBLIC_DIR = path.join(ROOT_DIR, 'public')

const SIZES = [192, 512]

async function generate() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error('❌ 找不到 logo.svg')
    return
  }

  console.log('🚀 开始生成 PWA 真实图标...')

  for (const size of SIZES) {
    const outputPath = path.join(PUBLIC_DIR, `pwa-${size}x${size}.png`)
    
    await sharp(SVG_PATH)
      .resize(size, size)
      .png()
      .toFile(outputPath)
    
    console.log(`✅ 已生成: pwa-${size}x${size}.png`)
  }

  // 生成 favicon.ico (简单起见，用 32x32 的 PNG 代替)
  await sharp(SVG_PATH)
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico'))
  
  console.log('✅ 已生成: favicon.ico')
}

generate().catch(console.error)
