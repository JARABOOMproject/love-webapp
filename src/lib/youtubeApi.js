// โหลด YouTube IFrame Player API แบบครั้งเดียว (กัน inject script ซ้ำ + กัน React StrictMode double-effect)
let apiPromise = null

export function loadYouTubeIframeAPI() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no-window'))
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('yt-api-timeout')), 8000)

    const prevReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeout)
      prevReady?.()
      resolve(window.YT)
    }

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('yt-api-blocked'))
      }
      document.head.appendChild(script)
    }
  })

  return apiPromise
}
