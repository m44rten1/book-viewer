import { registerSW } from 'virtual:pwa-register'

export function registerServiceWorker() {
  if (import.meta.env.DEV) return

  const updateServiceWorker = registerSW({
    immediate: true,
    onOfflineReady() {
      console.info('Book Viewer is ready for offline use.')
    },
    onNeedRefresh() {
      console.info('New version available. Reloading to update.')
      updateServiceWorker(true)
    },
  })
}
