import { registerSW } from 'virtual:pwa-register'

export function registerServiceWorker() {
  if (import.meta.env.DEV) return

  registerSW({
    immediate: true,
    onOfflineReady() {
      console.info('Book Viewer is ready for offline use.')
    },
    onNeedRefresh() {
      console.info('New version available. Reload to update.')
    },
  })
}
