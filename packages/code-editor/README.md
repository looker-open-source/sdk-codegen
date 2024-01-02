## @looker/code-editor

This package contains code display and editor components that are used in Looker extensions such as the API Explorer and LookML Diagram.

### Installation

Add dependency to your project using yarn or npm

```sh
yarn add @looker/code-editor
```

or

```sh
npm install @looker/code-editor
```

### `<CodeDisplay />`

This component is a specialized `<code />` or `<pre />` that has various search, syntax highlighting and other display options. Use this component for read-only code display use cases. This component is used by this package's CodeEditor and Markdown component for inline and block code sections.

| Prop        | Description                                                                                                                                                                                                                                                                | Default    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| language    | This prop configures the syntax highlighting language and accepts any `react-prism-renderer` [supported language](https://github.com/FormidableLabs/prism-react-renderer/blob/master/src/vendor/prism/includeLangs.js), as well as `ruby`, `kotlin`, `swift`, and `csharp` | `json`     |
| code        | The code to be displayed and highlighted.                                                                                                                                                                                                                                  | _required_ |
| pattern     | The search pattern to be highlighted in the input code.                                                                                                                                                                                                                    | `''`       |
| transparent | A flag for disabling the backgroundColor added by default.                                                                                                                                                                                                                 | `false`    |
| inline      | When true, inline `<code />` is used. `<pre />` is used by default.                                                                                                                                                                                                        | `false`    |
| lineNumbers | A flag for enabling line numbers.                                                                                                                                                                                                                                          | `false`    |

### `<CodeCopy />`

This component wraps the `<CodeDisplay />` component and adds a "copy to Clipboard" button

| Prop    | Description                                           | Default    |
| ------- | ----------------------------------------------------- | ---------- |
| ...     | All `<CodeDisplay />` props are accepted              |            |
| caption | An override for the Copy button text, which is "Copy" | _optional_ |

### `<CodeEditor />`

This component wraps the `<CodeDisplay />` component and adds a hidden `<textarea />` that allows for code editing.

| Prop     | Description                                | Default    |
| -------- | ------------------------------------------ | ---------- |
| ...      | All `<CodeDisplay />` props are accepted   |            |
| onChange | An event handler for capturing user input. | _required_ |

#### Example

```javascript
const CodeBlockEditor: React.FC = () => {
  const [codeString, setCodeString] = useState(`
# GET /lookml_models -> Sequence[models.LookmlModel]
def all_lookml_models(
    self,
    # Requested fields.
    fields: Optional[str] = None,
    transport_options: Optional[transport.TransportOptions] = None,
) -> Sequence[models.LookmlModel]:
    """Get All LookML Models"""
    response = self.get(
                    f"/lookml_models",
            Sequence[models.LookmlModel],
            query_params={"fields": fields},
            transport_options=transport_options
    )
    assert isinstance(response, list)
    return responsebind
`)
  return (
    <CodeEditor
      code={codeString}
      onChange={setCodeString}
      language="python"
      lineNumbers={true}
    />
  )
}
```

### `<Markdown />`

This component is a wrapper around a `<ReactMarkdown />` component. It uses `@looker/component` renderers for text and `<CodeDisplay />` for inline and block code. It has options for link handling and renderer overrides.

| Prop              | Description                                                                                                                       | Default    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| source            | The Markdown string to be rendered                                                                                                | _required_ |
| pattern           | The search pattern to be highlighted in the source                                                                                | `''`       |
| transformLinkUri  | A function for pre-processing the link before it is navigated to, used for removing `<mark />` tags or modifying the destination. | _optional_ |
| linkClickHandler  | An override for link click behavior.                                                                                              | _optional_ |
| paragraphOverride | An override for the default Paragraph renderer.                                                                                   | _optional_ |

#### Using `<CodeDisplay />` inside Markdown

This component checks for decorated code blocks. The following `source` would create a Ruby syntax highlighted code block.

````
When using the Ruby SDK this would be passed as a Ruby hash like:
```ruby
{
 :model=>"thelook",
 :view=>"inventory_items",
 :fields=>
  ["category.name",
   "inventory_items.days_in_inventory_tier",
   "products.count"],
 :filters=>{:"category.name"=>"socks"},
 :sorts=>["products.count desc 0"],
 :limit=>"500",
 :query_timezone=>"America/Los_Angeles",
}
```
````
