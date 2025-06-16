# Assertify

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, zero-dependency, runtime validation library powered by code generation. Define your data shapes in a simple JSON file and Assertify generates highly-optimized validation functions and TypeScript definitions automatically.

---

## Overview

Assertify solves the problem of wanting type-safety in JavaScript without the overhead of a full TypeScript compilation step. It provides runtime guarantees that your data structures are correct, which is essential for validating API responses, form data, and function arguments.

The core workflow is simple:

1. **Define:** You declare all your data shapes in a single `types.json` file.
2. **Generate:** Run the Assertify Node.js script to automatically generate `validators.js` and `validators.d.ts` files.
3. **Assert:** Import the generated functions into your application to perform fast, precise, and descriptive runtime assertions.

## Features

- **Zero Production Dependencies:** The generated validation code is pure, vanilla JavaScript.
- **TypeScript Declaration Generation:** Get full autocompletion and type-checking in your editor (like VS Code) for free, even in a `.js` project.
- **Rich Validation Rules:** Go beyond simple `typeof` checks with content-based rules.
- **Watch Mode:** Automatically regenerates validators and types whenever your schema changes.
- **Robust CLI:** A professional command-line interface for easy use.
- **Testable:** Built with a testing suite to ensure reliability.

## Setup & Usage

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

4. **Run Tests:** To ensure all generator logic is working correctly:

   ```bash
   npm test
   ```

## CLI Commands

The generator script `generate-validators.cjs` can be run with the following flags:

| Flag      | Alias | Description                                                      |
| --------- | ----- | ---------------------------------------------------------------- |
| `--watch` | `-w`  | Enables watch mode to automatically regenerate on file changes.  |
| `--dts`   | `-d`  | Generates the corresponding `.d.ts` TypeScript declaration file. |
| `--help`  | `-h`  | Displays the help menu with all available options.               |

## Schema Definition Guide (`types.json`)

This is the API for defining your data shapes.

### Basic Types & Required Properties

By default, all properties are required.

```json
"MyType": {
  "id": { "type": "number" },
  "name": { "type": "string" },
  "isActive": { "type": "boolean" },
  "tags": { "type": "array" }
}
```

### Optional Properties

Add a `?` to the end of a property name to make it optional.

```json
"UserProfile": {
  "userId": { "type": "number" },
  "bio?": { "type": "string" }
}
```

### Nested Types (Composition)

Reference another type by using its name as the `type`.

```json
"Product": {
  "productId": { "type": "string" },
  "seller": { "type": "Seller" }
},
"Seller": {
  "sellerId": { "type": "number" }
}
```

### Content Validation Rules

| Rule        | Type     | Description                                          |
| ----------- | -------- | ---------------------------------------------------- |
| `minLength` | `string` | The minimum number of characters.                    |
| `maxLength` | `string` | The maximum number of characters.                    |
| `pattern`   | `string` | A regular expression string the value must match.    |
| `min`       | `number` | The minimum numeric value.                           |
| `max`       | `number` | The maximum numeric value.                           |
| `enum`      | `string` | An array of specific string values that are allowed. |

**Example:**

```json
"User": {
  "username": {
    "type": "string",
    "minLength": 3,
    "maxLength": 20
  },
  "email": {
    "type": "string",
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
  },
  "age?": {
    "type": "number",
    "min": 18
  },
  "status": {
    "type": "string",
    "enum": ["active", "inactive", "pending"]
  }
}
```

## License

This project is licensed under the MIT License.
