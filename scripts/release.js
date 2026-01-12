import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const VERSION_FILE = path.join(ROOT_DIR, 'public/version.json')
const PACKAGE_FILE = path.join(ROOT_DIR, 'package.json')
const CHANGELOG_FILE = path.join(ROOT_DIR, 'CHANGELOG.md')

const AUTO_FLAGS = new Set(['--auto', '-y', '--yes'])
const isAuto = process.argv.some(arg => AUTO_FLAGS.has(arg))
const rl = isAuto
  ? null
  : readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

const question = (query) => new Promise((resolve) => {
  if (!rl) return resolve('')
  rl.question(query, resolve)
})

async function main() {
  // 1. 读取当前版本
  const versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf-8'))
  const pkgData = JSON.parse(fs.readFileSync(PACKAGE_FILE, 'utf-8'))
  let changelogContent = ''
  if (fs.existsSync(CHANGELOG_FILE)) {
    changelogContent = fs.readFileSync(CHANGELOG_FILE, 'utf-8')
  } else {
    changelogContent = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n'
  }
  
  const latestVersion = versionData.changelog?.[0]?.version || versionData.version
  const latestUpdatedAt = versionData.changelog?.[0]?.date

  console.log(`
📦 当前版本: ${latestVersion}`)
  if (latestUpdatedAt) console.log(`📅 最后更新: ${latestUpdatedAt}`)
  
  // 2. 询问新版本
  const defaultVersion = incrementPatch(latestVersion)
  const newVersion = isAuto
    ? defaultVersion
    : await question(`
请输入新版本号 (默认 ${defaultVersion}): `) || defaultVersion
  
  // 3. 询问更新内容
  let features = []
  if (isAuto) {
    const envNotes = process.env.RELEASE_NOTES?.trim()
    features = envNotes ? envNotes.split('|').map(item => item.trim()).filter(Boolean) : ['例行更新']
  } else {
    console.log('\n📝 请输入更新内容 (输入空行结束):')
    while (true) {
      const feature = await question(`- `)
      if (!feature.trim()) break
      features.push(feature.trim())
    }
  }
  
  if (features.length === 0) {
    console.log('❌ 更新内容不能为空')
    rl?.close()
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
  
  versionData.changelog.unshift(newLog) // 新日志放最前
  
  // 更新 package.json
  pkgData.version = newVersion

  // 更新 CHANGELOG.md
  const newChangelogEntry = `\n## [${newVersion}] - ${today}\n\n${features.map(f => `- ${f}`).join('\n')}\n`
  // 在 Header 后插入新日志（假设 Header 占 4 行）
  const headerEndIndex = changelogContent.indexOf('## [')
  if (headerEndIndex !== -1) {
    changelogContent = changelogContent.slice(0, headerEndIndex) + newChangelogEntry + changelogContent.slice(headerEndIndex)
  } else {
    // 如果找不到之前的版本记录，直接追加到头部说明之后
    const lines = changelogContent.split('\n')
    // 找到第一个非空行之后的空行位置，或者直接追加
    changelogContent += newChangelogEntry
  }

  // 5. 写入文件
  fs.writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2))
  fs.writeFileSync(PACKAGE_FILE, JSON.stringify(pkgData, null, 2))
  fs.writeFileSync(CHANGELOG_FILE, changelogContent)
  
  console.log(`
✅ 版本更新成功! v${newVersion}`)
  console.log(`文件已更新: public/version.json, package.json, CHANGELOG.md`)
  console.log(`
🧾 最新日志:
- v${newLog.version} (${newLog.date})
${newLog.features.map(f => `  - ${f}`).join('\n')}`)
  
  rl?.close()
}

function incrementPatch(version) {
  const safeVersion = version || '0.0.0'
  const parts = safeVersion.split('.').map(Number)
  parts[2]++
  return parts.join('.')
}

main().catch(console.error)
