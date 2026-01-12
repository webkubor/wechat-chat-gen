/**
 * 数据库统一 Schema 定义
 * 涵盖：IndexedDB (本地) 与 CloudBase (云端)
 */

// --- 基础枚举类型 ---
export type DeviceType = 'ios' | 'android'
export type StatusBarTheme = 'light' | 'dark'
export type PreviewTheme = 'light' | 'dark'

// --- 语料库实体 ---
export interface CorpusItem {
  _id?: string      // 云端主键
  id?: number       // 本地主键
  type: 'dialogue'  // 类型标识
  content: string   // 内容
  preset?: boolean  // 是否预设 (不存入DB)
  created_at?: Date | any // 创建时间
}

// --- 消息实体 (嵌套在会话中) ---
export type MessageType = 'text' | 'system' | 'image'

export interface ChatMessage {
  id: string
  type: MessageType
  content: string
  sender?: {
    name: string
    avatar: string
  }
  isMe?: boolean
  timestamp?: string
}

// --- 聊天会话实体 (单例) ---
export interface ChatSession {
  key: 'current'    // 固定主键
  groupTitle: string
  memberCount: number
  backgroundImage: string
  messages: ChatMessage[]
  currentUser: {
    name: string
    avatar: string
  }
  updated_at: Date | any
}

// --- 集合/表名常量 ---
export const DB_STORES = {
  CORPUS: 'corpus',
  CHAT_HISTORY: 'chat_history'
} as const
