import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import generator from './generate-validators.cjs'

// Define a path for our temporary test file
const tempFilePath = path.join(__dirname, 'temp-validators-for-test.mjs')

// This will be loaded in beforeAll and used by all tests
let validateTest

beforeAll(async () => {
  // Define the schema for all tests in this suite
  const schemas = {
    Test: {
      name: { type: 'string', minLength: 3 },
      age: { type: 'number' },
    },
  }
  const generatedCode = generator.generateValidatorsString(schemas)
  fs.writeFileSync(tempFilePath, generatedCode)

  // Dynamically import the module we just created
  const module = await import(tempFilePath)
  validateTest = module.validateTest
})

afterAll(() => {
  // Clean up the temporary file
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath)
  }
})

// The describe block now ONLY contains tests.
// It uses the single `validateTest` function loaded in the beforeAll hook.
describe('Assertify: Dual-Mode Functionality', () => {
  it('should throw the first encountered error in assertion mode', () => {
    const invalidData = { name: 'Jo', age: 30 } // age is valid
    // The first error it should find is the minLength error for 'name'.
    expect(() => validateTest(invalidData)).toThrow(/must be at least 3 characters long/)
  })

  it('should throw a "required" error if a property is missing', () => {
    const invalidData = { name: 'John Doe' } // name is valid, but age is missing
    // NOW the first error it finds is the missing 'age' property.
    expect(() => validateTest(invalidData)).toThrow(/is a required property/)
  })

  it('should return a detailed error object in verbose mode', () => {
    const invalidData = { name: 'Jo' } // Missing 'age' and name is too short
    const result = validateTest(invalidData, { verbose: true })

    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBe(2)
    expect(result.errors[0].property).toBe('name')
    expect(result.errors[1].property).toBe('age')
  })

  it('should return a valid result object in verbose mode for valid data', () => {
    const validData = { name: 'John', age: 20 }
    const result = validateTest(validData, { verbose: true })

    expect(result.isValid).toBe(true)
    expect(result.errors.length).toBe(0)
    expect(result.value).toEqual(validData)
  })
})
