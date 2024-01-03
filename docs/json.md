# Flexible JSON parsing in SDKs

This document helps you answer these questions:

- What's the problem caused by API 4.0 type changes?
- Is the Looker SDK I'm using compatible?
- If I'm not using a Looker SDK, how do I solve the problem for my own implementation?

## Lookering backward

In Looker API 3.1, some REST response payloads deliver JSON types that conflict with the types described in the API 3.1 specification. Flexibly typed languages like Python, Ruby, and JavaScript successfully parse these responses. The default JSON parsers for statically typed languages like Kotlin, Swift, and Go do not.

We introduced API 4.0 to guarantee the JSON payload response types match the API 4.0 specification.

## Lookering forward

Current users of Looker SDKs may have noticed that some `id` properties are typed as `integer` and some are typed as `string`. With the stable (aka GA, generally available) release of API 4.0, all `id` references have been typed as `string`.
Using strings for all ID references allows Looker to scale out Looker services in the future, once ID generation does not require an auto-increment numeric ID value from a monolithic instance.

We have worked to minimize the impact of this type change for all Looker-provided language SDKs. This document describes some JSON parsing requirements and how our SDKs support them.

## JSON parsing requirements

There are many requirements for parsing and producing JSON. Most requirements are identical among languages that support JSON **serialization** and **deserialization**. **Marshalling** and **unmarshalling** or **encoding** and **decoding** also refer to the same process.

Serialization is the conversion of a JSON payload into a structure, record, or object of a given language. Deserialization is rendering an instantiated data type to its JSON representation.

Almost all languages include standard first-party JSON serialization and deserialization support, though many have third-party offerings as the de facto standard.

The parsing requirements of concern for the Looker language SDKs are:

1. JSON value types conflicting with the API type specification. This is called [type ambiguity](#type-ambiguity) below. For the Looker API, these conflicts should be automatically resolvable for our SDKs. The conflict is either:
   1. a numeric value for a string property (forward compatibility issue)
   2. a string value for an integer property (backward compatibility issue)
2. New properties in a JSON payload. These are ignored by the SDKs. (See [TypeScript caveats](#typescript-caveats) for additional comments.)
3. Removed properties in a JSON payload. Typically, the property will end up unassigned. Some SDKs may throw errors with missing required properties, but that client code should be changed anyway if the property no longer exists.
4. Name changes, like `space` to `folder` and `homepage` to `board`. There is no reasonable automatic solution for this, so type or property renames will require changing existing SDK client code.

### What is forward and backward compatibility?

In this document, **forward compatible** means an older SDK can process payloads from a newer Looker API server.

**Backward compatible** means a newer SDK can process payloads from an older Looker API server.

Our goal with the Looker language SDKs is to provide both forward and backward compatibility.

The Looker API server accepts ID value references as **either** `integer` or `string` and converts them internally to the required type.
Therefore, the Looker API server is fully compatible for API requests with identically named properties and parameters that are either integer or string.

### Type ambiguity

In API 3.1, an internal numeric ID value sometimes has JSON `integer` value syntax even though the API specification described the property type as `string`. For API 4.0, the API server always returns property types that comply with the API type specification.

For full backward and forward compatibility between the SDK and the Looker API, the SDK should accept either a `string` or `integer` JSON value and convert it to the required target type of either `integer` or `string`.

The Looker SDKs have unit tests to verify this behavior. This is a sample JSON payload used in many of the tests:

```json
{
  "string1": 1,
  "num1": 1,
  "string2": "2",
  "num2": "2",
  "string3": "3",
  "num3": 3,
  "string4": "4",
  "num4": 4
}
```

The following sections discuss how we handle type ambiguity in each Looker language SDKS.

## TypeScript SDK

The TypeScript SDK fully backward and forward compatible with the string/integer type changes.

Given the following TypeScript interface:

```ts
interface ITestModel {
  string1: string;
  num1: number;
  string2: string;
  num2: number;
  string3: string;
  num3: number;
}
```

We want the TypeScript SDK to successfully deserialize the payload into `ITestModel`, accepting values for all declared properties, and ignoring `string4` and `num4` because they are not declared in `ITestModel`.

This test passes:

```ts
const typed = await sdkOk(xp.parseResponse<ITestModel, ISDKError>(resp));
expect(typed.string1).toBe(1);
expect(typed.num1).toBe(1);
expect(typed.string2).toBe('2');
expect(typed.num2).toBe('2');
expect(typed.string3).toBe('3');
expect(typed.num3).toBe(3);
expect((typed as any).string4).toBe('4');
expect((typed as any).num4).toBe(4);
```

### TypeScript caveats

The above test reveals a few TypeScript/JavaScript interaction issues. TypeScript types do not exist at runtime, so `num2` is still a string (`'2'`), and the deserialized object does actually contain `string4` and `num4` because JavaScript doesn't know to cast or ignore the properties.

Fortunately, the way JavaScript and the Looker API handles HTTP requests and responses, this doesn't matter at runtime.

## Python SDK

The Python SDK deserializes JSON string or integer types without issue. If the value looks like an integer or string, it will be parsed and converted to the named property type, as shown in this Python SDK unit test:

```python
def test_deserialize_single() -> None:
    """Deserialize functionality

    Should handle python reserved keywords as well as attempting to
    convert field values to proper type.
    """
    # check that type conversion happens, str -> int and int -> str in this case
    data = copy.deepcopy(MODEL_DATA)
    data["id"] = "1"
    data["name"] = 25

    d = json.dumps(data)
    model = sr.deserialize(data=d, structure=Model, converter=converter)
    assert model == Model(
        enum1=Enum1.entry1,
        model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        enum2=Enum2.entry2,
        model_no_refs2=ModelNoRefs2(name2="model_no_refs2_name"),
        list_enum1=[Enum1.entry1],
        list_model_no_refs1=[ModelNoRefs1(name1="model_no_refs1_name")],
        opt_enum1=Enum1.entry1,
        opt_model_no_refs1=ModelNoRefs1(name1="model_no_refs1_name"),
        id=1,
        name="25",
        datetime_field=DATETIME_VALUE,
        class_="model-name",
        finally_=[1, 2, 3],
    )
```

## Kotlin SDK

The Kotlin SDK uses Google's [GSon](https://github.com/google/gson) parser, which also supports fuzzy JSON types, as shown in this SDK unit test:

```kotlin
    @Test
    fun testJsonTyping() {
        val payload = """
{
  "string1": 1,
  "num1": 1,
  "string2": "2",
  "num2": "2",
  "string3": "3",
  "num3": 3,
  "string4": "4",
  "num4": 4
}
        """.trimIndent()
        /// we use GSon so verify GSon handles ... flexible ... json
        val gson = Gson()
        var testModel = gson.fromJson(payload, TestModel::class.java)
        assertEquals(testModel.string1, "1")
        assertEquals(testModel.num1, 1)
        assertEquals(testModel.string2, "2")
        assertEquals(testModel.num2, 2)
        assertEquals(testModel.string3, "3")
        assertEquals(testModel.num3, 3)
    }
```

## Swift SDK

Special-case code generation was required for backward and forward compatibility for Swift. (If you have a more elegant way to solve this problem, please let us know!)

Compatibility is provided via:

- an [`AnyString`](https://github.com/looker-open-source/sdk-codegen/blob/1487d8a38432cef2e994d14001df18659522ca90/swift/looker/rtl/AnyCodable.swift#L103-L140) custom type for string ID properties (either `id` or ending with `_id`) for forward compatibility
- an [`AnyInt`](https://github.com/looker-open-source/sdk-codegen/blob/1487d8a38432cef2e994d14001df18659522ca90/swift/looker/rtl/AnyCodable.swift#L142-L179) custom type for integer ID properties (either `id` or ending with `_id`) for backward compatibility
- Special JSON handling in **every** SDK model that requires it

This results in a verbose declaration as shown with this manually-coded prototype below:

```swift
struct TestModel : SDKModel {
    private var _string1: AnyString?
    var string1: String? {
        get { _string1?.value }
        set { _string1 = newValue.map(AnyString.init) }
    }
    private var _num1: AnyInt?
    var num1: Int64? {
        get { _num1?.value }
        set { _num1 = newValue.map(AnyInt.init) }
    }
    private var _string2: AnyString?
    var string2: String? {
        get { _string2?.value }
        set { _string2 = newValue.map(AnyString.init) }
    }
    private var _num2: AnyInt?
    var num2: Int64? {
        get { _num2?.value }
        set { _num2 = newValue.map(AnyInt.init) }
    }
    private var _string3: AnyString?
    var string3: String? {
        get { _string3?.value }
        set { _string3 = newValue.map(AnyString.init) }
    }
    private var _num3: AnyInt?
    var num3: Int64? {
        get { _num3?.value }
        set { _num3 = newValue.map(AnyInt.init) }
    }

    private enum CodingKeys: String, CodingKey {
        case _num1 = "num1"
        case _num2 = "num2"
        case _num3 = "num3"
        case _string1 = "string1"
        case _string2 = "string2"
        case _string3 = "string3"
    }

    init(string1: String? = nil, num1: Int64? = nil, string2: String? = nil, num2: Int64? = nil, string3: String? = nil, num3: Int64? = nil) {
        self._string1 = string1.map(AnyString.init)
        self._num1 = num1.map(AnyInt.init)
        self._string2 = string2.map(AnyString.init)
        self._num2 = num2.map(AnyInt.init)
        self._string3 = string3.map(AnyString.init)
        self._num3 = num3.map(AnyInt.init)
    }

}
```

The Swift SDK code generator produces similar code for numeric or string id properties.

This test confirms the flexible deserialization works for integer and string:

```swift
 func testJsonTypes() {
     let payload = """
     {
         "string1": 1,
         "num1": 1,
         "string2": "2",
         "num2": "2",
         "string3": "3",
         "num3": 3,
         "string4": "4",
         "num4": 4
     }
     """
     let actual: TestModel = try! deserialize(payload)
     XCTAssertEqual(actual.string1, "1")
     XCTAssertEqual(actual.num1, 1)
     XCTAssertEqual(actual.string2, "2")
     XCTAssertEqual(actual.num2, 2)
     XCTAssertEqual(actual.string3, "3")
     XCTAssertEqual(actual.num3, 3)
 }
```

## Look# (C# SDK)

Look# is fully backward and forward compatible for this type ambiguity, as this SDK unit test shows:

```cs
        class TestModel : SdkModel
        {
            public string? string1 { get; set; } = null;
            public long? num1 { get; set; } = null;
            public string? string2 { get; set; } = null;
            public long? num2 { get; set; } = null;
            public string? string3 { get; set; } = null;
            public long? num3 { get; set; } = null;
        }

        [Fact]
        public async Task JsonTypingTest()
        {
            var payload = @"
{
  ""string1"": 1,
    ""num1"": 1,
    ""string2"": ""2"",
    ""num2"": ""2"",
    ""string3"": ""3"",
    ""num3"": 3,
    ""string4"": ""4"",
    ""num4"": 4
}
";
            var resp = new RawResponse
            {
                Method = HttpMethod.Get,
                Body = payload,
                StatusCode = HttpStatusCode.OK,
                StatusMessage = "test",
                ContentType = "application/json"
            } as IRawResponse;
            var actual = Transport.ParseResponse<TestModel, Exception>(resp).Value;
            Assert.Equal("1", actual.string1);
            Assert.Equal(1, actual.num1);
            Assert.Equal("2", actual.string2);
            Assert.Equal(2, actual.num2);
            Assert.Equal("3", actual.string3);
            Assert.Equal(3, actual.num3);
        }
    }
```

## GoLook (Go SDK)

The Go SDK runtime uses a third-party JSON package with [fuzzy JSON type support](https://github.com/json-iterator/go/blob/master/extra/fuzzy_decoder.go) for backward and forward compatibility. This gives the Go SDK the same level of compatibility as C# and Kotlin.

Below is a unit test verifying "fuzzy" JSON values. More tests can be found in [auth_test.go](../go/rtl/auth_test.go)

```go
	t.Run("Do{} unmarshals struct with mixed string and num types correctly", func(t *testing.T) {
		mux := http.NewServeMux()
		server := httptest.NewServer(mux)
		defer server.Close()

		mux.HandleFunc("/api" + apiVersion + "/login", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			s, _ := json.Marshal(AccessToken{
				ExpiresIn: maxTime,
			})
			fmt.Fprint(w, string(s))
		})

		mux.HandleFunc("/api" + apiVersion + path, func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			var string1 int64 = 1
			var num1 int64 = 1
			string2 := "2"
			num2:= "2"
			string3 := "3"
			var num3 int64 = 3
			string4 := "4"
			var num4 int64 = 4
			originalStruct := struct {
				String1 *int64 `json:"string1"`
				Num1 *int64 `json:"num1"`
				String2 *string `json:"string2"`
				Num2 *string `json:"num2"`
				String3 *string `json:"string3"`
				Num3 *int64 `json:"num3"`
				String4 *string `json:"string4"`
				Num4 *int64 `json:"num4"`
			}{
				String1: &string1,
				Num1: &num1,
				String2: &string2,
				Num2: &num2,
				String3: &string3,
				Num3: &num3,
				String4: &string4,
				Num4: &num4,
			}
			s, _ := json.Marshal(originalStruct)
			fmt.Fprint(w, string(s))
		})

		s := &AuthSession{
			Config: ApiSettings{
				BaseUrl: server.URL,
				ApiVersion:  apiVersion,
			},
		}

		type expectedStructType struct {
			String1 *string `json:"string1"`
			Num1 *int64 `json:"num1"`
			String2 *string `json:"string2"`
			Num2 *int64 `json:"num2"`
			String3 *string `json:"string3"`
			Num3 *int64 `json:"num3"`
		}

		string1 := "1"
		var num1 int64 = 1
		string2 := "2"
		var num2 int64 = 2
		string3 := "3"
		var num3 int64 = 3

		expectedStruct := expectedStructType{
			String1: &string1,
			Num1: &num1,
			String2: &string2,
			Num2: &num2,
			String3: &string3,
			Num3: &num3,
		}

		var result expectedStructType

		s.Do(&result, "GET", apiVersion, path, nil, nil, nil)

		if !reflect.DeepEqual(result, expectedStruct) {
			t.Error("fields of mixed types were not unmarshaled correctly into the right types")
		}
	})
```

## Ruby SDK

The Ruby SDK is dynamically typed, so it is backward and forward compatible, accepting either integer or string without issue.

## LookR (R SDK)

The R language is ["strongly but dynamically typed"](https://mlconference.ai/blog/introduction-to-the-r-programming-language/), so it is backward and forward compatible, accepting either integer or string without issue.
