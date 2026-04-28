import { createApp } from 'vue';
import * as Sentry from '@sentry/vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import { injectWatermark } from 'bx-utils';

const app = createApp(App);
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const sentryTracesSampleRate = Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? '1');
const normalizedSentryTracesSampleRate = Number.isFinite(sentryTracesSampleRate) ? sentryTracesSampleRate : 1;

if (sentryDsn) {
  Sentry.init({
    app,
    dsn: sentryDsn,
    integrations: [Sentry.browserTracingIntegration({ router })],
    tracesSampleRate: normalizedSentryTracesSampleRate,
    sendDefaultPii: true,
    debug: import.meta.env.DEV,
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });

  if (import.meta.env.VITE_SENTRY_TEST_EVENT === 'true') {
    Sentry.captureMessage('Sentry frontend initialized');
  }
}

/**
 * 获取 Sentry 页面追踪码。
 *
 * @return 返回当前 Sentry propagation context 中的 traceId。
 */
function getSentryTrackCode(): string {
  return sentryDsn ? Sentry.getCurrentScope().getPropagationContext().traceId : '';
}

const sentryTrackCode = getSentryTrackCode();

app.use(router);
app.mount('#app');

injectWatermark({
  text: sentryTrackCode ?? 'sentryTrackCode is empty',
  fontSize: 18,
  color: '#000',
  opacity: 0.01,
  angle: 0,
  gapX: 100,
  gapY: 100,
  antiDelete: false,
});

// injectWatermark({
//   type: 'barcode',
//   text: sentryTrackCode ?? 'sentryTrackCode is empty',
//   format: 'CODE128',
//   lineColor: '#1f2937',
//   barWidth: 2,
//   barHeight: 56,
//   displayValue: true,
//   fontSize: 14,
//   opacity: 0.005,
//   angle: 0,
//   gapX: 120,
//   gapY: 96,
//   antiDelete: true,
// });