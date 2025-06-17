<script setup>
import { ref, reactive, watch, computed } from 'vue'
// --- CHANGE 1: Import the new runtime assert function ---
// We no longer need the generated `validators.js` file.
import { assert } from './runtime/assert.js'

// --- CHANGE 2: Define the schema directly as a JavaScript object ---
// In a real Mycelial app, this contract would be loaded dynamically.
const userSchema = {
  id: {
    type: 'number',
    isInteger: true,
  },
  username: {
    type: 'string',
    minLength: 3,
    maxLength: 20
  },
  email: {
    type: 'string',
    // We can now use the pattern rule!
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
  },
  status: {
    type: 'string',
    // We can now use the enum rule!
    enum: ['active', 'inactive', 'pending']
  },
  'age?': {
    type: 'number',
    isInteger: true,
    minimum: 18
  },

};

const userWithInvalidStatus = {
    id: 123,
    username: 'myco_user',
    email: 'test@test.com',
    status: 'archived', // This will fail the enum validation
    age: 17
};

try {
    assert(userWithInvalidStatus, userSchema);
} catch(error) {
    console.error(error.message);
    // Expected output: Validation failed for 'status'. Rule 'enum' with argument 'active,inactive,pending' was not satisfied...
}

// --- STATE MANAGEMENT (No changes needed here) ---
const formData = reactive({
  id: null,
  username: '',
  email: '',
  age: null,
  status: 'active',
  userClass: '',
})
const errors = reactive({
  id: '',
  username: '',
  email: '',
  age: '',
  status: '',
  userClass: '',
})
const sanitizedData = ref({})
const showSuccessMessage = ref(false)
const isDataCurrentlyValid = ref(false) // A new ref to track overall validity

// --- COMPUTED PROPERTIES ---
const isFormValid = computed(() => {
  // The submit button is enabled only when the data is valid.
  return isDataCurrentlyValid.value
})

// --- WATCHER FOR REAL-TIME VALIDATION (Major Changes) ---
watch(
  formData,
  (newData) => {
    showSuccessMessage.value = false
    // First, clear all existing errors for a fresh validation run.
    Object.keys(errors).forEach((key) => (errors[key] = ''))

    // --- CHANGE 3: Manual Sanitization (Temporary) ---
    // Since our new runtime doesn't handle transforms yet, we do them here.
    const dataToValidate = {
      ...newData,
      id: newData.id === '' || newData.id === null ? undefined : Number(newData.id),
      age: newData.age === '' || newData.age === null ? undefined : Number(newData.age),
      username: newData.username.trim().toLowerCase(),
      email: newData.email.trim()
    }

    // --- CHANGE 4: Use a try...catch block for validation ---
    // Our new `assert` function throws an error on failure instead of returning an object.
    try {
      // We will add optional logic to the assert function later.
      // For now, we manually delete undefined optional fields.
      if (dataToValidate.age === undefined) {
        delete dataToValidate.age
      }

      // Run the validation!
      assert(dataToValidate, userSchema)

      // If we get here, validation passed!
      isDataCurrentlyValid.value = true
      sanitizedData.value = dataToValidate
    } catch (error) {
      // If we get here, validation failed.
      isDataCurrentlyValid.value = false
      sanitizedData.value = { error: 'Form data is currently invalid.' }

      // Parse the error message to update the UI.
      // This is a bit brittle but works with our current error format.
      const match = error.message.match(/Validation failed for '([^']*)'/);
      if (match && match[1]) {
        const propertyName = match[1];
        if (errors.hasOwnProperty(propertyName)) {
          // A more user-friendly message could be crafted here.
          errors[propertyName] = error.message;
        }
      }
    }
  },
  { deep: true, immediate: true }
)

// --- METHODS (No changes needed here) ---
const handleRegister = () => {
  if (!isFormValid.value) {
    console.warn('Attempted to submit an invalid form.')
    return
  }
  console.log('Form Submitted!', sanitizedData.value)
  showSuccessMessage.value = true
  Object.assign(formData, {
    id: null,
    username: '',
    email: '',
    age: null,
    status: 'active',
    userClass: '',
  })
  isDataCurrentlyValid.value = false
}
</script>

<template>
  <div class="main-container">
    <!-- Registration Form -->
    <div class="form-card">
      <h1 class="form-heading">Create Account</h1>
      <p class="form-subheading">Fill in the details below to create your user account.</p>

      <form @submit.prevent="handleRegister" novalidate class="form-grid">
        <!-- ID -->
        <div class="form-group">
          <label for="id" class="form-label">User ID</label>
          <p class="form-hint">Required. Unique identifier (number).</p>
          <input
            v-model="formData.id"
            type="number"
            id="id"
            class="input-field"
            :class="{ 'input-field-error': errors.id }"
            placeholder="e.g., 12345"
          />
          <p v-if="errors.id" class="error-text">{{ errors.id }}</p>
        </div>

        <!-- Username -->
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <p class="form-hint">Between 3 and 20 characters.</p>
          <input
            v-model="formData.username"
            type="text"
            id="username"
            class="input-field"
            :class="{ 'input-field-error': errors.username }"
            placeholder="e.g., jane_doe"
          />
          <p v-if="errors.username" class="error-text">{{ errors.username }}</p>
        </div>

        <!-- Email -->
        <div class="form-group full-width">
          <label for="email" class="form-label">Email Address</label>
          <p class="form-hint">Must be a valid email format.</p>
          <input
            v-model="formData.email"
            type="email"
            id="email"
            class="input-field"
            :class="{ 'input-field-error': errors.email }"
            placeholder="e.g., user@company.com"
          />
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
        </div>

        <!-- Age (Optional) -->
        <div class="form-group">
          <label for="age" class="form-label">Age</label>
          <p class="form-hint">Optional. Must be 18 or older.</p>
          <input
            v-model="formData.age"
            type="number"
            id="age"
            class="input-field"
            :class="{ 'input-field-error': errors.age }"
            placeholder="e.g., 25"
          />
          <p v-if="errors.age" class="error-text">{{ errors.age }}</p>
        </div>

        <!-- Status -->
        <div class="form-group">
          <label for="status" class="form-label">Account Status</label>
          <p class="form-hint">Current status of the user account.</p>
          <div class="select-wrapper">
            <select
              v-model="formData.status"
              id="status"
              class="input-field select-field"
              :class="{ 'input-field-error': errors.status }"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <span class="select-arrow"></span>
          </div>
          <p v-if="errors.status" class="error-text">{{ errors.status }}</p>
        </div>

        <!-- User Class -->
        <div class="form-group full-width">
          <label for="userClass" class="form-label">User Class</label>
          <p class="form-hint">Required. Must start with 'class-'.</p>
          <input
            v-model="formData.userClass"
            type="text"
            id="userClass"
            class="input-field"
            :class="{ 'input-field-error': errors.userClass }"
            placeholder="e.g., class-Gold"
          />
          <p v-if="errors.userClass" class="error-text">{{ errors.userClass }}</p>
        </div>

        <div class="form-actions full-width">
          <button type="submit" class="submit-button" :disabled="!isFormValid">
            Create Account
          </button>
        </div>
      </form>
    </div>

    <!-- Live Data Preview & Success Message -->
    <div class="preview-card">
      <h2 class="preview-heading">Live Data Preview</h2>
      <div class="json-preview-wrapper">
        <pre class="json-preview">{{ JSON.stringify(sanitizedData, null, 2) }}</pre>
      </div>

      <Transition name="fade-slide">
        <div v-if="showSuccessMessage" class="success-message">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="success-icon"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <div>
            <p class="success-title">Account Created!</p>
            <p class="success-text">Your user account has been successfully registered.</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped lang="css">
/* Custom Accent, Error, Success (high contrast, not directly from base.css) */
/* These remain custom to ensure visual distinctiveness and contrast */
:root {
  --accent-color: #6a0dad; /* A vibrant purple */
  --accent-color-hover: #5a099a; /* Slightly darker purple on hover */

  --error-color: #ff6b6b; /* Brighter red for errors */
  --error-bg: rgba(255, 107, 107, 0.1);

  --success-color: #6bff6b; /* Brighter green for success */
  --success-bg: rgba(107, 255, 107, 0.1);

  /* Shadows (custom, for depth and separation) */
  --shadow-color: rgba(0, 0, 0, 0.3);
  --light-shadow-color: rgba(0, 0, 0, 0.15);

  /* Input background, slightly darker than card-background */
  --input-background-custom: var(--vt-c-black-mute); /* Using vt-c-black-mute from base.css */
}

/* Global/Base Styles now directly use base.css variables */
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-width: 100vw;
  padding: 3rem 1.5rem;
  background-color: var(--color-background); /* Directly uses base.css background */
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  color: var(--color-heading); /* Directly uses base.css heading color for main text */
  gap: 3.5rem;
}

@media (min-width: 1024px) {
  .main-container {
    flex-direction: row;
    align-items: flex-start;
    /* Use padding-inline for horizontal padding to match real estate usage */
    padding: 4rem 8vw; /* Increased horizontal padding for more real estate */
    gap: 4rem; /* Adjusted gap between the two columns */
  }
}

/* Card Styles */
.form-card,
.preview-card {
  background-color: var(--color-background-soft); /* Directly uses base.css soft background */
  border-radius: 0.8rem;
  box-shadow:
    0 15px 30px -5px var(--shadow-color),
    0 6px 12px -3px var(--light-shadow-color);
  padding: 3rem 2.5rem;
  width: 100%; /* Default to full width for small screens */
  max-width: 55rem;
  border: 1px solid var(--color-border); /* Directly uses base.css border */
  transition: all 0.3s ease-in-out;
}

@media (min-width: 1024px) {
  .form-card,
  .preview-card {
    flex: 1; /* Make them take equal width */
    max-width: calc(50% - 2rem); /* Calculate max-width for equal distribution with gap */
    width: auto; /* Allow flex to control width */
  }
}

/* Headings */
.form-heading {
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  color: var(--color-heading); /* Directly uses base.css heading color */
  margin-bottom: 0.75rem;
  letter-spacing: -0.05em;
}

.form-subheading {
  font-size: 1.15rem;
  color: var(--color-text); /* Directly uses base.css text color */
  text-align: center;
  margin-bottom: 3rem;
}

.preview-heading {
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-heading); /* Directly uses base.css heading color */
  margin-bottom: 1.8rem;
}

/* Form Grid Layout */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.75rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-group.full-width {
  grid-column: 1 / -1;
}

/* Labels and Hints */
.form-label {
  display: block;
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--color-heading); /* Directly uses base.css heading color */
  margin-bottom: 0.3rem;
}

.form-hint {
  font-size: 0.88rem;
  color: var(--color-text); /* Directly uses base.css text color */
  margin-bottom: 0.8rem;
}

/* Inputs and Selects */
.input-field {
  display: block;
  width: 100%;
  padding: 0.8rem 1.1rem;
  border: 1px solid var(--color-border); /* Directly uses base.css border */
  background-color: var(--input-background-custom); /* Uses custom input background */
  border-radius: 0.6rem;
  color: var(--color-heading); /* Directly uses base.css heading color */
  font-size: 1rem;
  transition: all 0.2s ease-in-out;
  outline: none;
}

.input-field::placeholder {
  color: var(--color-text); /* Directly uses base.css text color */
  opacity: 0.8;
}

.input-field:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(106, 13, 173, 0.5);
}

.input-field-error {
  border-color: var(--error-color);
  background-color: var(--error-bg);
}

.input-field-error:focus {
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.5);
  border-color: var(--error-color);
}

/* Specific for Select Field */
.select-wrapper {
  position: relative;
}

.select-field {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding-right: 2.75rem;
}

.select-arrow {
  position: absolute;
  right: 1.1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid var(--color-text); /* Directly uses base.css text color */
  pointer-events: none;
}

/* Error Text */
.error-text {
  color: var(--error-color);
  font-size: 0.85rem;
  margin-top: 0.6rem;
  font-weight: 500;
}

/* Submit Button */
.form-actions {
  grid-column: 1 / -1;
  margin-top: 1.5rem;
}

.submit-button {
  width: 100%;
  padding: 1rem 2.5rem;
  border-radius: 0.6rem;
  color: var(--color-background); /* Directly uses base.css heading color */
  font-weight: 600;
  font-size: 1.15rem;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 3px 6px var(--light-shadow-color);
  border: 1px solid var(--accent-color);
  background-color: var(--color-heading);
  cursor: pointer;
}

.submit-button:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px var(--shadow-color);
}

.submit-button:not(:disabled):active {
  transform: translateY(0);
}

.submit-button:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(106, 13, 173, 0.6);
}

.submit-button:disabled {
  background-color: var(--color-border); /* Directly uses base.css border color */
  border-color: var(--color-border);
  color: var(--color-text); /* Directly uses base.css text color */
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

/* JSON Preview */
.json-preview-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.json-preview {
  background-color: var(--input-background-custom); /* Uses custom input background */
  color: var(--color-heading); /* Directly uses base.css heading color */
  padding: 1.5rem;
  border-radius: 0.6rem;
  font-family: 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.85rem;
  white-space: pre-wrap;
  overflow: auto;
  max-height: 450px;
  border: 1px dashed var(--color-border); /* Directly uses base.css border */
  flex-grow: 1;
}

/* Success Message */
.success-message {
  margin-top: 2.5rem;
  padding: 1.5rem;
  background-color: var(--success-bg);
  border: 1px solid var(--success-color);
  color: var(--success-color);
  border-radius: 0.6rem;
  box-shadow:
    0 5px 10px -2px var(--light-shadow-color),
    0 2px 4px -1px var(--light-shadow-color);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.success-icon {
  height: 2rem;
  width: 2rem;
  color: var(--success-color);
  flex-shrink: 0;
  margin-top: 0.2rem;
}

.success-title {
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--color-heading); /* Directly uses base.css heading color */
}

.success-text {
  font-size: 0.9rem;
  margin-top: 0.3rem;
  color: var(--color-text); /* Directly uses base.css text color */
}

/* Vue Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Custom scrollbar styles */
.json-preview::-webkit-scrollbar {
  width: 10px;
}

.json-preview::-webkit-scrollbar-track {
  background: var(--color-background); /* Directly uses base.css primary background */
  border-radius: 10px;
}

.json-preview::-webkit-scrollbar-thumb {
  background: var(--color-border); /* Directly uses base.css border color */
  border-radius: 10px;
}

.json-preview::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-hover); /* Directly uses base.css border hover color */
}
</style>
