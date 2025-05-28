<template>
  <div class="min-h-screen bg-yellow-50 font-serif">
    <header class="dashboard-header bg-amber-100 border-b-2 border-yellow-300 px-6 py-4 shadow-sm">
      <div class="flex items-center justify-between max-w-4xl mx-auto">
        <div class="site-branding flex items-center space-x-3">
          <div class="site-avatar w-12 h-12 bg-amber-200 rounded-full border-2 border-yellow-400 p-1">
            <img src="./assets/avatar.svg" alt="Profile" class="w-full h-full rounded-full" />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-amber-900 tracking-wide">Echo</h1>
            <p class="text-sm text-amber-700 italic">Personal reflections & thoughts</p>
          </div>
        </div>
        
        <div class="header-stats hidden  md:flex space-x-4 text-amber-800">
          <div class="stat-pill bg-yellow-200 px-3 py-1 rounded-full border border-yellow-400">
            <span class="text-xs font-medium">Posts: {{ entries.length }}</span>
          </div>
          <div class="stat-pill bg-yellow-200 px-3 py-1 rounded-full border border-yellow-400">
            <span class="text-xs font-medium">Locked: {{ lockedPosts }}</span>
          </div>
        </div>
      </div>
    </header>
             
    <main class="main-content-area max-w-4xl mx-auto p-4 space-y-6">
      <section class="notebook-entry-composer bg-amber-50 border-2 border-yellow-300 rounded-lg p-6 shadow-md">
        <div class="entry-header flex items-center space-x-3 mb-4">
          <div class="writer-avatar w-10 h-10 bg-yellow-200 rounded-full border border-yellow-400 p-1">
            <img src="./assets/avatar.svg" alt="Writer" class="w-full h-full rounded-full" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-amber-900">New notebook Entry</h3>
            <p class="text-sm text-amber-700">{{ new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
          </div>
        </div>
      </section>
        
        <div class="writing-area mb-4">
          <textarea 
            v-model="draftInput"
            placeholder="Echo your thinking with texture at the heart of it all."
            class="w-full h-32 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-amber-900 placeholder-amber-600 font-serif leading-relaxed resize-none focus:outline-none focus:border-yellow-500 focus:bg-white"
            style="background-image: repeating-linear-gradient(transparent, transparent 23px, #fbbf24 24px);"
          ></textarea>
        </div>
        
        <div class="entry-controls flex flex-wrap gap-3 items-center">
          <div class="time-lock-setting flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-full border border-yellow-400">
            <label for="unlockTime" class="text-xs font-medium text-amber-800"> Unlock in:</label>
            <input 
              id="unlockTime" 
              type="number" 
              min="1" 
              v-model.number="unlockInMinutes"
              class="w-12 text-center bg-transparent text-amber-900 font-semibold focus:outline-none"
            />
            <span class="text-xs text-amber-700">min</span>
          </div>
          
          <button 
            @click="saveNewEntry"
            class="action-btn bg-amber-200 hover:bg-amber-300 text-amber-900 px-4 py-2 rounded-lg border-2 border-yellow-400 font-medium transition-colors shadow-sm"
          >
             Echo
          </button>
          

        </div>
      
      
      <section class="notebook-entries-feed">
        <div class="feed-header mb-6">
          <h2 class="text-xl font-bold text-amber-900 border-b-2 border-yellow-300 pb-2 inline-block">
             notebook Entries
          </h2>
          <p class="text-sm text-amber-700 mt-1">Your personal reflection timeline</p>
        </div>

        <div class="entries-list space-y-4">
          <div v-if="entries.length === 0" class="empty-state text-center py-12 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-5 shadow-md">
            <div class="empty-illustration text-6xl mb-4"></div>
            <h3 class="text-lg font-semibold text-amber-900 mb-2">No entries yet</h3>
            <p class="text-amber-700">Start your first notebook entry above!</p>
          </div>
          
          <template v-else>
            <article
              v-for="entry in entries"
              :key="entry.id" 
              :class="[
                'notebook-entry bg-yellow-50 border-2 border-yellow-300 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow',
                { 'opacity-75 border-dashed': isEntryLocked(entry.unlockDate) }
              ]"
            >
              <div class="entry-meta flex items-start justify-between mb-3">
                <div class="entry-info flex items-center space-x-3">
                  <div class="entry-avatar w-8 h-8 bg-amber-200 rounded-full border border-yellow-400 p-1">
                    <img src="./assets/avatar.svg" alt="Author" class="w-full h-full rounded-full" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-amber-900">{{ entry.title || 'Untitled Entry' }}</h4>
                    <time class="text-xs text-amber-700">{{ new Date(entry.createdAt).toLocaleDateString() }}</time>
                  </div>
                </div>
                
                <div v-if="isEntryLocked(entry.unlockDate)" class="lock-status text-xs text-amber-600 bg-yellow-200 px-2 py-1 rounded-full border border-yellow-400">
                  <span class="mr-1">🔒</span> Locked
                </div>
              </div>

              <div class="entry-content">
                <div v-if="isEntryLocked(entry.unlockDate)" class="locked-preview text-amber-700">
                  <p class="italic">This entry will unlock soon...</p>
                  <p v-if="entry.unlockDate" class="text-xs mt-1">Available at: {{ new Date(entry.unlockDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
                </div>

                <div v-else class="unlocked-content space-y-3">
                  <div class="original-thought bg-yellow-100 p-3 rounded border border-yellow-300">
                    <p class="text-amber-900 font-serif leading-relaxed">{{ entry.content }}</p>
                  </div>
                  <div v-if="entry.response" class="ai-response bg-amber-100 p-3 rounded border-l-4 border-yellow-500 mt-3">
                    <div class="response-header mb-2">
                      <span class="text-xs font-medium text-amber-800 bg-yellow-200 px-2 py-1 rounded">Echo's Reflection</span>
                    </div>
                    <div class="response-content text-amber-900 prose prose-amber prose-sm" v-html="markedContent(entry.response)"></div>
                  </div>
                  <div v-if="entry.error" class="error-message bg-red-100 border border-red-300 text-red-800 p-3 rounded mt-3">
                    <p class="text-sm">⚠️ {{ entry.error }}</p>
                  </div>
                </div>
              </div>

              <div class="entry-timestamp text-xs text-amber-600 mt-4 pt-2 border-t border-yellow-200"> 
                Created: {{ new Date(entry.createdAt).toLocaleString() }}
              </div>
            </article>
          </template>
        </div>
      </section>
    </main>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { marked } from 'marked';

// Types
interface Entry {
  id: string;
  content: string;
  createdAt: number;
  unlockDate: number | null;
  title?: string;
  response?: string;
  error?: string;
}

interface PromptTokenInfo {
  id: string;
  tokenCount: number;
}

// State
const entries: Ref<Entry[]> = ref([]);
const currentTime: Ref<number> = ref(Date.now());
const draftInput = ref('');
const apiUsageCount = ref(parseInt(localStorage.getItem('apiUsageCount') || '0', 10));
const totalToken = ref(parseInt(localStorage.getItem('totalToken') || '0', 10));
const tokenUsageWarning = ref(false);
const unlockInMinutes = ref(1);
const promptTokens: Ref<PromptTokenInfo[]> = ref([]);

// Computed
const lockedPosts = computed(() => {
  return entries.value.filter(entry => isEntryLocked(entry.unlockDate)).length;
});

// Time management
const isEntryLocked = (unlockDate: number | null): boolean => {
  return Boolean(unlockDate && unlockDate > currentTime.value);
};

let timeUpdateInterval: number;

onMounted(() => {
  loadEntries();
  timeUpdateInterval = window.setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);
});

onBeforeUnmount(() => {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
  }
});

// Helper functions
function countTokens(text: string): number {
  return text.split(/\s+/).length;
}

function generateId(): string {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Entry management
function loadEntries(): void {
  const stored = localStorage.getItem('entries');
  if (stored) {
    try {
      const parsedEntries = JSON.parse(stored) as Entry[];
      entries.value = parsedEntries.map(e => ({
        id: e.id || generateId(),
        content: e.content,
        createdAt: e.createdAt || Date.now(),
        unlockDate: e.unlockDate ?? null,
        title: e.title,
        response: e.response,
        error: e.error,
      }));
    } catch (e) {
      console.error('Failed to parse entries from localStorage', e);
      localStorage.removeItem('entries');
      entries.value = [];
    }
  }
  
  if (entries.value.length === 0) {
    entries.value.push({
      id: generateId(),
      content: 'hi, this is echo, here is where you can echo your thoughts.',
      createdAt: Date.now(),
      unlockDate: Date.now() + 60_000,
      title: 'Welcome',
    });
  }
}

function saveNewEntry(): void {
  if (!draftInput.value.trim()) return;
  
  const now = Date.now();
  entries.value.unshift({
    id: generateId(),
    content: draftInput.value.trim(),
    createdAt: now,
    unlockDate: now + unlockInMinutes.value * 60 * 1000,
    title: '',
    response: '',
    error: ''
  });
  
  localStorage.setItem('entries', JSON.stringify(entries.value));
  draftInput.value = '';
}

// Markdown processing
const markedContent = (text: string): string => {
  return text ? marked(text) : '';
};

// API configuration
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || 'sk-你的金鑰請在.env設置';
const usageLimit = 100;
const tokenWarningThreshold = 2000;

// State variables
const drafts = ref<any[]>([]);
// const tokenUsageWarning = ref(false); // Already declared above

// Draft management functions
function loadDrafts() {
  const stored = localStorage.getItem('drafts');

  if (stored) {
    try {
      drafts.value = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse drafts from localStorage', e);
      localStorage.removeItem('drafts');
      drafts.value = [];
    }
  }
  
  // If no drafts exist, add a sample one
  if (drafts.value.length === 0) {
    drafts.value.push({
      id: generateId(),
      content: 'hi, this is echo, here is where you will echo your thoughts.',
      createdAt: Date.now(),
      unlockDate: Date.now() + 60_000,
      title: 'Welcome',
      response: null,
    });
  }
  
  console.log("🌱 Loaded drafts:", drafts.value);
}

function saveDraft() {
  if (!draftInput.value.trim()) return;
  
  const now = Date.now();
  drafts.value.unshift({  // Add to the beginning of the array for newest first
    id: generateId(),
    content: draftInput.value.trim(),
    createdAt: now,
    unlockDate: now + unlockInMinutes.value * 60 * 1000,
    title: '',
    response: '',
    error: ''
  });
  
  localStorage.setItem('drafts', JSON.stringify(drafts.value));
  draftInput.value = '';
}

// Echo AI processing
async function fetchEcho(entry: Entry, prompt: string): Promise<string> {
  const tokenCount = countTokens(prompt);
  totalToken.value += tokenCount;
  localStorage.setItem('totalToken', totalToken.value.toString());
  promptTokens.value.push({ id: entry.id, tokenCount });

  if (totalToken.value > tokenWarningThreshold) {
    tokenUsageWarning.value = true;
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', 
{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    apiUsageCount.value++;
    localStorage.setItem('apiUsageCount', apiUsageCount.value.toString());

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ API Error:', res.status, data);
      entry.error = `API Error ${res.status}: ${data?.error?.message || 
'Unknown error'}`;
      return '';
    }
    
    // Parse OpenAI response
    console.log("✅ OpenAI response data:", data);
    const reply = data.choices[0].message.content.trim();
    const lines = reply.split(/\r?\n/);
    let title = '', content = '';
    
    if (lines[0].startsWith('標題：')) {
      title = lines[0].replace(/^標題：/, '').trim().slice(0, 10);
      content = lines.slice(1).join('\n').trim();
    } else {
      title = lines[0].trim().slice(0, 10);
      content = lines.slice(1).join('\n').trim();
    }

    entry.title = title;
    entry.response = content;
    entry.error = '';
    return content;

  } catch (err: any) {
    console.error('❌ Echo 錯誤：', err.message);
    entry.error = err.message || 'Echo 呼應失敗（網路錯誤）';
    return '';
  }
}

async function handleEcho() {
  if (apiUsageCount.value >= usageLimit) {
    console.warn('API usage limit reached.');
    alert('You have reached your daily limit for AI responses. Please try again tomorrow.');
    return;
  }

  // Find drafts eligible for processing (unlocked and no response yet)
  const pendingEntries = entries.value.filter(
    entry => entry.unlockDate !== null && currentTime.value >= entry.unlockDate && !entry.response && !entry.error
  );

  if (pendingEntries.length === 0) {
    console.log('No entries ready for processing'); // Updated log
    return;
  }

  for (const entry of pendingEntries) {
    const prompt = `你是 Echo AI，一位富有創意與挑戰精神的反思夥伴。

請針對以下用戶想法提出三種深入分析：
1. 隱含假設（背後未說出的前提）
2. 對立觀點（相反立場、冷門觀點）
3. 延伸發想（跨領域聯想、歷史文化、潛在風險）

用戶的想法是：「${entry.content}」

最後，寫一個十字內的標題，並針對這個標題撰寫一篇一千字以上的深入分析，請用 
Markdown 格式（搭配 H3 標題、列表、粗體字）輸出回應。自然語氣。`;

    const response = await fetchEcho(entry, prompt);
    entry.response = response;
    // drafts.value = [...drafts.value]; // Trigger reactivity // 'drafts' is not used in App.vue, so this line can be removed to prevent potential issues.
    localStorage.setItem('entries', JSON.stringify(entries.value)); // Corrected to 'entries'
    console.log('🚀 Sent to OpenAI:', prompt);
    console.log('🎯 Response saved to entry:', entry.response); // Corrected log
  }
}

// Initial calls for drafts - you might want to call loadEntries() instead if 'entries' is the main data source
onMounted(() => {
  loadEntries(); // Make sure entries are loaded
  loadDrafts(); // If 'drafts' are still relevant for some reason, keep this
  handleEcho(); // Process any pending entries on mount
});

// Added a watcher to trigger handleEcho when currentTime updates and an entry becomes unlocked
// This is an alternative to having handleEcho run on an interval,
// but can be less efficient if you have many entries changing state frequently.
// A simpler approach might be to just call handleEcho on an interval or on user action.
// For now, removing watch and relying on interval/manual trigger.
// If you want continuous processing, consider setting up a dedicated interval for handleEcho.


</script>

<style>
/* Sidebar Styles */
.sidebar-nav {
  margin-bottom: 24px;
}

.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 8px;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #f0f0f0;
}

.nav-item.active .nav-link {
  background-color: #f0eeff;
  color: var(--primary-color);
  font-weight: 600;
}

.nav-icon {
  margin-right: 12px;
  font-size: 18px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-color);
}

.stats-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.stat-item {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 12px;
  flex: 1;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}
</style>