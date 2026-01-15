import { h, render } from 'vue'
import GlobalConfirm from '../components/ui/GlobalConfirm.vue'

export type ConfirmOptions = {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  confirmType?: 'danger' | 'primary'
}

export function initConfirm() {
  const container = document.createElement('div')
  container.id = 'global-confirm-container'
  document.body.appendChild(container)

  const vnode = h(GlobalConfirm)
  render(vnode, container)

  const confirmInstance = vnode.component?.exposed as {
    open: (options?: ConfirmOptions) => Promise<boolean>
  }

  const $confirm = (options?: ConfirmOptions) => confirmInstance.open(options)
  window.$confirm = $confirm

  return $confirm
}

declare global {
  interface Window {
    $confirm: (options?: ConfirmOptions) => Promise<boolean>
  }
}
