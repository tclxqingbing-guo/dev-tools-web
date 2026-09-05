import { createApp } from 'vue'
import * as Sentry from '@sentry/vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import 'markstream-vue/index.css'
import { injectWatermark } from 'bx-utils'

interface PublicSettings {
  sentry?: {
    dsn?: string
    tracesSampleRate?: number
    testEvent?: boolean
  }
}

/**
 * 加载公开运行期配置并启动前端。
 *
 * @return 无返回值。
 */
async function bootstrap() {
  let publicSettings: PublicSettings = {}
  try {
    const response = await fetch('/api/settings/public')
    if (response.ok) publicSettings = await response.json()
  } catch {
    // 后端不可用时仍允许页面启动。
  }

  const app = createApp(App)
  const sentryDsn = publicSettings.sentry?.dsn || ''
  const sentryTracesSampleRate = Number(publicSettings.sentry?.tracesSampleRate ?? 1)
  const normalizedSentryTracesSampleRate = Number.isFinite(sentryTracesSampleRate)
    ? sentryTracesSampleRate
    : 1

  if (sentryDsn) {
    Sentry.init({
      app,
      dsn: sentryDsn,
      integrations: [Sentry.browserTracingIntegration({ router })],
      tracesSampleRate: normalizedSentryTracesSampleRate,
      sendDefaultPii: true,
      debug: import.meta.env.DEV,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    })

    if (publicSettings.sentry?.testEvent) {
      Sentry.captureMessage('Sentry frontend initialized')
    }
  }

  const sentryTrackCode = sentryDsn
    ? Sentry.getCurrentScope().getPropagationContext().traceId
    : ''

  app.use(router)
  app.mount('#app')

  injectWatermark({
    text: sentryTrackCode || 'sentryTrackCode is empty',
    fontSize: 18,
    color: '#000',
    opacity: 0.008,
    angle: 0,
    gapX: 100,
    gapY: 100,
    antiDelete: false,
  })
}

bootstrap()
