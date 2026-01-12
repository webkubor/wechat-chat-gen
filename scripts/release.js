import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const VERSION_FILE = path.join(ROOT_DIR, 'public/version.json')
const PACKAGE_FILE = path.join(ROOT_DIR, 'package.json')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function main() {
  // 1. 读取当前版本
  const versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf-8'))
  const pkgData = JSON.parse(fs.readFileSync(PACKAGE_FILE, 'utf-8'))
  
  console.log(`
📦 当前版本: ${versionData.version}`)
  console.log(`📅 最后更新: ${versionData.updatedAt}`)
  
  // 2. 询问新版本
  const newVersion = await question(`
请输入新版本号 (默认 ${incrementPatch(versionData.version)}): `) || incrementPatch(versionData.version)
  
  // 3. 询问更新内容
  console.log('
📝 请输入更新内容 (输入空行结束):')
  const features = []
  while (true) {
    const feature = await question(`- `)
    if (!feature.trim()) break
    features.push(feature.trim())
  }
  
  if (features.length === 0) {
    console.log('❌ 更新内容不能为空')
    rl.close()
    return
  }

  // 4. 更新数据
  const today = new Date().toISOString().split('T')[0]
  
  // 更新 version.json
  const newLog = {
    version: newVersion,
    date: today,
    features
  }
  
  versionData.version = newVersion
  versionData.updatedAt = today
  versionData.changelog.unshift(newLog) // 新日志放最前
  
  // 更新 package.json
  pkgData.version = newVersion

  // 5. 写入文件
  fs.writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2))
  fs.writeFileSync(PACKAGE_FILE, JSON.stringify(pkgData, null, 2))
  
  console.log(`
✅ 版本更新成功! v${newVersion}`)
  console.log(`文件已更新: public/version.json, package.json`)
  
  rl.close()
}

function incrementPatch(version) {
  const parts = version.split('.').map(Number)
  parts[2]++
  return parts.join('.')
}

main().catch(console.error)
