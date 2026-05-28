<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ToolHorizontalTable from '../../components/ToolHorizontalTable.vue'
import ToolLayout from '../../components/ToolLayout.vue'
import ToolModal from '../../components/ToolModal.vue'
import ToolPagination from '../../components/ToolPagination.vue'
import { useApi } from '../../composables/useApi'
import { useToast } from '../../composables/useToast'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
  BookOpenIcon,
  CheckIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TableCellsIcon,
  TrashIcon,
  XMarkIcon,
  ChevronLeftIcon,
} from '@heroicons/vue/24/outline'

type DictionaryValueType = 'object' | 'array' | 'invalid'
type EditValueMode = 'form' | 'json'
type ActionColumnPosition = 'left' | 'right'
type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonObject | JsonValue[]

interface JsonObject {
  [key: string]: JsonValue
}

interface DictionaryRecord {
  id: number
  name: string
  code: string
  description: string
  value: string
  metadata: string
  value_type: DictionaryValueType
  item_count: number
  created_at: string
  updated_at: string
}

interface DictionaryMetadata {
  itemPageSize?: number
  actionColumnPosition?: ActionColumnPosition
  columnWidths?: Record<string, number>
}

interface ArrayTableRow {
  sourceIndex: number
  data: JsonObject
}

interface EditableField {
  id: number
  key: string
  value: string
}

interface EditableArrayField {
  id: number
  key: string
  originalKey: string
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { request } = useApi()

const dictionaries = ref<DictionaryRecord[]>([])
const selectedDictionary = ref<DictionaryRecord | null>(null)
const keyword = ref('')
const itemSearchKeyword = ref('')
const itemSearchField = ref('__all__')
const itemPageSize = ref(10)
const itemCurrentPage = ref(1)
const actionColumnPosition = ref<ActionColumnPosition>('right')
const columnWidths = ref<Record<string, number>>({})
const listLoading = ref(false)
const detailLoading = ref(false)
const saving = ref(false)
const dictionaryModalOpen = ref(false)
const markdownImportModalOpen = ref(false)
const columnSettingsModalOpen = ref(false)
const rowModalOpen = ref(false)
const fieldModalOpen = ref(false)
const rowDetailModalOpen = ref(false)
const dictionaryValueMode = ref<EditValueMode>('form')
const rowValueMode = ref<EditValueMode>('form')
const editingDictionary = ref<DictionaryRecord | null>(null)
const editingRowIndex = ref<number | null>(null)
const editingFieldName = ref<string | null>(null)
const viewingArrayRow = ref<ArrayTableRow | null>(null)
const dictionaryFormError = ref('')
const markdownImportError = ref('')
const rowFormError = ref('')
const fieldFormError = ref('')
const rowForm = ref('')
const objectFormFields = ref<EditableField[]>([])
const arrayFormFields = ref<EditableArrayField[]>([])
const arrayRowDraft = ref<Record<string, string>>({})
const arrayRowFormFields = ref<EditableField[]>([])
const objectJsonTemplate = '{\n  \n}'
const arrayJsonTemplate = '[\n  {\n    "label": "",\n    "value": ""\n  }\n]'
const arrayPageSizeOptions = [10, 20, 50, 100]
let editableFieldId = 0

const dictionaryForm = reactive({
  name: '',
  code: '',
  description: '',
  value: objectJsonTemplate,
})

const markdownImportForm = reactive({
  name: '企保产品映射关系',
  code: 'enterprise_product_mapping',
  description: '从 Markdown 表格导入的企保产品映射关系',
  content: '',
})

const fieldForm = reactive({
  key: '',
  value: '',
})

const routeDictionaryId = computed(() => {
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const parsedId = Number(rawId)
  return rawId && Number.isInteger(parsedId) ? parsedId : null
})

const filteredDictionaries = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  if (!normalizedKeyword) return dictionaries.value
  return dictionaries.value.filter(dictionary =>
    dictionary.name.toLowerCase().includes(normalizedKeyword) ||
    dictionary.code.toLowerCase().includes(normalizedKeyword) ||
    dictionary.description.toLowerCase().includes(normalizedKeyword) ||
    dictionary.value.toLowerCase().includes(normalizedKeyword)
  )
})

const parsedDictionaryValue = computed<JsonValue | null>(() => {
  if (!selectedDictionary.value) return null
  try {
    return JSON.parse(selectedDictionary.value.value) as JsonValue
  } catch {
    return null
  }
})

const objectValue = computed<JsonObject | null>(() => {
  return isPlainObject(parsedDictionaryValue.value) ? parsedDictionaryValue.value : null
})

const objectFields = computed(() => {
  if (!objectValue.value) return []
  return Object.entries(objectValue.value).map(([fieldName, fieldValue]) => ({
    fieldName,
    fieldValue,
    fieldType: getJsonType(fieldValue),
  }))
})

const arrayRows = computed<JsonObject[]>(() => {
  if (!Array.isArray(parsedDictionaryValue.value)) return []
  return parsedDictionaryValue.value.map(item => isPlainObject(item) ? item : { value: item })
})

const dynamicFields = computed(() => {
  const fields = new Set<string>()
  for (const row of arrayRows.value) {
    Object.keys(row).forEach(fieldName => fields.add(fieldName))
  }
  return Array.from(fields)
})

const filteredArrayRows = computed<ArrayTableRow[]>(() => {
  const normalizedKeyword = itemSearchKeyword.value.trim().toLowerCase()
  const selectedField = itemSearchField.value
  return arrayRows.value
    .map((data, sourceIndex) => ({ data, sourceIndex }))
    .filter(row => {
      if (!normalizedKeyword) return true
      if (selectedField !== '__all__') {
        return formatJsonValue(row.data[selectedField]).toLowerCase().includes(normalizedKeyword)
      }
      return dynamicFields.value.some(fieldName =>
        formatJsonValue(row.data[fieldName]).toLowerCase().includes(normalizedKeyword)
      )
    })
})

const totalArrayPages = computed(() => Math.max(1, Math.ceil(filteredArrayRows.value.length / itemPageSize.value)))

const paginatedArrayRows = computed(() => {
  const startIndex = (itemCurrentPage.value - 1) * itemPageSize.value
  return filteredArrayRows.value.slice(startIndex, startIndex + itemPageSize.value)
})

const arrayPageStart = computed(() => {
  if (!filteredArrayRows.value.length) return 0
  return (itemCurrentPage.value - 1) * itemPageSize.value + 1
})

const arrayPageEnd = computed(() => Math.min(itemCurrentPage.value * itemPageSize.value, filteredArrayRows.value.length))

const dictionaryFormValueType = computed<DictionaryValueType>(() => getJsonValueType(parseJsonValue(dictionaryForm.value)))

const viewingArrayRowJson = computed(() => viewingArrayRow.value ? JSON.stringify(viewingArrayRow.value.data, null, 2) : '')

const markdownPreviewRows = computed(() => {
  try {
    return parseMarkdownTable(markdownImportForm.content)
  } catch {
    return []
  }
})

watch(routeDictionaryId, async dictionaryId => {
  itemSearchKeyword.value = ''
  itemSearchField.value = '__all__'
  itemCurrentPage.value = 1
  if (!dictionaryId) {
    selectedDictionary.value = null
    return
  }
  await fetchDictionary(dictionaryId)
}, { immediate: true })

watch(dynamicFields, fields => {
  if (itemSearchField.value !== '__all__' && !fields.includes(itemSearchField.value)) {
    itemSearchField.value = '__all__'
  }
  const nextColumnWidths: Record<string, number> = {}
  for (const fieldName of fields) {
    nextColumnWidths[fieldName] = columnWidths.value[fieldName] ?? getDefaultColumnWidth(fieldName)
  }
  columnWidths.value = nextColumnWidths
})

watch([itemSearchKeyword, itemSearchField, itemPageSize], () => {
  itemCurrentPage.value = 1
})

watch(totalArrayPages, totalPages => {
  if (itemCurrentPage.value > totalPages) {
    itemCurrentPage.value = totalPages
  }
})

/**
 * 加载外层字典列表。
 *
 * @return 无返回值。
 */
async function fetchDictionaries() {
  listLoading.value = true
  try {
    dictionaries.value = await request<DictionaryRecord[]>('/dictionary')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '加载字典失败')
  } finally {
    listLoading.value = false
  }
}

/**
 * 根据字典 ID 加载详情。
 *
 * @param dictionaryId 字典 ID。
 * @return 无返回值。
 */
async function fetchDictionary(dictionaryId: number) {
  detailLoading.value = true
  try {
    const dictionary = await request<DictionaryRecord>(`/dictionary/${dictionaryId}`)
    applyDictionaryMetadata(dictionary)
    selectedDictionary.value = dictionary
  } catch (error) {
    selectedDictionary.value = null
    toast.error(error instanceof Error ? error.message : '加载字典详情失败')
  } finally {
    detailLoading.value = false
  }
}

/**
 * 新增或更新外层字典。
 *
 * @return 无返回值。
 */
async function submitDictionary() {
  const normalizedValue = getDictionarySubmitValue()
  if (!normalizedValue) return

  saving.value = true
  try {
    const payload = {
      name: dictionaryForm.name,
      code: dictionaryForm.code,
      description: dictionaryForm.description,
      value: normalizedValue,
    }
    const endpoint = editingDictionary.value ? `/dictionary/${editingDictionary.value.id}` : '/dictionary'
    const method = editingDictionary.value ? 'PUT' : 'POST'
    const savedDictionary = await request<DictionaryRecord>(endpoint, {
      method,
      body: JSON.stringify(payload),
    })
    replaceDictionary(savedDictionary)
    selectedDictionary.value = routeDictionaryId.value === savedDictionary.id ? savedDictionary : selectedDictionary.value
    dictionaryModalOpen.value = false
    toast.success(editingDictionary.value ? '字典已保存' : '字典已创建')
    if (!editingDictionary.value) {
      await router.push(`/tool/dictionary/${savedDictionary.id}`)
    }
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '保存字典失败')
  } finally {
    saving.value = false
  }
}

/**
 * 将 Markdown 表格导入为数组字典。
 *
 * @return 无返回值。
 */
async function submitMarkdownImport() {
  markdownImportError.value = ''
  let importedRows: JsonObject[] = []
  try {
    importedRows = parseMarkdownTable(markdownImportForm.content)
  } catch (error) {
    markdownImportError.value = error instanceof Error ? error.message : 'Markdown 表格解析失败'
    return
  }
  if (!importedRows.length) {
    markdownImportError.value = '未解析到有效表格数据'
    return
  }

  saving.value = true
  try {
    const savedDictionary = await request<DictionaryRecord>('/dictionary', {
      method: 'POST',
      body: JSON.stringify({
        name: markdownImportForm.name || 'Markdown 表格字典',
        code: markdownImportForm.code,
        description: markdownImportForm.description,
        value: JSON.stringify(importedRows, null, 2),
      }),
    })
    replaceDictionary(savedDictionary)
    markdownImportModalOpen.value = false
    toast.success(`已导入 ${importedRows.length} 条明细`)
    await router.push(`/tool/dictionary/${savedDictionary.id}`)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '导入字典失败')
  } finally {
    saving.value = false
  }
}

/**
 * 保存内层 JSON 数据到当前字典。
 *
 * @param nextValue 下一份对象或数组数据。
 * @return 无返回值。
 */
async function saveDictionaryValue(nextValue: JsonValue) {
  if (!selectedDictionary.value) return
  saving.value = true
  try {
    const savedDictionary = await request<DictionaryRecord>(`/dictionary/${selectedDictionary.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: selectedDictionary.value.name,
        code: selectedDictionary.value.code,
        description: selectedDictionary.value.description,
        value: JSON.stringify(nextValue, null, 2),
      }),
    })
    selectedDictionary.value = savedDictionary
    replaceDictionary(savedDictionary)
    toast.success('字典值已保存')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '保存字典值失败')
  } finally {
    saving.value = false
  }
}

/**
 * 新增或更新数组字典的一行。
 *
 * @return 无返回值。
 */
async function submitArrayRow() {
  rowFormError.value = ''
  try {
    const parsedRow = rowValueMode.value === 'form'
      ? buildObjectFromEditableFields(arrayRowFormFields.value, '数组行')
      : JSON.parse(rowForm.value) as unknown
    if (!parsedRow) return
    if (!isPlainObject(parsedRow)) {
      rowFormError.value = '数组行必须是 JSON 对象'
      return
    }
    const nextRows = arrayRows.value.map(row => cloneJsonObject(row))
    if (editingRowIndex.value === null) {
      nextRows.push(parsedRow)
    } else {
      nextRows.splice(editingRowIndex.value, 1, parsedRow)
    }
    await saveDictionaryValue(nextRows)
    rowModalOpen.value = false
  } catch {
    rowFormError.value = '请输入有效 JSON 对象'
  }
}

/**
 * 新增或更新对象字典的字段。
 *
 * @return 无返回值。
 */
async function submitObjectField() {
  fieldFormError.value = ''
  const fieldName = fieldForm.key.trim()
  if (!fieldName) {
    fieldFormError.value = '字段名不能为空'
    return
  }
  if (editingFieldName.value !== fieldName && objectValue.value && Object.prototype.hasOwnProperty.call(objectValue.value, fieldName)) {
    fieldFormError.value = '字段名已存在'
    return
  }

  const nextObject = { ...(objectValue.value ?? {}) }
  if (editingFieldName.value && editingFieldName.value !== fieldName) {
    delete nextObject[editingFieldName.value]
  }
  nextObject[fieldName] = parseLooseJsonValue(fieldForm.value)
  await saveDictionaryValue(nextObject)
  fieldModalOpen.value = false
}

function openDictionaryDetail(dictionary: DictionaryRecord) {
  router.push(`/tool/dictionary/${dictionary.id}`)
}

function backToList() {
  router.push('/tool/dictionary')
}

function openCreateDictionary() {
  editingDictionary.value = null
  dictionaryForm.name = ''
  dictionaryForm.code = ''
  dictionaryForm.description = ''
  dictionaryForm.value = objectJsonTemplate
  dictionaryValueMode.value = 'form'
  dictionaryFormError.value = ''
  hydrateDictionaryFormEditor()
  dictionaryModalOpen.value = true
}

function openMarkdownImport() {
  markdownImportForm.name = '企保产品映射关系'
  markdownImportForm.code = 'enterprise_product_mapping'
  markdownImportForm.description = '从 Markdown 表格导入的企保产品映射关系'
  markdownImportForm.content = ''
  markdownImportError.value = ''
  markdownImportModalOpen.value = true
}

function applyObjectTemplate() {
  dictionaryForm.value = objectJsonTemplate
  dictionaryValueMode.value = 'form'
  hydrateDictionaryFormEditor()
}

function applyArrayTemplate() {
  dictionaryForm.value = arrayJsonTemplate
  dictionaryValueMode.value = 'form'
  hydrateDictionaryFormEditor()
}

function openEditDictionary(dictionary: DictionaryRecord) {
  editingDictionary.value = dictionary
  dictionaryForm.name = dictionary.name
  dictionaryForm.code = dictionary.code
  dictionaryForm.description = dictionary.description
  dictionaryForm.value = formatJsonText(dictionary.value)
  dictionaryValueMode.value = dictionary.value_type === 'invalid' ? 'json' : 'form'
  dictionaryFormError.value = ''
  hydrateDictionaryFormEditor()
  dictionaryModalOpen.value = true
}

async function deleteDictionary(dictionary: DictionaryRecord) {
  const confirmed = window.confirm(`确认删除字典「${dictionary.name}」吗？`)
  if (!confirmed) return
  try {
    await request(`/dictionary/${dictionary.id}`, { method: 'DELETE' })
    dictionaries.value = dictionaries.value.filter(item => item.id !== dictionary.id)
    if (routeDictionaryId.value === dictionary.id) {
      selectedDictionary.value = null
      await router.push('/tool/dictionary')
    }
    toast.success('字典已删除')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '删除字典失败')
  }
}

function openCreateArrayRow() {
  editingRowIndex.value = null
  rowValueMode.value = 'form'
  setArrayRowForm(createEmptyArrayRow())
  rowFormError.value = ''
  rowModalOpen.value = true
}

function openEditArrayRow(row: ArrayTableRow) {
  editingRowIndex.value = row.sourceIndex
  rowValueMode.value = 'form'
  setArrayRowForm(row.data)
  rowFormError.value = ''
  rowModalOpen.value = true
}

/**
 * 打开数组行详情弹框。
 *
 * @param row 当前数组行。
 * @return 无返回值。
 */
function openArrayRowDetail(row: ArrayTableRow) {
  viewingArrayRow.value = row
  rowDetailModalOpen.value = true
}

async function deleteArrayRow(sourceIndex: number) {
  const confirmed = window.confirm('确认删除这条字典明细吗？')
  if (!confirmed) return
  const nextRows = arrayRows.value.map(row => cloneJsonObject(row))
  nextRows.splice(sourceIndex, 1)
  await saveDictionaryValue(nextRows)
}

function openCreateObjectField() {
  editingFieldName.value = null
  fieldForm.key = ''
  fieldForm.value = '""'
  fieldFormError.value = ''
  fieldModalOpen.value = true
}

function openEditObjectField(fieldName: string, fieldValue: JsonValue) {
  editingFieldName.value = fieldName
  fieldForm.key = fieldName
  fieldForm.value = formatJsonText(JSON.stringify(fieldValue, null, 2))
  fieldFormError.value = ''
  fieldModalOpen.value = true
}

async function deleteObjectField(fieldName: string) {
  const confirmed = window.confirm(`确认删除字段「${fieldName}」吗？`)
  if (!confirmed || !objectValue.value) return
  const nextObject = { ...objectValue.value }
  delete nextObject[fieldName]
  await saveDictionaryValue(nextObject)
}

function replaceDictionary(dictionary: DictionaryRecord) {
  const dictionaryIndex = dictionaries.value.findIndex(item => item.id === dictionary.id)
  if (dictionaryIndex >= 0) {
    dictionaries.value.splice(dictionaryIndex, 1, dictionary)
  } else {
    dictionaries.value.unshift(dictionary)
  }
}

function getNormalizedDictionaryValue(rawValue: string): string | null {
  dictionaryFormError.value = ''
  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    if (!parsedValue || typeof parsedValue !== 'object') {
      dictionaryFormError.value = '字典值必须是 JSON 对象或数组'
      return null
    }
    return JSON.stringify(parsedValue, null, 2)
  } catch {
    dictionaryFormError.value = '请输入有效 JSON'
    return null
  }
}

/**
 * 根据当前编辑模式生成可提交的字典 JSON。
 *
 * @return 标准化后的 JSON 字符串。
 */
function getDictionarySubmitValue(): string | null {
  if (dictionaryValueMode.value === 'json') {
    return getNormalizedDictionaryValue(dictionaryForm.value)
  }

  const parsedValue = parseJsonValue(dictionaryForm.value)
  const valueType = getJsonValueType(parsedValue)
  if (valueType === 'object') {
    const objectValue = buildObjectFromEditableFields(objectFormFields.value, '对象字段')
    if (!objectValue) return null
    dictionaryForm.value = JSON.stringify(objectValue, null, 2)
    return dictionaryForm.value
  }

  if (valueType === 'array') {
    if (!syncArrayFormSchemaToDictionaryValue()) return null
    return getNormalizedDictionaryValue(dictionaryForm.value)
  }

  dictionaryFormError.value = '表单模式仅支持 JSON 对象或数组'
  return null
}

/**
 * 将字典 JSON 同步到表单编辑状态。
 *
 * @return 是否同步成功。
 */
function hydrateDictionaryFormEditor(): boolean {
  const parsedValue = parseJsonValue(dictionaryForm.value)
  const valueType = getJsonValueType(parsedValue)
  if (valueType === 'object' && isPlainObject(parsedValue)) {
    objectFormFields.value = Object.entries(parsedValue).map(([fieldName, fieldValue]) => createEditableField(fieldName, formatEditableValue(fieldValue)))
    arrayFormFields.value = []
    arrayRowDraft.value = {}
    return true
  }
  if (valueType === 'array' && Array.isArray(parsedValue)) {
    objectFormFields.value = []
    arrayFormFields.value = inferArrayFieldNames(parsedValue).map(fieldName => createEditableArrayField(fieldName))
    resetArrayRowDraft()
    return true
  }
  objectFormFields.value = []
  arrayFormFields.value = []
  arrayRowDraft.value = {}
  return false
}

function switchDictionaryValueMode(nextMode: EditValueMode) {
  if (nextMode === 'json' && dictionaryValueMode.value === 'form') {
    const synced = syncDictionaryFormValueFromForm()
    if (!synced) return
  }
  if (nextMode === 'form') {
    const synced = hydrateDictionaryFormEditor()
    if (!synced) {
      dictionaryFormError.value = '当前 JSON 无法使用表单编辑，请先修正 JSON'
      return
    }
  }
  dictionaryValueMode.value = nextMode
  dictionaryFormError.value = ''
}

function syncDictionaryFormValueFromForm(): boolean {
  const parsedValue = parseJsonValue(dictionaryForm.value)
  const valueType = getJsonValueType(parsedValue)
  if (valueType === 'object') {
    const objectValue = buildObjectFromEditableFields(objectFormFields.value, '对象字段')
    if (!objectValue) return false
    dictionaryForm.value = JSON.stringify(objectValue, null, 2)
  }
  if (valueType === 'array') {
    return syncArrayFormSchemaToDictionaryValue()
  }
  return true
}

function addObjectFormField() {
  objectFormFields.value.push(createEditableField('', ''))
}

function removeObjectFormField(fieldId: number) {
  objectFormFields.value = objectFormFields.value.filter(field => field.id !== fieldId)
}

function addArrayFormField() {
  const fieldName = getNextArrayFormFieldName()
  arrayFormFields.value.push(createEditableArrayField(fieldName))
  syncArrayFormSchemaToDictionaryValue()
}

function removeArrayFormField(fieldId: number) {
  arrayFormFields.value = arrayFormFields.value.filter(field => field.id !== fieldId)
  syncArrayFormSchemaToDictionaryValue()
}

function resetArrayRowDraft() {
  arrayRowDraft.value = arrayFormFields.value.reduce<Record<string, string>>((draft, field) => {
    const fieldName = field.key.trim()
    if (fieldName) draft[fieldName] = ''
    return draft
  }, {})
}

function appendDictionaryArrayRow() {
  dictionaryFormError.value = ''
  if (!syncArrayFormSchemaToDictionaryValue()) return
  const parsedValue = parseJsonValue(dictionaryForm.value)
  if (!Array.isArray(parsedValue)) {
    dictionaryFormError.value = '当前字典值不是 JSON 数组'
    return
  }
  const row = arrayFormFields.value.reduce<JsonObject>((result, field) => {
    const fieldName = field.key.trim()
    if (fieldName) {
      result[fieldName] = parseLooseJsonValue(arrayRowDraft.value[fieldName] ?? '')
    }
    return result
  }, {})
  if (!Object.keys(row).length) {
    dictionaryFormError.value = '请至少保留一个有效字段'
    return
  }
  parsedValue.push(row)
  dictionaryForm.value = JSON.stringify(parsedValue, null, 2)
  resetArrayRowDraft()
  toast.success('已追加一行，保存后生效')
}

function switchRowValueMode(nextMode: EditValueMode) {
  if (nextMode === 'json' && rowValueMode.value === 'form') {
    const row = buildObjectFromEditableFields(arrayRowFormFields.value, '数组行')
    if (!row) return
    rowForm.value = JSON.stringify(row, null, 2)
  }
  if (nextMode === 'form') {
    try {
      const parsedRow = JSON.parse(rowForm.value) as unknown
      if (!isPlainObject(parsedRow)) {
        rowFormError.value = '数组行必须是 JSON 对象'
        return
      }
      setArrayRowForm(parsedRow)
    } catch {
      rowFormError.value = '请输入有效 JSON 对象'
      return
    }
  }
  rowValueMode.value = nextMode
  rowFormError.value = ''
}

function setArrayRowForm(row: JsonObject) {
  const rowFields = new Set([...dynamicFields.value, ...Object.keys(row)])
  const fields = Array.from(rowFields.size ? rowFields : new Set(['name']))
  arrayRowFormFields.value = fields.map(fieldName => createEditableField(fieldName, formatEditableValue(row[fieldName])))
  rowForm.value = JSON.stringify(row, null, 2)
}

function addArrayRowFormField() {
  arrayRowFormFields.value.push(createEditableField('', ''))
}

function removeArrayRowFormField(fieldId: number) {
  arrayRowFormFields.value = arrayRowFormFields.value.filter(field => field.id !== fieldId)
}

function goToPreviousArrayPage() {
  itemCurrentPage.value = Math.max(1, itemCurrentPage.value - 1)
}

function goToNextArrayPage() {
  itemCurrentPage.value = Math.min(totalArrayPages.value, itemCurrentPage.value + 1)
}

function openColumnSettings() {
  columnSettingsModalOpen.value = true
}

function resetColumnWidths() {
  columnWidths.value = dynamicFields.value.reduce<Record<string, number>>((widths, fieldName) => {
    widths[fieldName] = getDefaultColumnWidth(fieldName)
    return widths
  }, {})
  void persistDictionaryMetadata()
}

/**
 * 关闭列设置并持久化当前表格偏好。
 *
 * @return 无返回值。
 */
async function closeColumnSettings() {
  await persistDictionaryMetadata()
  columnSettingsModalOpen.value = false
}

/**
 * 更新操作列固定方向并保存到字典元数据。
 *
 * @param position 操作列固定方向。
 * @return 无返回值。
 */
function updateActionColumnPosition(position: ActionColumnPosition) {
  actionColumnPosition.value = position
  void persistDictionaryMetadata()
}

/**
 * 将当前表格偏好保存到字典元数据。
 *
 * @return 无返回值。
 */
async function persistDictionaryMetadata() {
  if (!selectedDictionary.value) return
  try {
    const savedDictionary = await request<DictionaryRecord>(`/dictionary/${selectedDictionary.value.id}/metadata`, {
      method: 'PATCH',
      body: JSON.stringify({ metadata: buildDictionaryMetadata() }),
    })
    selectedDictionary.value = savedDictionary
    replaceDictionary(savedDictionary)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '保存表格设置失败')
  }
}

/**
 * 生成当前字典表格偏好的元数据。
 *
 * @return 字典元数据。
 */
function buildDictionaryMetadata(): DictionaryMetadata {
  const persistedColumnWidths = dynamicFields.value.reduce<Record<string, number>>((widths, fieldName) => {
    widths[fieldName] = columnWidths.value[fieldName] ?? getDefaultColumnWidth(fieldName)
    return widths
  }, {})
  return {
    itemPageSize: itemPageSize.value,
    actionColumnPosition: actionColumnPosition.value,
    columnWidths: persistedColumnWidths,
  }
}

/**
 * 应用字典中保存的表格偏好。
 *
 * @param dictionary 字典记录。
 * @return 无返回值。
 */
function applyDictionaryMetadata(dictionary: DictionaryRecord) {
  const metadata = parseDictionaryMetadata(dictionary)
  const savedPageSize = Number(metadata.itemPageSize)
  itemPageSize.value = arrayPageSizeOptions.includes(savedPageSize) ? savedPageSize : 10
  actionColumnPosition.value = isActionColumnPosition(metadata.actionColumnPosition) ? metadata.actionColumnPosition : 'right'
  columnWidths.value = normalizeMetadataColumnWidths(metadata.columnWidths)
}

/**
 * 解析字典元数据 JSON。
 *
 * @param dictionary 字典记录。
 * @return 字典元数据。
 */
function parseDictionaryMetadata(dictionary: DictionaryRecord): DictionaryMetadata {
  try {
    const parsedMetadata = JSON.parse(dictionary.metadata || '{}') as unknown
    return isPlainObject(parsedMetadata) ? parsedMetadata as unknown as DictionaryMetadata : {}
  } catch {
    return {}
  }
}

/**
 * 判断元数据中的操作列方向是否有效。
 *
 * @param value 待判断的值。
 * @return 是否为有效方向。
 */
function isActionColumnPosition(value: unknown): value is ActionColumnPosition {
  return value === 'left' || value === 'right'
}

/**
 * 从元数据中提取合法列宽。
 *
 * @param columnWidthMetadata 元数据中的列宽配置。
 * @return 合法列宽映射。
 */
function normalizeMetadataColumnWidths(columnWidthMetadata: unknown): Record<string, number> {
  if (!columnWidthMetadata || typeof columnWidthMetadata !== 'object' || Array.isArray(columnWidthMetadata)) return {}
  return Object.entries(columnWidthMetadata).reduce<Record<string, number>>((widths, [fieldName, width]) => {
    const numericWidth = Number(width)
    if (Number.isFinite(numericWidth) && numericWidth >= 80) {
      widths[fieldName] = numericWidth
    }
    return widths
  }, {})
}

function getColumnStyle(fieldName: string): Record<string, string> {
  const width = columnWidths.value[fieldName] ?? getDefaultColumnWidth(fieldName)
  return {
    width: `${width}px`,
    minWidth: `${width}px`,
    maxWidth: `${width}px`,
  }
}

function getDefaultColumnWidth(fieldName: string): number {
  if (fieldName === '序号') return 90
  if (/productCode|编码|code/i.test(fieldName)) return 150
  if (/名称|name/i.test(fieldName)) return 220
  if (/链接|路由|url|route|link/i.test(fieldName)) return 280
  if (/OrderType|字段/i.test(fieldName)) return 170
  return 180
}

/**
 * 生成一个未被基础表单占用的字段名。
 *
 * @return 可用字段名。
 */
function getNextArrayFormFieldName(): string {
  const usedFieldNames = new Set(arrayFormFields.value.map(field => field.key.trim()).filter(Boolean))
  let fieldIndex = arrayFormFields.value.length + 1
  while (usedFieldNames.has(`field${fieldIndex}`)) {
    fieldIndex += 1
  }
  return `field${fieldIndex}`
}

/**
 * 根据基础表单字段同步数组字典的列结构。
 *
 * @return 是否同步成功。
 */
function syncArrayFormSchemaToDictionaryValue(): boolean {
  const parsedValue = parseJsonValue(dictionaryForm.value)
  if (!Array.isArray(parsedValue)) {
    dictionaryFormError.value = '当前字典值不是 JSON 数组'
    return false
  }

  const normalizedFields = normalizeArrayFormFields()
  if (!normalizedFields) return false

  const nextRows = parsedValue.map(item => {
    const sourceRow = isPlainObject(item) ? cloneJsonObject(item) : { value: item }
    const nextRow: JsonObject = {}
    for (const field of normalizedFields) {
      const currentKey = field.key.trim()
      const previousKey = field.originalKey.trim()
      if (previousKey && previousKey !== currentKey && sourceRow[currentKey] === undefined && sourceRow[previousKey] !== undefined) {
        sourceRow[currentKey] = sourceRow[previousKey]
      }
      nextRow[currentKey] = sourceRow[currentKey] ?? ''
    }
    return nextRow
  })

  syncArrayRowDraftKeys(normalizedFields)
  for (const field of normalizedFields) {
    field.key = field.key.trim()
    field.originalKey = field.key
  }
  arrayFormFields.value = normalizedFields
  dictionaryForm.value = JSON.stringify(nextRows, null, 2)
  dictionaryFormError.value = ''
  return true
}

/**
 * 规范化基础表单字段并校验重复列名。
 *
 * @return 可同步的字段列表。
 */
function normalizeArrayFormFields(): EditableArrayField[] | null {
  const seenKeys = new Set<string>()
  const normalizedFields: EditableArrayField[] = []
  for (const field of arrayFormFields.value) {
    const fieldName = field.key.trim()
    if (!fieldName) continue
    if (seenKeys.has(fieldName)) {
      dictionaryFormError.value = `基础表单字段「${fieldName}」重复`
      return null
    }
    seenKeys.add(fieldName)
    normalizedFields.push({ ...field, key: fieldName })
  }
  return normalizedFields
}

/**
 * 按最新字段列表保留新增行草稿值。
 *
 * @param fields 最新基础表单字段。
 * @return 无返回值。
 */
function syncArrayRowDraftKeys(fields: EditableArrayField[]) {
  const nextDraft: Record<string, string> = {}
  for (const field of fields) {
    const fieldName = field.key.trim()
    const previousFieldName = field.originalKey.trim()
    nextDraft[fieldName] = arrayRowDraft.value[fieldName] ?? arrayRowDraft.value[previousFieldName] ?? ''
  }
  arrayRowDraft.value = nextDraft
}

function createEditableField(key: string, value: string): EditableField {
  editableFieldId += 1
  return { id: editableFieldId, key, value }
}

function createEditableArrayField(key: string): EditableArrayField {
  editableFieldId += 1
  return { id: editableFieldId, key, originalKey: key }
}

function buildObjectFromEditableFields(fields: EditableField[], label: string): JsonObject | null {
  const result: JsonObject = {}
  const seenKeys = new Set<string>()
  for (const field of fields) {
    const fieldName = field.key.trim()
    if (!fieldName) continue
    if (seenKeys.has(fieldName)) {
      dictionaryFormError.value = `${label}「${fieldName}」重复`
      rowFormError.value = `${label}「${fieldName}」重复`
      return null
    }
    seenKeys.add(fieldName)
    result[fieldName] = parseLooseJsonValue(field.value)
  }
  return result
}

function inferArrayFieldNames(rows: JsonValue[]): string[] {
  const fields = new Set<string>()
  for (const row of rows) {
    if (isPlainObject(row)) {
      Object.keys(row).forEach(fieldName => fields.add(fieldName))
    }
  }
  if (!fields.size && rows.length) return ['value']
  return Array.from(fields)
}

function parseJsonValue(rawValue: string): JsonValue | null {
  try {
    return JSON.parse(rawValue) as JsonValue
  } catch {
    return null
  }
}

function getJsonValueType(value: JsonValue | null): DictionaryValueType {
  if (Array.isArray(value)) return 'array'
  if (isPlainObject(value)) return 'object'
  return 'invalid'
}

function formatEditableValue(value: JsonValue | undefined): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

/**
 * 将 Markdown 表格文本解析为对象数组。
 *
 * @param markdownText Markdown 文本。
 * @return 表格行对象数组。
 */
function parseMarkdownTable(markdownText: string): JsonObject[] {
  const tableLines = markdownText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('|') && line.endsWith('|'))

  if (tableLines.length < 3) {
    throw new Error('请粘贴包含表头、分隔线和数据行的 Markdown 表格')
  }

  const headerLine = tableLines[0]
  if (!headerLine) {
    throw new Error('未找到有效的 Markdown 表格表头')
  }
  const headerCells = splitMarkdownTableRow(headerLine)
  const separatorIndex = tableLines.findIndex((line, lineIndex) => lineIndex > 0 && isMarkdownSeparatorRow(splitMarkdownTableRow(line)))
  if (separatorIndex < 1 || !headerCells.length) {
    throw new Error('未找到有效的 Markdown 表格表头')
  }

  return tableLines.slice(separatorIndex + 1).reduce<JsonObject[]>((rows, line) => {
    const cells = splitMarkdownTableRow(line)
    if (!cells.some(cell => cell.trim())) return rows
    const row = headerCells.reduce<JsonObject>((result, header, headerIndex) => {
      result[header] = cells[headerIndex]?.trim() ?? ''
      return result
    }, {})
    rows.push(row)
    return rows
  }, [])
}

/**
 * 拆分 Markdown 表格行，支持转义竖线。
 *
 * @param line Markdown 表格行。
 * @return 单元格文本列表。
 */
function splitMarkdownTableRow(line: string): string[] {
  const normalizedLine = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  const cells: string[] = []
  let currentCell = ''
  for (let index = 0; index < normalizedLine.length; index++) {
    const character = normalizedLine[index]
    const previousCharacter = normalizedLine[index - 1]
    if (character === '|' && previousCharacter !== '\\') {
      cells.push(currentCell.replace(/\\\|/g, '|').trim())
      currentCell = ''
    } else {
      currentCell += character
    }
  }
  cells.push(currentCell.replace(/\\\|/g, '|').trim())
  return cells
}

function isMarkdownSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell.trim()))
}

function parseLooseJsonValue(rawValue: string): JsonValue {
  const trimmedValue = rawValue.trim()
  if (!trimmedValue) return ''
  try {
    return JSON.parse(trimmedValue) as JsonValue
  } catch {
    return rawValue
  }
}

function createEmptyArrayRow(): JsonObject {
  const fieldNames = dynamicFields.value.filter(fieldName => fieldName !== 'value')
  if (!fieldNames.length) return { name: '' }
  return fieldNames.reduce<JsonObject>((result, fieldName) => {
    result[fieldName] = ''
    return result
  }, {})
}

function cloneJsonObject(value: JsonObject): JsonObject {
  return JSON.parse(JSON.stringify(value)) as JsonObject
}

function isPlainObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function formatJsonText(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

function formatJsonValue(value: JsonValue | undefined): string {
  if (value === undefined) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

function getJsonType(value: JsonValue | undefined): string {
  if (value === undefined) return 'empty'
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value === 'object' ? 'object' : typeof value
}

function getDictionaryTypeLabel(type: DictionaryValueType): string {
  const labelMap: Record<DictionaryValueType, string> = {
    object: '对象详情',
    array: '列表数据',
    invalid: '无效 JSON',
  }
  return labelMap[type]
}

function getDictionaryTypeClass(type: DictionaryValueType): string {
  const classMap: Record<DictionaryValueType, string> = {
    object: 'bg-blue-50 text-blue-600 border-blue-100',
    array: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    invalid: 'bg-red-50 text-red-600 border-red-100',
  }
  return classMap[type]
}

function formatTime(timeText: string): string {
  try {
    return new Date(timeText).toLocaleString('zh-CN')
  } catch {
    return timeText
  }
}

onMounted(fetchDictionaries)
</script>

<template>
  <ToolLayout title="字典查询">
    <div v-if="!routeDictionaryId" class="space-y-5">
      <div class="p-5 glass-card">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 class="flex items-center gap-2 font-semibold text-slate-800">
              <BookOpenIcon class="w-5 h-5 text-accent" />
              字典列表
            </h3>
            <p class="mt-1 text-xs text-slate-400">支持 JSON 对象和 JSON 数组两种字典值</p>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div class="relative sm:w-80">
              <MagnifyingGlassIcon class="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
              <input
                v-model="keyword"
                class="w-full py-2 pr-3 text-sm glass-input pl-9"
                placeholder="搜索名称、编码、说明或内容"
                type="text"
              />
            </div>
            <button class="flex items-center justify-center gap-2 text-sm btn-secondary" @click="openMarkdownImport">
              <ArrowUpTrayIcon class="w-4 h-4" />
              导入 Markdown
            </button>
            <button class="flex items-center justify-center gap-2 text-sm btn-primary" @click="openCreateDictionary">
              <PlusIcon class="w-4 h-4" />
              新建字典
            </button>
          </div>
        </div>
      </div>

      <div v-if="listLoading" class="p-10 text-sm text-center glass-card text-slate-500">
        <ArrowPathIcon class="w-6 h-6 mx-auto mb-2 animate-spin text-accent" />
        正在加载字典...
      </div>

      <div v-else-if="filteredDictionaries.length" class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="dictionary in filteredDictionaries"
          :key="dictionary.id"
          class="p-5 transition-all duration-200 cursor-pointer glass-card group hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
          @click="openDictionaryDetail(dictionary)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <h4 class="font-semibold truncate transition-colors text-slate-800 group-hover:text-accent">
                  {{ dictionary.name }}
                </h4>
                <span
                  :class="['text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap', getDictionaryTypeClass(dictionary.value_type)]"
                >
                  {{ getDictionaryTypeLabel(dictionary.value_type) }}
                </span>
              </div>
              <p class="text-xs truncate text-slate-400">{{ dictionary.code || '未设置编码' }}</p>
            </div>
            <div class="flex items-center gap-1 transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
              <button
                class="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/10"
                @click.stop="openEditDictionary(dictionary)"
              >
                <PencilSquareIcon class="w-4 h-4" />
              </button>
              <button
                class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
                @click.stop="deleteDictionary(dictionary)"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          <p class="text-sm text-slate-500 line-clamp-2 mt-3 min-h-[2.5rem]">
            {{ dictionary.description || '暂无说明' }}
          </p>
          <div class="flex items-center justify-between pt-3 mt-4 text-xs border-t border-slate-100 text-slate-400">
            <span>{{ dictionary.item_count }} 项</span>
            <span>{{ formatTime(dictionary.updated_at) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="p-10 text-center glass-card">
        <div class="flex items-center justify-center mx-auto mb-3 w-14 h-14 rounded-2xl bg-slate-100">
          <BookOpenIcon class="w-7 h-7 text-slate-300" />
        </div>
        <p class="text-sm font-medium text-slate-600">{{ keyword ? '未找到匹配字典' : '暂无字典' }}</p>
        <p class="mt-1 text-xs text-slate-400">新建一个 JSON 对象或数组字典开始使用</p>
      </div>
    </div>

    <div v-else class="space-y-5">
      <div class="p-5 glass-card">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="flex items-start min-w-0 gap-3">
            <button class="btn-secondary px-3 py-2 flex items-center gap-1.5 text-sm" @click="backToList">
              <ChevronLeftIcon class="w-4 h-4" />
            </button>
            <div v-if="selectedDictionary" class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h3 class="font-semibold truncate text-slate-800">{{ selectedDictionary.name }}</h3>
                <span
                  :class="['text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap', getDictionaryTypeClass(selectedDictionary.value_type)]"
                >
                  {{ getDictionaryTypeLabel(selectedDictionary.value_type) }}
                </span>
              </div>
              <p class="mt-1 text-xs truncate text-slate-400">
                {{ selectedDictionary.code || '未设置编码' }} · {{ selectedDictionary.description || '暂无说明' }}
              </p>
            </div>
          </div>
          <div v-if="selectedDictionary" class="flex items-center gap-2">
            <button class="flex items-center gap-2 text-sm btn-secondary" @click="openEditDictionary(selectedDictionary)">
              <PencilSquareIcon class="w-4 h-4" />
              编辑字典
            </button>
            <button class="flex items-center gap-2 text-sm text-red-500 btn-secondary hover:text-red-600 hover:bg-red-50" @click="deleteDictionary(selectedDictionary)">
              <TrashIcon class="w-4 h-4" />
              删除
            </button>
          </div>
        </div>
      </div>

      <div v-if="detailLoading" class="p-10 text-sm text-center glass-card text-slate-500">
        <ArrowPathIcon class="w-6 h-6 mx-auto mb-2 animate-spin text-accent" />
        正在加载详情...
      </div>

      <div v-else-if="!selectedDictionary" class="p-10 text-sm text-center glass-card text-slate-500">
        字典不存在或已被删除
      </div>

      <div v-else-if="selectedDictionary.value_type === 'object'" class="p-5 glass-card">
        <div class="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 class="flex items-center gap-2 font-semibold text-slate-800">
            <DocumentTextIcon class="w-5 h-5 text-accent" />
            对象详情
          </h3>
          <button class="flex items-center justify-center gap-2 text-sm btn-primary" :disabled="saving" @click="openCreateObjectField">
            <PlusIcon class="w-4 h-4" />
            新增字段
          </button>
        </div>

        <div v-if="objectFields.length" class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="field in objectFields"
            :key="field.fieldName"
            class="p-4 border rounded-xl border-slate-200 bg-slate-50 group"
          >
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="min-w-0">
                <div class="font-semibold truncate text-slate-800">{{ field.fieldName }}</div>
                <div class="text-[10px] text-slate-400 mt-1 uppercase">{{ field.fieldType }}</div>
              </div>
              <div class="flex items-center gap-1 transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                <button class="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/10" @click="openEditObjectField(field.fieldName, field.fieldValue)">
                  <PencilSquareIcon class="w-4 h-4" />
                </button>
                <button class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" @click="deleteObjectField(field.fieldName)">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre class="overflow-auto font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-slate-600 max-h-40">{{ formatJsonValue(field.fieldValue) }}</pre>
          </div>
        </div>

        <div v-else class="p-10 text-sm text-center border border-dashed rounded-xl border-slate-200 text-slate-400">
          当前对象没有字段
        </div>
      </div>

      <div v-else-if="selectedDictionary.value_type === 'array'" class="p-5 glass-card">
        <div class="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:justify-between">
          <h3 class="flex items-center gap-2 font-semibold text-slate-800">
            <TableCellsIcon class="w-5 h-5 text-accent" />
            列表明细
          </h3>
          <div class="flex flex-col gap-2 sm:flex-row">
            <select v-model="itemSearchField" class="px-3 py-2 text-sm cursor-pointer glass-input">
              <option value="__all__">全部字段</option>
              <option v-for="fieldName in dynamicFields" :key="fieldName" :value="fieldName">
                {{ fieldName }}
              </option>
            </select>
            <div class="relative sm:w-72">
              <MagnifyingGlassIcon class="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
              <input
                v-model="itemSearchKeyword"
                class="w-full py-2 pr-3 text-sm glass-input pl-9"
                placeholder="搜索列表内容"
                type="text"
              />
            </div>
            <button class="flex items-center justify-center gap-2 text-sm btn-secondary" @click="openColumnSettings">
              <TableCellsIcon class="w-4 h-4" />
              列设置
            </button>
            <button class="flex items-center justify-center gap-2 text-sm btn-primary" :disabled="saving" @click="openCreateArrayRow">
              <PlusIcon class="w-4 h-4" />
              新增
            </button>
          </div>
        </div>

        <ToolHorizontalTable v-if="dynamicFields.length" :ellipsis="true">
          <thead class="text-xs border-b bg-slate-50 text-slate-500 border-slate-200">
              <tr>
                <th v-if="actionColumnPosition === 'left'" class="sticky left-0 z-20 text-left font-medium px-3 py-3 w-28 bg-slate-50 shadow-[8px_0_12px_-12px_rgba(15,23,42,0.35)]">操作</th>
                <th class="px-3 py-3 font-medium text-left w-14">#</th>
                <th v-for="fieldName in dynamicFields" :key="fieldName" class="px-3 py-3 font-medium text-left" :style="getColumnStyle(fieldName)">
                  {{ fieldName }}
                </th>
                <th v-if="actionColumnPosition === 'right'" class="sticky right-0 z-20 text-right font-medium px-3 py-3 w-28 bg-slate-50 shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="row in paginatedArrayRows" :key="row.sourceIndex" class="transition-colors hover:bg-slate-50/70">
                <td v-if="actionColumnPosition === 'left'" class="tool-table-action-cell sticky left-0 z-10 px-3 py-3 bg-white shadow-[8px_0_12px_-12px_rgba(15,23,42,0.35)]">
                  <div class="flex items-center justify-start gap-1">
                    <button class="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50" @click="openArrayRowDetail(row)">
                      <DocumentTextIcon class="w-4 h-4" />
                    </button>
                    <button class="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/10" @click="openEditArrayRow(row)">
                      <PencilSquareIcon class="w-4 h-4" />
                    </button>
                    <button class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" @click="deleteArrayRow(row.sourceIndex)">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td class="px-3 py-3 text-xs text-slate-400">{{ row.sourceIndex + 1 }}</td>
                <td v-for="fieldName in dynamicFields" :key="fieldName" class="px-3 py-3 align-top text-slate-700" :style="getColumnStyle(fieldName)">
                  <span :title="formatJsonValue(row.data[fieldName]) || '-'">{{ formatJsonValue(row.data[fieldName]) || '-' }}</span>
                </td>
                <td v-if="actionColumnPosition === 'right'" class="tool-table-action-cell sticky right-0 z-10 px-3 py-3 bg-white shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]">
                  <div class="flex items-center justify-end gap-1">
                    <button class="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50" @click="openArrayRowDetail(row)">
                      <DocumentTextIcon class="w-4 h-4" />
                    </button>
                    <button class="p-1.5 rounded-lg text-slate-400 hover:text-accent hover:bg-accent/10" @click="openEditArrayRow(row)">
                      <PencilSquareIcon class="w-4 h-4" />
                    </button>
                    <button class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" @click="deleteArrayRow(row.sourceIndex)">
                      <TrashIcon class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          <template #empty>
            <div v-if="!filteredArrayRows.length" class="p-8 text-sm text-center bg-white text-slate-400">
              未找到匹配明细
            </div>
          </template>
          <template #footer>
            <ToolPagination
              v-if="filteredArrayRows.length"
              v-model:page-size="itemPageSize"
              :start="arrayPageStart"
              :end="arrayPageEnd"
              :total="filteredArrayRows.length"
              :current-page="itemCurrentPage"
              :total-pages="totalArrayPages"
              :page-size-options="arrayPageSizeOptions"
              @page-size-change="persistDictionaryMetadata"
              @previous="goToPreviousArrayPage"
              @next="goToNextArrayPage"
            />
          </template>
        </ToolHorizontalTable>

        <div v-else class="p-10 text-sm text-center border border-dashed rounded-xl border-slate-200 text-slate-400">
          当前数组没有对象字段，点击新增开始维护
        </div>
      </div>

      <div v-else class="p-10 text-center glass-card">
        <CodeBracketIcon class="w-10 h-10 mx-auto mb-3 text-red-300" />
        <p class="text-sm font-medium text-slate-600">字典值不是有效 JSON 对象或数组</p>
        <button class="mt-4 text-sm btn-secondary" @click="openEditDictionary(selectedDictionary)">编辑原始 JSON</button>
      </div>
    </div>

    <ToolModal :open="markdownImportModalOpen" title="导入 Markdown 表格" panel-class="w-[92vw] sm:w-[896px]" @close="markdownImportModalOpen = false">
      <template #icon>
        <ArrowUpTrayIcon class="w-5 h-5 text-accent" />
      </template>
        <div class="grid grid-cols-1 gap-3 mb-3 md:grid-cols-2">
          <div>
            <label class="text-slate-500 text-xs block mb-1.5">名称</label>
            <input v-model="markdownImportForm.name" class="w-full px-3 py-2 text-sm glass-input" placeholder="例如：企保产品映射关系" />
          </div>
          <div>
            <label class="text-slate-500 text-xs block mb-1.5">编码</label>
            <input v-model="markdownImportForm.code" class="w-full px-3 py-2 text-sm glass-input" placeholder="例如：enterprise_product_mapping" />
          </div>
        </div>
        <div class="mb-3">
          <label class="text-slate-500 text-xs block mb-1.5">说明</label>
          <input v-model="markdownImportForm.description" class="w-full px-3 py-2 text-sm glass-input" placeholder="字典用途说明" />
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs text-slate-500">Markdown 表格内容</label>
            <span class="text-xs text-slate-400">预览 {{ markdownPreviewRows.length }} 行</span>
          </div>
          <textarea
            v-model="markdownImportForm.content"
            class="glass-input w-full min-h-[320px] p-3 text-sm font-mono resize-y"
            spellcheck="false"
            placeholder="粘贴 temp/企保产品映射关系.md 里的 Markdown 表格内容"
          />
          <p v-if="markdownImportError" class="mt-2 text-xs text-red-500">{{ markdownImportError }}</p>
          <p v-else class="mt-2 text-xs text-slate-400">表头会成为列表字段，每一行会成为一个 JSON 对象。</p>
        </div>
        <template #footer>
          <button class="flex items-center gap-2 text-sm btn-secondary" @click="markdownImportModalOpen = false">
            <XMarkIcon class="w-4 h-4" />
            取消
          </button>
          <button class="flex items-center gap-2 text-sm btn-primary disabled:opacity-50" :disabled="saving" @click="submitMarkdownImport">
            <ArrowPathIcon v-if="saving" class="w-4 h-4 animate-spin" />
            <CheckIcon v-else class="w-4 h-4" />
            导入为字典
          </button>
        </template>
    </ToolModal>

    <ToolModal :open="columnSettingsModalOpen" title="列设置" @close="columnSettingsModalOpen = false">
      <template #icon>
        <TableCellsIcon class="w-5 h-5 text-accent" />
      </template>
        <div class="mb-4">
          <label class="text-slate-500 text-xs block mb-1.5">操作列固定位置</label>
          <div class="inline-flex p-0.5 bg-slate-100 rounded-lg">
            <button
              :class="['text-xs px-3 py-1.5 rounded-md transition-all', actionColumnPosition === 'left' ? 'bg-white text-accent shadow-sm' : 'text-slate-500']"
              @click="updateActionColumnPosition('left')"
            >左侧</button>
            <button
              :class="['text-xs px-3 py-1.5 rounded-md transition-all', actionColumnPosition === 'right' ? 'bg-white text-accent shadow-sm' : 'text-slate-500']"
              @click="updateActionColumnPosition('right')"
            >右侧</button>
          </div>
        </div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-slate-500">字段列宽</span>
          <button class="btn-secondary px-3 py-1.5 text-xs" @click="resetColumnWidths">恢复默认</button>
        </div>
        <div class="space-y-2 max-h-[420px] overflow-auto pr-1">
          <div v-for="fieldName in dynamicFields" :key="fieldName" class="grid grid-cols-[1fr_120px] gap-3 items-center rounded-xl bg-slate-50 border border-slate-200 p-3">
            <div class="text-sm truncate text-slate-700">{{ fieldName }}</div>
            <div class="flex items-center gap-1">
              <input
                v-model.number="columnWidths[fieldName]"
                type="number"
                min="80"
                max="600"
                step="10"
                class="glass-input w-full px-2 py-1.5 text-sm"
                @change="persistDictionaryMetadata"
              />
              <span class="text-xs text-slate-400">px</span>
            </div>
          </div>
        </div>
        <template #footer>
          <button class="flex items-center gap-2 text-sm btn-primary" @click="closeColumnSettings">
            <CheckIcon class="w-4 h-4" />
            完成
          </button>
        </template>
    </ToolModal>

    <ToolModal
      :open="dictionaryModalOpen"
      :title="editingDictionary ? '编辑字典' : '新建字典'"
      panel-class="w-[92vw] sm:w-[1120px] sm:min-w-[760px] min-h-[560px]"
      @close="dictionaryModalOpen = false"
    >
      <template #icon>
        <BookOpenIcon class="w-5 h-5 text-accent" />
      </template>
        <div class="grid grid-cols-1 gap-3 mb-3 md:grid-cols-2">
          <div>
            <label class="text-slate-500 text-xs block mb-1.5">名称</label>
            <input v-model="dictionaryForm.name" class="w-full px-3 py-2 text-sm glass-input" placeholder="例如：状态字典" />
          </div>
          <div>
            <label class="text-slate-500 text-xs block mb-1.5">编码</label>
            <input v-model="dictionaryForm.code" class="w-full px-3 py-2 text-sm glass-input" placeholder="例如：status" />
          </div>
        </div>
        <div class="mb-3">
          <label class="text-slate-500 text-xs block mb-1.5">说明</label>
          <input v-model="dictionaryForm.description" class="w-full px-3 py-2 text-sm glass-input" placeholder="字典用途说明" />
        </div>
        <div>
          <div class="flex flex-col gap-2 mb-2 sm:flex-row sm:items-center sm:justify-between">
            <label class="text-xs text-slate-500">字典值</label>
            <div class="flex flex-wrap items-center gap-1">
              <button
                :class="['text-xs px-2 py-1 rounded-lg transition-colors', dictionaryValueMode === 'form' ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-slate-500 hover:bg-slate-200']"
                @click="switchDictionaryValueMode('form')"
              >表单编辑</button>
              <button
                :class="['text-xs px-2 py-1 rounded-lg transition-colors', dictionaryValueMode === 'json' ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-slate-500 hover:bg-slate-200']"
                @click="switchDictionaryValueMode('json')"
              >JSON 编辑</button>
              <span class="w-px h-5 mx-1 bg-slate-200" />
              <button class="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200" @click="applyObjectTemplate">对象模板</button>
              <button class="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200" @click="applyArrayTemplate">列表模板</button>
            </div>
          </div>

          <div v-if="dictionaryValueMode === 'form' && dictionaryFormValueType === 'object'" class="p-3 space-y-3 border rounded-xl border-slate-200 bg-slate-50">
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-500">对象字段</span>
              <button class="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1" @click="addObjectFormField">
                <PlusIcon class="w-3.5 h-3.5" />
                增加字段
              </button>
            </div>
            <div v-if="objectFormFields.length" class="space-y-2 max-h-[360px] overflow-auto pr-1">
              <div v-for="field in objectFormFields" :key="field.id" class="grid grid-cols-1 md:grid-cols-[180px_1fr_36px] gap-2 items-start">
                <input v-model="field.key" class="px-3 py-2 text-sm glass-input" placeholder="字段名" />
                <textarea v-model="field.value" class="glass-input min-h-[42px] px-3 py-2 text-sm resize-y" placeholder="字段值，支持 JSON 值" />
                <button class="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" @click="removeObjectFormField(field.id)">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div v-else class="p-6 text-xs text-center border border-dashed rounded-xl border-slate-200 text-slate-400">
              暂无字段，点击增加字段开始维护
            </div>
          </div>

          <div v-else-if="dictionaryValueMode === 'form' && dictionaryFormValueType === 'array'" class="p-3 space-y-3 border rounded-xl border-slate-200 bg-slate-50">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span class="text-xs text-slate-500">基础表单字段</span>
                <p class="text-[10px] text-slate-400 mt-0.5">根据数组对象字段生成，可追加新行；完整批量调整可切回 JSON 编辑。</p>
              </div>
              <button class="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1 justify-center" @click="addArrayFormField">
                <PlusIcon class="w-3.5 h-3.5" />
                增加字段
              </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[170px] overflow-auto pr-1">
              <div v-for="field in arrayFormFields" :key="field.id" class="flex items-center gap-2">
                <input v-model="field.key" class="flex-1 px-3 py-2 text-sm glass-input" placeholder="字段名" @change="syncArrayFormSchemaToDictionaryValue" />
                <button class="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" @click="removeArrayFormField(field.id)">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div class="p-3 bg-white border rounded-xl border-slate-200">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-slate-500">新增一行</span>
                <button class="btn-primary px-3 py-1.5 text-xs flex items-center gap-1" @click="appendDictionaryArrayRow">
                  <PlusIcon class="w-3.5 h-3.5" />
                  追加到列表
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[220px] overflow-auto pr-1">
                <div v-for="field in arrayFormFields" :key="field.id">
                  <label class="text-[10px] text-slate-400 block mb-1 truncate">{{ field.key || '未命名字段' }}</label>
                  <input v-model="arrayRowDraft[field.key]" class="w-full px-3 py-2 text-sm glass-input" placeholder="字段值，支持 JSON 值" />
                </div>
              </div>
            </div>
          </div>

          <textarea
            v-else
            v-model="dictionaryForm.value"
            class="glass-input w-full min-h-[260px] p-3 text-sm font-mono resize-y"
            spellcheck="false"
            placeholder="输入 JSON 对象或数组"
          />
          <p v-if="dictionaryFormError" class="mt-2 text-xs text-red-500">{{ dictionaryFormError }}</p>
        </div>
        <template #footer>
          <button class="flex items-center gap-2 text-sm btn-secondary" @click="dictionaryModalOpen = false">
            <XMarkIcon class="w-4 h-4" />
            取消
          </button>
          <button class="flex items-center gap-2 text-sm btn-primary disabled:opacity-50" :disabled="saving" @click="submitDictionary">
            <ArrowPathIcon v-if="saving" class="w-4 h-4 animate-spin" />
            <CheckIcon v-else class="w-4 h-4" />
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </template>
    </ToolModal>

    <ToolModal :open="rowDetailModalOpen" title="明细详情" panel-class="w-[92vw] sm:w-[768px]" @close="rowDetailModalOpen = false">
      <template #icon>
        <DocumentTextIcon class="w-5 h-5 text-accent" />
      </template>
      <div v-if="viewingArrayRow" class="space-y-4">
        <div class="px-3 py-2 text-xs border rounded-xl bg-slate-50 border-slate-200 text-slate-500">
          第 {{ viewingArrayRow.sourceIndex + 1 }} 条记录
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-auto pr-1">
          <div v-for="fieldName in dynamicFields" :key="fieldName" class="p-3 border rounded-xl border-slate-200 bg-slate-50">
            <div class="text-[10px] text-slate-400 mb-1 truncate">{{ fieldName }}</div>
            <pre class="font-mono text-xs leading-relaxed break-words whitespace-pre-wrap text-slate-700">{{ formatJsonValue(viewingArrayRow.data[fieldName]) || '-' }}</pre>
          </div>
        </div>
        <div class="p-3 border rounded-xl border-slate-200 bg-slate-950">
          <div class="mb-2 text-xs text-slate-400">原始 JSON</div>
          <pre class="max-h-[260px] overflow-auto text-xs leading-relaxed text-slate-100 whitespace-pre-wrap break-words font-mono">{{ viewingArrayRowJson }}</pre>
        </div>
      </div>
      <template #footer>
        <button class="flex items-center gap-2 text-sm btn-primary" @click="rowDetailModalOpen = false">
          <CheckIcon class="w-4 h-4" />
          关闭
        </button>
      </template>
    </ToolModal>

    <ToolModal :open="rowModalOpen" :title="editingRowIndex === null ? '新增明细' : '编辑明细'" @close="rowModalOpen = false">
      <template #icon>
        <TableCellsIcon class="w-5 h-5 text-accent" />
      </template>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-slate-500">明细内容</span>
          <div class="flex items-center gap-1">
            <button
              :class="['text-xs px-2 py-1 rounded-lg transition-colors', rowValueMode === 'form' ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-slate-500 hover:bg-slate-200']"
              @click="switchRowValueMode('form')"
            >表单编辑</button>
            <button
              :class="['text-xs px-2 py-1 rounded-lg transition-colors', rowValueMode === 'json' ? 'bg-accent/10 text-accent' : 'bg-slate-100 text-slate-500 hover:bg-slate-200']"
              @click="switchRowValueMode('json')"
            >JSON 编辑</button>
          </div>
        </div>
        <div v-if="rowValueMode === 'form'" class="p-3 space-y-3 border rounded-xl border-slate-200 bg-slate-50">
          <div class="flex items-center justify-between">
            <span class="text-xs text-slate-500">根据列表字段生成基础表单</span>
            <button class="btn-secondary px-3 py-1.5 text-xs flex items-center gap-1" @click="addArrayRowFormField">
              <PlusIcon class="w-3.5 h-3.5" />
              增加字段
            </button>
          </div>
          <div class="space-y-2 max-h-[420px] overflow-auto pr-1">
            <div v-for="field in arrayRowFormFields" :key="field.id" class="grid grid-cols-1 md:grid-cols-[180px_1fr_36px] gap-2 items-start">
              <input v-model="field.key" class="px-3 py-2 text-sm glass-input" placeholder="字段名" />
              <textarea v-model="field.value" class="glass-input min-h-[42px] px-3 py-2 text-sm resize-y" placeholder="字段值，支持 JSON 值" />
              <button class="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50" @click="removeArrayRowFormField(field.id)">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <textarea
          v-else
          v-model="rowForm"
          class="glass-input w-full min-h-[320px] p-3 text-sm font-mono resize-y"
          spellcheck="false"
          placeholder="输入一条 JSON 对象"
        />
        <p v-if="rowFormError" class="mt-2 text-xs text-red-500">{{ rowFormError }}</p>
        <template #footer>
          <button class="flex items-center gap-2 text-sm btn-secondary" @click="rowModalOpen = false">
            <XMarkIcon class="w-4 h-4" />
            取消
          </button>
          <button class="flex items-center gap-2 text-sm btn-primary disabled:opacity-50" :disabled="saving" @click="submitArrayRow">
            <ArrowPathIcon v-if="saving" class="w-4 h-4 animate-spin" />
            <CheckIcon v-else class="w-4 h-4" />
            保存
          </button>
        </template>
    </ToolModal>

    <ToolModal :open="fieldModalOpen" :title="editingFieldName ? '编辑字段' : '新增字段'" panel-class="w-[92vw] sm:w-[576px]" @close="fieldModalOpen = false">
      <template #icon>
        <DocumentTextIcon class="w-5 h-5 text-accent" />
      </template>
        <div class="mb-3">
          <label class="text-slate-500 text-xs block mb-1.5">字段名</label>
          <input v-model="fieldForm.key" class="w-full px-3 py-2 text-sm glass-input" placeholder="例如：label" />
        </div>
        <div>
          <label class="text-slate-500 text-xs block mb-1.5">字段值</label>
          <textarea
            v-model="fieldForm.value"
            class="glass-input w-full min-h-[180px] p-3 text-sm font-mono resize-y"
            spellcheck="false"
            placeholder="支持 JSON 值；普通文本会按字符串保存"
          />
          <p v-if="fieldFormError" class="mt-2 text-xs text-red-500">{{ fieldFormError }}</p>
        </div>
        <template #footer>
          <button class="flex items-center gap-2 text-sm btn-secondary" @click="fieldModalOpen = false">
            <XMarkIcon class="w-4 h-4" />
            取消
          </button>
          <button class="flex items-center gap-2 text-sm btn-primary disabled:opacity-50" :disabled="saving" @click="submitObjectField">
            <ArrowPathIcon v-if="saving" class="w-4 h-4 animate-spin" />
            <CheckIcon v-else class="w-4 h-4" />
            保存
          </button>
        </template>
    </ToolModal>
  </ToolLayout>
</template>