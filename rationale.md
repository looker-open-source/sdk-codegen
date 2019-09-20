# Rationale for the SDK code generator

With the number of Open-Source Swagger and [OpenAPI](https://github.com/OAI/OpenAPI-Specification) code generators already available for a wide variety of languages, a reasonable question to ask is, "Why is Looker creating yet another code generator?"

This document will attempt to answer that question by providing Looker's goals and perspectives on providing rich language-specific SDKs that are a pleasure to work with, and easy to support.

## Support for multiple SDK languages

The Looker API is used by customers with a wide variety of languages. Data scientists may like using `R` or `Python`. Other customers may want to use `Typescript`, `Javascript`, `Java` or `C#`.

At the time of this writing, the SDK code generator only supports `Python` and `Typescript` so the examples used will be based on those languages.

When looking at the languages supported by the existing code generators, we found the patterns and quality of the generated code to vary widely. As Looker increases the number of supported client-language SDKs, these differences would become unsupportable.

The three primary goals for the SDKs Looker provides are: **consistency**, **discoverability**, and **correctness**.

When determining our code generation pattern, we observed that most programming languages have common characteristics: 
- classes can be extended
- methods take arguments
- arguments 
  - can be optional or undefined
  - can have default values
- structures and/or interfaces

By combining these observations with the clear constraints of RESTful APIs, a clean solution to generating code for multiple target languages is possible.

### Consistency

By providing a consistent implementation pattern across all supported languages, we can iterate on the [principle of least astonishment](https://softwareengineering.stackexchange.com/questions/187457/what-is-the-principle-of-least-astonishment). Additionally, a reference implementation in one supported language can help a developer quickly port that implementation to their preferred languages because the idioms and code will be as similar as possible.

The SDK method signatures declare the parameters for the methods in a consistent order, with the set of all required parameters coming before the optional parameters. This means that parameters will be declared in the following order for each method, if that type of parameter exists:

- required
  - path
  - body
  - query
- optional
  - path
  - body
  - query

By prioritizing the parameter declarations, the minimal number of arguments need to be passed to the method and optional arguments can be assigned default values by the method (where appropriate).

A consistent naming scheme for the methods is provided directly from the Looker API specification. Methods are prefixed with `all`, or `delete`, or `update`.

Method names are preserved from the specification's `operationId`. No conversion to `CamelCase` or `snake_case` is made by the generator. Even though Typescript does not usually have `snake_case` conventions, no conversion is made so SDK method names remain identical across languages.

The Python code:
```python
me = sdk.me("id, first_name, last_name")
```

Is nearly identical to the Typescript code:

```typescript
me = await sdk.me("id, first_name, last_name")
```

and that's a good thing.

The generated SDK methods are written to a file called `methods.<ext>`. For Python, this file is called `methods.py` and for Typescript it's `methods.ts`.

The API structures are written to a file called `models.<ext>`. For Python, this file is called `models.py` and for Typescript it's `models.ts`.

Whenever support is added for another language, code consistency is re-evaluated, which encourages simplicity and elegance in the generated code implementation.    

#### Diverging while remaining consistent

One discovery made during the development of the code generator is that some languages (like Python) support "default named parameters" while some others (like Typescript) do not. This means that in Python, the following code works fine:

```python
looks = sdk.search_looks(fields="id, title, description")
```

and the first iteration of the Typescript implementation looked like this:

```typescript
looks = await sdk.search_looks(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, "id, title, description")
```

Clearly, this would not be a pleasant way to make SDK calls.

To make Typescript coding more enjoyable, methods that have more than one optional parameter (or two, if the body parameter is also present but optional), a `Request` structure is created that supports the sparse assignment of arguments. Thanks to the `IRequestsearch_looks` interface generated for Typescript, the method call can be:

```typescript
looks = await sdk.search_looks({fields: 'id,title,description'})
``` 

Which is **just about** as convenient as the Python pattern.

This on-demand `Request` structure generation will be applied to any other languages that don't support named default parameters.

### Discoverability

Code editors have grown a rich and similar feature set since the time since Delphi introduced [Code Completion](http://docwiki.embarcadero.com/RADStudio/Rio/en/Code_Completion) and Visual Studio provided [IntelliSense](https://code.visualstudio.com/docs/editor/intellisense). Other modern code editors provide similar code assistance features, and the language patterns adopted by the SDK generator takes full advantage of editor feature.

The generated SDK declares all SDK methods into a single, discoverable set of methods of the same class. This way, with a variable called `sdk` representing an initialized LookerSDK object, typing `sdk.` in an editor should result in seeing all of the available SDK methods. Typically, as you type in additional characters, the list of available methods will be filtered to those that match.

Descriptions in the API specification are embedded into the generate method and models source code, so the methods and models are self-documenting.

### Correctness

Strong types and generics will be used for any language that supports them. This improves the coding experience by aiding in the discoverability described above. It also helps prevent errors in the code that would previously have been discovered at run-time, because compile-time (and editing) type checking is applied to the code as it's being written.

The Looker SDK for Python requires Python 3.7 due to the language features adopted for the code generator.

The Looker SDK for Javascript is implemented in Typescript for this same reason. 

## RESTful API support

The Looker API is uses [RESTful](https://restfulapi.net/rest-api-design-tutorial-with-example/) principles. This greatly simplifies generating programming language source code from the API specification due to the highly constrained runtime requirements.

All methods are implemented as HTTP requests. All results are returned in HTTP responses.

### Five core operations

Except for esoteric REST functionality, all API calls are one of five HTTP methods.
 
- `GET`

- `PUT`

- `POST`

- `PATCH`

- `DELETE`

### Five places for request data

- `Path`

- `Body`

- `Query parameters`

- `Headers`

- `Cookies`

## Implementation patterns

### Strongly typed in supporting languages

### Hand-written runtime libraries to minimize generated code

### Language-powered functionality

### Common, simple, securable configuration

## Using the Looker API specification

### Specification transition

### Missing features

## Generated examples

### Method implementations

### Model declarations

#### Standard structures from the specification

#### Writeable structures

#### Request structures

## API Troubleshooting

See the official documentation for [API Troubleshooting](https://docs.looker.com/reference/api-and-integration/api-troubleshooting) suggestions.

## Notes

In addition to swagger being deprecated, this [visual guide](https://blog.readme.io/an-example-filled-guide-to-swagger-3-2/) shows why OpenAPI 3.x is preferred to Swagger 2.x.
