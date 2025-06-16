<script setup>
import { validateUser } from './validators.js'

const tests = {
  'Valid User': {
    data: { id: 1, username: 'testuser', email: 'test@example.com', status: 'active' },
    result: '',
  },
  'Invalid Username (too short)': {
    data: { id: 2, username: 'a', email: 'test@example.com', status: 'active' },
    result: '',
  },
  'Invalid Email (bad format)': {
    data: { id: 3, username: 'gooduser', email: 'bad-email', status: 'active' },
    result: '',
  },
  'Invalid Age (too young)': {
    data: { id: 4, username: 'gooduser', email: 'test@example.com', status: 'active', age: 17 },
    result: '',
  },
  'Invalid Status (not in enum)': {
    data: { id: 5, username: 'gooduser', email: 'test@example.com', status: 'archived' },
    result: '',
  },
}

for (const testName in tests) {
  try {
    validateUser(tests[testName].data)
    tests[testName].result = '✅ Passed validation!'
  } catch (e) {
    tests[testName].result = `❌ Failed: ${e.message}`
  }
}
</script>

<template>
  <div class="card">
    <h1>Assertify Content Validation</h1>
    <div v-for="(test, name) in tests" :key="name" class="test-case">
      <p>
        <strong>{{ name }}</strong>
      </p>
      <code>{{ test.result }}</code>
    </div>
  </div>
</template>

<style scoped>
.card {
  font-family: sans-serif;
  color: black;
  padding: 1rem;
  margin: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}
.test-case {
  margin-bottom: 1rem;
}
code {
  background-color: #e0e0e0;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  display: block;
  margin-top: 0.25rem;
}
</style>
