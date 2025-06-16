# AssertScript

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/actions)
[![NPM Version](https://img.shields.io/npm/v/@simdev01/assertscript)](https://www.npmjs.com/package/@simdev01/assertscript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, zero-dependency, runtime validation library powered by code generation. Define your data shapes in a simple JSON file and AssertScript generates highly-optimized validation and sanitization functions, plus TypeScript definitions automatically.

---

## Overview

AssertScript solves the problem of wanting type-safety in JavaScript without the overhead of a full TypeScript compilation step. It provides runtime guarantees that your data structures are correct, which is essential for validating API responses, form data, and function arguments.

The core workflow is simple:

1. **Define:** You declare all your data shapes and rules in a single `types.json` file.
2. **Generate:** Run the AssertScript Node.js script to automatically generate `validators.js` and `validators.d.ts` files.
3. **Assert or Validate:** Import the generated functions into your application to perform fast, precise, and descriptive runtime validation.

## Features

- **Zero Production Dependencies:** The generated validation code is pure, vanilla JavaScript.
- **Dual-Mode Operation:** Functions can fail-fast by throwing errors (assertion) or return a detailed result object (verbose validation).
- **Data Sanitization:** Automatically cleans and transforms data (e.g., trims whitespace, converts strings to numbers) based on schema rules.
- **Rich Validation Rules:** Go beyond simple `typeof` checks with powerful content-based rules.
- **TypeScript Declaration Generation:** Get full autocompletion and type-checking in your editor (like VS Code) for free, even in a `.js` project.
- **Watch Mode:** Automatically regenerates validators and types whenever your schema changes.
- **Robust CLI:** A professional command-line interface for easy use.

## Setup

1. **Install dependencies:** This project uses a few development dependencies for code generation and testing.

   ```bash
   npm install
   ```

2. **Define Your Types:** Edit the `types.json` file to define your data structures according to the guide below.
3. **Generate Validators:** Run one of the following commands:

   ```bash
   # Generate validators once
   npm run generate

   # Generate validators and the .d.ts file for type-safety
   npm run generate:dts

   # Start watch mode for automatic regeneration on save
   npm run watch
   ```

## Usage

Each validator can be used in two modes, chosen at runtime.

#### Assertion Mode (Default)

Ideal for backend services or critical paths where you want to fail fast. It throws a descriptive error on the first validation failure.

```javascript
import { validateUser } from './validators.js'

const badUserData = { id: 1, username: 'a' } // Username is too short

try {
  validateUser(badUserData)
  // This line will not be reached
} catch (error) {
  console.error(error.message)
  // Output: "Validation failed for User.username: must be at least 3 characters long."
}
```

#### Verbose Mode

Pass `{ verbose: true }` as the second argument. This mode never throws. It's perfect for UI form validation where you want to collect all errors at once.

The function returns an object: `{ isValid: boolean, errors: Array, value: object }`.

```javascript
import { validateUser } from './validators.js'

const formInput = { id: 1, username: 'a', email: 'bad-email' }
const result = validateUser(formInput, { verbose: true })

if (!result.isValid) {
  console.log('Please fix the following errors:')
  for (const err of result.errors) {
    // err is an object: { property: 'username', rule: 'minLength', message: '...' }
    console.log(`- ${err.property}: ${err.message}`)
  }
} else {
  // The 'value' property contains the cleaned and sanitized data
  const sanitizedUser = result.value
  // ... do something with the safe data
}
```

## Schema Definition Guide (`types.json`)

This is the API for defining your data shapes.

#### Basic Types & Optional Properties

By default, all properties are required. Add a `?` to a property name to make it optional.

```json
"MyType": {
  "id": { "type": "number" },
  "name": { "type": "string" },
  "isActive": { "type": "boolean" },
  "notes?": { "type": "string" }
}
```

#### Nested Types (Composition)

Reference another type by using its name as the `type`.

```json
"Product": {
  "productId": { "type": "string" },
  "seller": { "type": "Seller" }
}
```

#### Content Validation Rules

| Rule         | Type     | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| `minLength`  | `string` | The minimum number of characters.                    |
| `maxLength`  | `string` | The maximum number of characters.                    |
| `pattern`    | `string` | A regular expression string the value must match.    |
| `min`        | `number` | The minimum numeric value.                           |
| `max`        | `number` | The maximum numeric value.                           |
| `enum`       | `string` | An array of specific string values that are allowed. |
| `isInteger`  | `number` | Value must be a whole number.                        |
| `startsWith` | `string` | Value must start with the given substring.           |

#### Advanced Array Validation

You can specify rules for the array itself (`minLength`) and for the `items` within it.

```json
"Product": {
  "tags": {
    "type": "array",
    "minLength": 1,
    "items": {
      "type": "string",
      "minLength": 2
    }
  }
}
```

#### Sanitization & Transformation

Use the `transform` array to clean and process data _before_ it's validated.

| Transform     | Description                          |
| ------------- | ------------------------------------ |
| `trim`        | Removes leading/trailing whitespace. |
| `toLowerCase` | Converts the string to lowercase.    |
| `toUpperCase` | Converts the string to uppercase.    |
| `toInt`       | Parses the value into an integer.    |

**Example:**

```json
"User": {
  "username": {
    "type": "string",
    "minLength": 3,
    "transform": ["trim", "toLowerCase"]
  },
  "id_from_url": {
    "type": "string",
    "transform": ["toInt"]
  }
}
```

## License

This project is licensed under the MIT License.
