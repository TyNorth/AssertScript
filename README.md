# **MycoAssert**

A dynamic, zero-dependency, runtime validation library designed for modular and decentralized application architectures.

## **Core Philosophy**

MycoAssert is built to solve the "contract" problem in a micro-frontend or plug-in system, referred to as the "Mycelial/Spore" architecture. It ensures that a host application (a "Shell") and a dynamically loaded module (a "Spore") can safely interact by verifying their shared data and function contracts at runtime.

* **Declarative:** Define the "shape" of your data and contracts using simple, readable JavaScript objects.  
* **Dynamic & Runtime-First:** No build step or code generation is required to perform validation. Schemas are plain objects that can be loaded and processed on the fly.  
* **Developer-Friendly:** Throws detailed, structured ValidationError objects, making error handling and UI feedback simple and robust.  
* **Powerful:** Handles nested objects, optional properties, data sanitization, and high-level contract verification out of the box.

## **Features**

* **Runtime Validation:** Validate objects against schemas directly in your code.  
* **Nested Schemas:** Create complex data models by referencing schemas within other schemas.  
* **Optional Properties:** Mark properties as optional using the ? suffix (e.g., 'age?').  
* **Data Sanitization & Transformation:** Includes a chainable transform rule for cleaning data (trim, toLowerCase, toInt) during the validation process.  
* **Structured Errors:** Throws a custom ValidationError with properties like .property, .rule, and .value for easy programmatic error handling.  
* **High-Level Contract API:** Provides a top-level verifyContract function designed to validate a Shell's entire CTX against a Spore's contract.  
* **Zero Dependencies:** Clean, lightweight, and easy to integrate.

## **Local Installation & Usage**

Since this project is private, it's intended to be used as a local package. The recommended method is using npm pack.

1. **Pack the Library**  
   In the root directory of the MycoAssert project, run:  
   npm pack

   This will create a mycoassert-1.0.0.tgz file (the version may vary).  
2. **Install in Your "Shell" Project**  
   In your main application's project directory, install the packed file using its relative path:  
   \# Example from a parent directory  
   npm install ./MycoAssert/mycoassert-1.0.0.tgz

3. **Import and Use**  
   You can now import MycoAssert's functions in your application:  
   import { assert, verifyContract, ValidationError } from 'mycoassert';

## **Core Concepts & API**

### **1\. The assert function**

This is the core, low-level validation and sanitization engine.

**Signature:** assert(data, schema, \[allSchemas\])

* data: The object to validate.  
* schema: A schema object defining the rules for data.  
* allSchemas (optional): An object containing all available schemas, used for nesting.

Upon success, it returns the sanitized data object. Upon failure, it throws a ValidationError.

#### **Basic Validation & Sanitization**

import { assert } from 'mycoassert';

const userSchema \= {  
  username: {  
    type: 'string',  
    minLength: 3,  
    transform: \['trim', 'toLowerCase'\]  
  }  
};

const dirtyData \= { username: '  MycoUser  ' };

try {  
  const sanitizedUser \= assert(dirtyData, userSchema);  
  console.log('Sanitized:', sanitizedUser); // { username: 'mycouser' }  
} catch (error) {  
  // Handle the error  
}

#### **Handling Errors**

import { assert, ValidationError } from 'mycoassert';

const schema \= { name: { type: 'string', minLength: 5 } };  
const invalidData \= { name: 'Joe' };

try {  
  assert(invalidData, schema);  
} catch (error) {  
  if (error instanceof ValidationError) {  
    console.error('Property:', error.property); // 'name'  
    console.error('Rule:', error.rule);         // 'minLength'  
    console.error('Value:', error.value);       // 'Joe'  
  }  
}

### **2\. The verifyContract function**

This is the high-level API designed for a "Shell" to validate a "Spore's" contract against its own CTX.

**Signature:** verifyContract(ctx, contract)

* ctx: The Shell's implemented Context object.  
* contract: The Spore's contract schema.

Returns true on success, throws ValidationError on failure.

#### **Contract Verification Example**

import { verifyContract } from 'mycoassert';

const sporeContract \= {  
  data: {  
    users: { type: 'object', get: { type: 'function' } }  
  }  
};

const shellCTX \= {  
  data: {  
    users: {  
      get: (userId) \=\> { /\* ... fetches user ... \*/ }  
    }  
  }  
};

try {  
  verifyContract(shellCTX, sporeContract);  
  console.log('Spore is compatible with this Shell\!');  
} catch (error) {  
  console.error('Compatibility check failed:', error.message);  
}

## **Development**

To work on MycoAssert itself:

1. **Setup:** Clone the repository and run npm install.  
2. **File Structure:** The core runtime logic resides in /src/runtime/.  
   * assert.js: The main validation engine.  
   * rules.js: Contains the rulesEngine and transformsEngine.  
   * errors.js: Defines the custom ValidationError.  
   * verifyContract.js: The high-level API.  
3. **Testing:** Run the test suite with:  
   npm test

**Note:** The original schema-based generator script (generate-validators.cjs) has been superseded by the dynamic runtime engine but is kept in the repository for historical reference.

## **Roadmap & Future Enhancements**

* **CRDT-Specific Rules:** Add rules to the rulesEngine for validating Y.js types (e.g., isYMap, isYArray).  
* **Live Function Testing:** Enhance verifyContract to optionally execute CTX functions with mock data and validate their return value schemas.  
* **Async Validation:** Support rules that are themselves asynchronous.
