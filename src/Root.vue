<template>
    <Suspense>
      <template #default>
        <App />
      </template>
      <template #fallback>
        <div>載入中...</div>
      </template>
    </Suspense>
  </template>
  
  <script setup>
  import App from './App.vue'
  </script>