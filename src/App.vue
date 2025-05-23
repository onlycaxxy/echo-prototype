<template>
  <main class="app-container">
    <!-- 輸入區 -->
    <section class="input-section">
      <textarea v-model="draftInput" placeholder="輸入你的想法..."></textarea>
      <button @click="handleEcho">Echo AI</button>
      <button @click="saveDraft">儲存草稿</button>
    </section>

    <!-- 解鎖等待時間設定 -->
    <div class="flex items-center space-x-2">
      <label for="unlockTime">幾分鐘後解鎖：</label>
      <input
        id="unlockTime"
        type="number"
        min="1"
        v-model.number="unlockInMinutes"
        class="border rounded p-1 w-16"
      />
      <span>分鐘</span>
    </div>

    <!-- 草稿區 -->
    <section class="drafts">
      <h2>草稿列表</h2>
      <ul>
        <li v-for="(entry, index) in drafts" :key="entry.id ?? index">
          <div v-if="entry.unlockDate && entry.unlockDate > Date.now()">
          <p>內容：⏳ awaiting..ZzZ</p>
          <p>unlock time:{{ formatTime(entry.unlockDate) }}</p>
          <p>time remain:{{ countdown(entry.unlockDate) }}</p>
          </div>
          <div v-else>
          <div class="content">✏️ {{ entry.content }}</div>

          <div class="response" v-if="entry.response" v-html="marked(entry.response)"></div> 
          <p v-if="entry.error" style="color: red;">⚠️ 錯誤：{{ entry.error }}</p>
          </div>
        </li>
      </ul>
     <pre>{{ JSON.stringify(drafts, null, 2) }}</pre>
    </section>
  </main>
</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { marked } from 'marked'
marked.setOptions({ breaks: true })

// 設定 API 金鑰與相關常數
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || 'sk-你的金鑰請在.env設置'
const usageLimit = 100
const tokenWarningThreshold = 2000

// 狀態變數
const drafts = ref<any[]>([])
const draftInput = ref('')
const apiUsageCount = ref(parseInt(localStorage.getItem('apiUsageCount') || '0', 10))
const totalToken = ref(parseInt(localStorage.getItem('totalToken') || '0', 10))
const tokenUsageWarning = ref(false)
const unlockInMinutes = ref(1) // 預設為 1 分鐘後解鎖
const promptTokens = ref([])

const entry = ref<any>({})
const prompt = ref('')
let echoInterval: ReturnType<typeof setInterval> | null = null
let isHandling = false

Object.assign(entry.value, { response: '' })

onMounted(() => {
  echoInterval = setInterval(() => {
    handleEcho()
  }, 60000)

  // 預設進來也執行一次
  handleEcho()
})

onBeforeUnmount(() => {
  if (echoInterval) {
    clearInterval(echoInterval)
    console.log('Component unmounting, echo interval cleared.')
  }
})

function countTokens(text: string): number {
  return text.split(/\s+/).length
}
function formatTime(t: number) {
  const date = new Date(t)
  return date.toLocaleTimeString()
}
function countdown(t: number) {
  const now = Date.now()
  const diff = Math.max(0, t - now)
  const mins = Math.floor(diff / 60000)
  const secs = Math.floor((diff % 60000) / 1000)
  return `${mins} 分 ${secs} 秒`
}
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9)
}

// 載入草稿
function loadDrafts() {
  const stored = localStorage.getItem('drafts')

  drafts.value.push({
  content: '測試草稿',
  createdAt: Date.now(),
  unlockAt: Date.now() + 60_000,
  response: null, 
 })
  console.log("🌱 Loaded drafts:", drafts.value)

  if (stored) {
    try {
      drafts.value = JSON.parse(stored)
    } catch (e) {
      console.error('Failed to parse drafts from localStorage', e)
      localStorage.removeItem('drafts')
      drafts.value = []
    }
  }
}

// 儲存草稿
function saveDraft() {
  if (!draftInput.value.trim()) return
  const now = Date.now()
  drafts.value.push({
    id: generateId(),
    content: draftInput.value.trim(),
    createdAt: now,
    unlockDate: now + unlockInMinutes.value * 60 * 1000,
    title: '',
    response: '',
    error: ''
  })
  localStorage.setItem('drafts', JSON.stringify(drafts.value))
  draftInput.value = ''
}

// 一個任務工人一隻信鴿送信，專門去幫你「把草稿送出去給 OpenAI 的 API，然後把結果拿回來」
async function fetchEcho(entry: any, prompt: string): Promise<string> {
  const tokenCount = countTokens(prompt)
  totalToken.value += tokenCount
  localStorage.setItem('totalToken', totalToken.value.toString())
promptTokens.value.push({ id: entry.id, tokenCount })


  if (totalToken.value > tokenWarningThreshold) {
    tokenUsageWarning.value = true
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      })
    })

    apiUsageCount.value++
    localStorage.setItem('apiUsageCount', apiUsageCount.value.toString())

    const data = await res.json()

    if (!res.ok) {
    console.error('❌ API Error:', res.status, data)
    entry.error = `API Error ${res.status}: ${data?.error?.message || 'Unknown error'}`
    return ''
  }
    

  // 拆開openai回信的內容，response json是格式。得到message的content之後，分出標題和內容
    console.log("✅ OpenAI response data:", data)
    const reply = data.choices[0].message.content.trim()
    const lines = reply.split(/\r?\n/)
    let title = '', content = ''
    if (lines[0].startsWith('標題：')) {
      title = lines[0].replace(/^標題：/, '').trim().slice(0, 10)
      content = lines.slice(1).join('\n').trim()
    } else {
      title = lines[0].trim().slice(0, 10)
      content = lines.slice(1).join('\n').trim()
    }

    entry.title = title
    entry.response = content
    entry.error = ''
    return content

  } catch (err: any) {
    console.error('❌ Echo 錯誤：', err.message)
    entry.error = err.message || 'Echo 呼應失敗（網路錯誤）'
    return ''
  }
}

// 這是「指揮官」，負責叫那隻信鴿（fetchEcho）出去。
async function handleEcho() {
  if (apiUsageCount.value >= usageLimit) {
    console.warn('API usage limit reached.')
    alert('你今天超過限制了，請稍後再試')
    return
  }


// 從草稿中找可以送出去的草稿，
  const pendingDrafts = drafts.value.filter(
    entry => Date.now() >= entry.unlockDate && !entry.response && !entry.error
  )
  if (pendingDrafts.length === 0) {
    console.log('目前無可回應的草稿')
    return
  }

  for (const entry of pendingDrafts) {
    const prompt = `你是 Echo AI，一位富有創意與挑戰精神的反思夥伴。

請針對以下用戶想法提出三種深入分析：
1. 隱含假設（背後未說出的前提）
2. 對立觀點（相反立場、冷門觀點）
3. 延伸發想（跨領域聯想、歷史文化、潛在風險）

用戶的想法是：「${entry.content}」

最後，寫一個十字內的標題，並針對這個標題撰寫一篇一千字以上的深入分析，請用 Markdown 格式（搭配 H3 標題、列表、粗體字）輸出回應。自然語氣。`

  
    const response = await fetchEcho(entry, prompt)
    entry.response = response 
    drafts.value = [...drafts.value]
    localStorage.setItem('drafts', JSON.stringify(drafts.value))
    console.log('🚀 Sending to OpenAI:', prompt)
    const currentPromptTokenCount = countTokens(prompt);
    console.log('🎯 回應結果寫入草稿：', entry.response)
    console.log('📏 Token count:', currentPromptTokenCount);
  }
}




</script>


<style scoped>
.response {
  background-color: #f9f9fc;
  border-left: 4px solid #6699ff;
  padding: 1rem;
  border-radius: 0.75rem;
  font-family: 'Noto Sans TC', sans-serif;
  font-size: 1rem;
  margin-top: 1rem;
  line-height: 1.8;
}

.response :deep(p) {
  margin: 0.75rem 0;
}
.response :deep(h1),
.response :deep(h2),
.response :deep(h3),
.response :deep(h4) {
  font-weight: bold;
  margin-top: 1rem;
  color: #333;
}
.response :deep(ul) {
  list-style: disc;
  padding-left: 1.5rem;
}
.response :deep(li) {
  margin-bottom: 0.5rem;
}
</style>