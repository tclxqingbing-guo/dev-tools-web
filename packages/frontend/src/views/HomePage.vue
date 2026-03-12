<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { tools, searchTools, categories, type Category, type Tool } from '../config/tools'
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  SparklesIcon,
  CodeBracketIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
  CpuChipIcon,
  CodeBracketSquareIcon,
  DocumentTextIcon,
  TagIcon,
  LanguageIcon,
  SpeakerWaveIcon,
  EyeIcon,
  IdentificationIcon,
  LinkIcon,
  LockClosedIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  SwatchIcon,
  BookOpenIcon,
  QrCodeIcon,
  PencilSquareIcon,
  WrenchIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const searchQuery = ref('')
const activeCategory = ref<Category>('全部')

const iconComponentMap: Record<string, any> = {
  CpuChipIcon,
  CodeBracketSquareIcon,
  DocumentTextIcon,
  TagIcon,
  LanguageIcon,
  SpeakerWaveIcon,
  EyeIcon,
  IdentificationIcon,
  LinkIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  SwatchIcon,
  BookOpenIcon,
  QrCodeIcon,
  PencilSquareIcon,
  WrenchIcon,
}

const categoryIconMap: Record<string, any> = {
  Squares2X2Icon,
  SparklesIcon,
  CodeBracketIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
}

const filteredTools = computed(() => {
  let result: Tool[]
  if (searchQuery.value.trim()) {
    result = searchTools(searchQuery.value)
  } else {
    result = [...tools].sort((a, b) => b.usageScore - a.usageScore)
  }
  if (activeCategory.value !== '全部') {
    result = result.filter(t => t.category === activeCategory.value)
  }
  return result
})

const getIconComponent = (iconName: string) => {
  return iconComponentMap[iconName] || WrenchIcon
}

const getCategoryIcon = (cat: Category) => {
  const map: Record<Category, string> = {
    '全部': 'Squares2X2Icon',
    'AI 工具': 'SparklesIcon',
    '开发工具': 'CodeBracketIcon',
    '测试工具': 'BeakerIcon',
    '实用工具': 'WrenchScrewdriverIcon',
    '媒体工具': 'PhotoIcon',
  }
  return categoryIconMap[map[cat]] || Squares2X2Icon
}

const openTool = (tool: Tool) => {
  router.push(tool.route)
}
</script>

<template>
  <div class="min-h-screen bg-surface">
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
    </div>

    <div class="relative max-w-7xl mx-auto px-6 py-12">
      <header class="text-center mb-12">
        <div class="flex items-center justify-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <WrenchIcon class="w-6 h-6 text-accent" />
          </div>
          <h1 class="text-3xl font-bold text-slate-100">Dev Tools Box</h1>
        </div>
        <p class="text-slate-400 text-sm">{{ tools.length }} 个开发工具，一站式解决</p>
      </header>

      <div class="max-w-2xl mx-auto mb-10">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索工具..."
            class="w-full pl-12 pr-4 py-3.5 glass-input text-base"
            autocomplete="off"
          />
        </div>
      </div>

      <div class="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeCategory = cat; searchQuery = ''"
          :class="[
            'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer',
            activeCategory === cat
              ? 'bg-accent text-white shadow-lg shadow-accent/20'
              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5'
          ]"
        >
          <component :is="getCategoryIcon(cat)" class="w-4 h-4" />
          {{ cat }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="tool in filteredTools"
          :key="tool.component"
          @click="openTool(tool)"
          class="group glass-card p-5 cursor-pointer transition-all duration-300 hover:bg-surface-hover/80 hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5"
        >
          <div class="flex items-start gap-4">
            <div class="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors duration-200">
              <component :is="getIconComponent(tool.icon)" class="w-6 h-6 text-accent" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-slate-100 mb-1 truncate group-hover:text-white transition-colors">
                {{ tool.name }}
              </h3>
              <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {{ tool.description }}
              </p>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-white/5">
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500 font-medium">
              {{ tool.category }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="filteredTools.length === 0" class="flex flex-col items-center justify-center py-20">
        <MagnifyingGlassIcon class="w-16 h-16 text-slate-600 mb-4" />
        <p class="text-slate-500 text-lg">未找到匹配的工具</p>
        <p class="text-slate-600 text-sm mt-1">尝试其他关键词</p>
      </div>

      <footer class="text-center mt-16 py-6 border-t border-white/5">
        <p class="text-xs text-slate-600">Dev Tools Box - Built with Vue 3 + Tailwind CSS</p>
      </footer>
    </div>
  </div>
</template>
