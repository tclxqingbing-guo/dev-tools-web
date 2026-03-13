import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import WishPool from '../views/WishPool.vue'

const toolModules = import.meta.glob('../views/tools/*.vue')

function lazyTool(name: string) {
  const key = `../views/tools/${name}.vue`
  if (toolModules[key]) {
    return toolModules[key]
  }
  return () => import('../views/HomePage.vue')
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/wishes', name: 'wishes', component: WishPool },
    { path: '/tool/json-formatter', name: 'JsonFormatter', component: lazyTool('JsonFormatter') },
    { path: '/tool/xml-formatter', name: 'XmlFormatter', component: lazyTool('XmlFormatter') },
    { path: '/tool/url-encoder', name: 'UrlEncoder', component: lazyTool('UrlEncoder') },
    { path: '/tool/jwt-parser', name: 'JwtParser', component: lazyTool('JwtParser') },
    { path: '/tool/regex-tester', name: 'RegexTester', component: lazyTool('RegexTester') },
    { path: '/tool/base64-tool', name: 'Base64Tool', component: lazyTool('Base64Tool') },
    { path: '/tool/code-diff', name: 'CodeDiff', component: lazyTool('CodeDiff') },
    { path: '/tool/image-compressor', name: 'ImageCompressor', component: lazyTool('ImageCompressor') },
    { path: '/tool/qrcode-tool', name: 'QrCodeTool', component: lazyTool('QrCodeTool') },
    { path: '/tool/id-card-generator', name: 'IdCardGenerator', component: lazyTool('IdCardGenerator') },
    { path: '/tool/company-code-generator', name: 'CompanyCodeGenerator', component: lazyTool('CompanyCodeGenerator') },
    { path: '/tool/passport-generator', name: 'PassportGenerator', component: lazyTool('PassportGenerator') },
    { path: '/tool/ai-assistants', name: 'AiAssistants', component: lazyTool('AiAssistants') },
    { path: '/tool/ai-translator', name: 'AiTranslator', component: lazyTool('AiTranslator') },
    { path: '/tool/variable-namer', name: 'VariableNamer', component: lazyTool('VariableNamer') },
    { path: '/tool/tailwind-generator', name: 'TailwindGenerator', component: lazyTool('TailwindGenerator') },
    { path: '/tool/chart-generator', name: 'ChartGenerator', component: lazyTool('ChartGenerator') },
    { path: '/tool/tts-generator', name: 'TtsGenerator', component: lazyTool('TtsGenerator') },
    { path: '/tool/ocr-tool', name: 'OcrTool', component: lazyTool('OcrTool') },
    { path: '/tool/note-tool', name: 'NoteTool', component: lazyTool('NoteTool') },
  ],
})

export default router
