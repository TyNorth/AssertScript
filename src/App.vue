<script setup>
import { validateUser, validateProduct } from './validators.js'

// ... (keep the other test data) ...

// --- NEW TEST CASE ---
const userWithoutBio = {
  id: 3,
  username: 'optional_user',
  email: 'optional@vue.dev',
  isAdmin: false,
  // 'bio' property is missing, which is now okay!
}

let validationResult3 = ''
try {
  validateUser(userWithoutBio)
  validationResult3 = '✅ userWithoutBio passed validation!'
} catch (e) {
  validationResult3 = `❌ userWithoutBio failed: ${e.message}`
}

// --- NESTED OBJECT TEST CASES ---
const validProduct = {
  productId: 'abc-123',
  price: 29.99,
  seller: {
    sellerId: 42,
    companyName: 'Vue Goods Inc.',
    // isVerified is optional, so it's okay to omit
  },
}

const invalidProduct = {
  productId: 'def-456',
  price: 99.99,
  seller: {
    sellerId: 'should-be-a-number', // <-- The error is nested deep inside
    companyName: 'Faulty Wares Co.',
  },
}

let validationResult4 = ''
try {
  validateProduct(validProduct)
  validationResult4 = '✅ validProduct passed validation!'
} catch (e) {
  validationResult4 = `❌ validProduct failed: ${e.message}`
}

let validationResult5 = ''
try {
  validateProduct(invalidProduct)
  validationResult5 = `❌ invalidProduct failed: ${e.message}`
} catch (e) {
  validationResult5 = `❌ invalidProduct failed: ${e.message}`
}
</script>

<template>
  <div class="card">
    <p>
      <strong>Test 3 (Optional Property):</strong>
      <br />
      <code>{{ validationResult3 }}</code>
    </p>
    <p>
      <strong>Test 4 (Valid Nested Object):</strong>
      <br />
      <code>{{ validationResult4 }}</code>
    </p>
    <p>
      <strong>Test 5 (Invalid Nested Object):</strong>
      <br />
      <code>{{ validationResult5 }}</code>
    </p>
  </div>
</template>

<style scoped>
/* ... (styles remain the same) ... */
</style>
