# Issue: Node Colors Not Rendering from Canvas `vv` Extension

## Summary

Node colors defined in the `vv` extension of canvas files are not being applied by the `GraphRenderer` component. All nodes render with the same default color regardless of their `fill` and `stroke` properties.

## Expected Behavior

When a canvas node has `fill` and `stroke` properties in its `vv` extension, the `GraphRenderer` should render the node with those colors:

```json
{
  "id": "pkg-builder",
  "type": "package",
  "label": "@principal-ai/code-city-builder",
  "x": 400,
  "y": 100,
  "width": 250,
  "height": 80,
  "vv": {
    "nodeType": "package",
    "shape": "rectangle",
    "fill": "#3b82f6",
    "stroke": "#1d4ed8"
  }
}
```

This node should render with a blue fill (`#3b82f6`) and darker blue stroke (`#1d4ed8`).

## Actual Behavior

All nodes render with the same default color, ignoring the `fill` and `stroke` properties in the `vv` extension.

## Color Scheme Being Used

We have defined distinct colors for different node types to make the architecture diagram more readable:

| Node Type | Fill | Stroke | Description |
|-----------|------|--------|-------------|
| `package` | `#3b82f6` (blue) | `#1d4ed8` | NPM packages in monorepo |
| `core-module` | `#8b5cf6` (purple) | `#6d28d9` | Core modules/classes |
| `component` | `#10b981` (green) | `#047857` | React components |
| `hook` | `#06b6d4` (cyan) | `#0891b2` | React hooks |
| `utility` | `#f59e0b` (amber) | `#d97706` | Utility functions |
| `type-def` | `#ec4899` (pink) | `#db2777` | TypeScript type definitions |
| `external-dep` | `#6b7280` (gray) | `#4b5563` | External dependencies |

## Files Involved

### Canvas File (validated and correct)
- Path: `.principal-views/architecture.canvas`
- Contains 20 nodes with explicit `fill` and `stroke` in `vv` extension
- Passes `npx @principal-ai/principal-view-cli validate`

### Library File (defines component styles)
- Path: `.principal-views/library.yaml`
- Defines `nodeComponents` with `style.fill` and `style.stroke` for each node type

## Example Canvas Structure

```json
{
  "vv": {
    "name": "Code City Architecture",
    "version": "1.0.0"
  },
  "nodes": [
    {
      "id": "pkg-builder",
      "type": "package",
      "vv": {
        "nodeType": "package",
        "shape": "rectangle",
        "fill": "#3b82f6",
        "stroke": "#1d4ed8"
      }
    },
    {
      "id": "mod-multi-version-builder",
      "type": "core-module",
      "vv": {
        "nodeType": "core-module",
        "shape": "rectangle",
        "fill": "#8b5cf6",
        "stroke": "#6d28d9"
      }
    }
  ]
}
```

## Questions for Implementation

1. **Should `GraphRenderer` read colors from inline `vv.fill`/`vv.stroke`?**
   - Currently we're adding colors directly to each node's `vv` extension

2. **Should `GraphRenderer` look up colors from `library.yaml` based on `nodeType`?**
   - The library defines styles per `nodeComponents[nodeType].style.fill`

3. **What is the priority order?**
   - Inline `vv.fill`/`vv.stroke` > library lookup > default colors?

## Reproduction Steps

1. Open a project with `.principal-views/architecture.canvas` containing nodes with `vv.fill` and `vv.stroke`
2. View the canvas in the Visual Validation Graph Panel
3. Observe that all nodes have the same color regardless of their defined colors

## Environment

- `@principal-ai/principal-view-cli`: latest (just updated)
- `@principal-ai/principal-view-react`: (GraphRenderer component)
- `@principal-ai/principal-view-core`: (ExtendedCanvas types)

## Related

- The `library.yaml` schema supports `style.fill`, `style.stroke`, `style.strokeWidth`, `style.strokeDasharray`
- The canvas schema supports `vv.fill`, `vv.stroke` on nodes (not validated but should be read)
