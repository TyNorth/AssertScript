// Use ESM `import` for Vitest, which is required.
import { describe, it, expect } from 'vitest'

// Use ESM `import` to bring in our CommonJS module.
// The `module.exports` object from the .cjs file becomes the default export.
import generator from './generate-validators.cjs'

describe('Assertify: generateValidatorsString', () => {
  it('should generate a basic validation function for a simple schema', () => {
    const schemas = {
      Test: {
        name: { type: 'string' },
      },
    }

    // Access the function through the imported 'generator' object
    const result = generator.generateValidatorsString(schemas)

    expect(result).toBeTypeOf('string')
    expect(result).toContain('export function validateTest(data)')
    expect(result).toContain(
      `throw new Error("Validation failed for Test: missing required property 'name'.");`,
    )
    expect(result).toContain(`typeof data.name !== 'string'`)
  })

  it('should generate content validation for minLength', () => {
    const schemas = {
      Post: {
        title: { type: 'string', minLength: 5 },
      },
    }

    // Access the function through the imported 'generator' object
    const result = generator.generateValidatorsString(schemas)
    expect(result).toContain('if (data.title.length < 5)')
    expect(result).toContain('must be at least 5 characters long.')
  })
})
