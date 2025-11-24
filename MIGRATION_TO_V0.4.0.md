# Migration Guide: Visual Validation Panel → v0.4.0

This guide explains how to migrate the `industry-themed-visual-validation-panel` to use the new multi-config support from Visual Validation Framework v0.4.0.

## Overview of Changes

Visual Validation Framework v0.4.0 introduces **official multi-config support** with:
- **`.vgc/` folder** - Standard location for multiple configurations
- **`ConfigurationLoader`** - Official loader with FileSystemAdapter pattern
- **`ConfigurationSelector`** - Ready-to-use React component for config switching
- **`YamlParser`** - Built-in YAML parsing with validation

Your panel already has **custom multi-config support** - this migration will adopt the framework's official implementation for better consistency and maintenance.

---

## Current Implementation

**Package Versions:**
```json
"@principal-ai/visual-validation-core": "^0.2.1"
"@principal-ai/visual-validation-react": "^0.2.2"
```

**Config Locations Supported:**
- Standalone: `vvf.config.yaml` at root
- Config folders: `visual-validation-configs/`, `vvf-configs/`, `.vvf/` with `.vvf.yaml` files

**Custom Code:**
- `src/panels/visual-validation/ConfigLoader.ts` - Custom config finder and YAML parser
- Panel component has inline config selector logic

---

## Migration Steps

### Step 1: Update Dependencies

**File:** `package.json`

```diff
  "dependencies": {
-   "@principal-ai/visual-validation-core": "^0.2.1",
-   "@principal-ai/visual-validation-react": "^0.2.2",
+   "@principal-ai/visual-validation-core": "^0.4.0",
+   "@principal-ai/visual-validation-react": "^0.4.0",
+   "@principal-ai/repository-abstraction": "^0.2.5",
    "@principal-ade/industry-theme": "^0.1.2",
    "@principal-ade/panel-framework-core": "^0.1.2",
    "@xyflow/react": "^12.0.0",
    "clsx": "^2.1.1",
    "framer-motion": "^11.0.0",
-   "js-yaml": "^4.1.0",
    "lucide-react": "^0.552.0"
  }
```

**Notes:**
- `@principal-ai/repository-abstraction` is now a direct dependency
- `js-yaml` can be removed - it's now included in the core package

**Run:**
```bash
bun install
```

---

### Step 2: Adopt `.vgc/` Folder Structure

The framework now uses `.vgc/` as the **standard** configuration folder.

The framework now standardizes on `.vgc/` folder only. Users must migrate their configs to this location.

---

### Step 3: Update ConfigLoader to Use Framework Utilities

**Current:** `src/panels/visual-validation/ConfigLoader.ts`

Replace with a new implementation that uses the framework's official loader:

```typescript
// src/panels/visual-validation/ConfigManager.ts
import { ConfigurationLoader, InMemoryFileSystemAdapter } from '@principal-ai/visual-validation-core';
import type { ConfigurationFile } from '@principal-ai/visual-validation-core';

export interface PanelConfigFile {
  id: string;
  name: string;
  path: string;
  source: 'vgc-folder' | 'legacy-folder' | 'standalone';
}

export class ConfigManager {
  /**
   * Create a FileSystemAdapter from panel's file tree
   */
  static createFileSystemAdapter(fileTree: Array<{ path?: string; relativePath?: string; name?: string; content?: string }>) {
    const fsAdapter = new InMemoryFileSystemAdapter();

    // Populate adapter with file tree
    for (const file of fileTree) {
      const path = file.relativePath || file.path || '';
      if (file.content && path) {
        // Create directory structure
        const parts = path.split('/');
        let currentPath = '';
        for (let i = 0; i < parts.length - 1; i++) {
          currentPath += parts[i];
          if (!fsAdapter.exists(currentPath)) {
            fsAdapter.createDir(currentPath);
          }
          currentPath += '/';
        }

        // Write file
        fsAdapter.writeFile(path, file.content);
      }
    }

    return fsAdapter;
  }

  /**
   * Find all configs using framework's ConfigurationLoader
   */
  static async findConfigs(
    fileTree: Array<{ path?: string; relativePath?: string; name?: string; content?: string }>,
    readFile: (path: string) => Promise<{ content: string }>
  ): Promise<PanelConfigFile[]> {
    const configs: PanelConfigFile[] = [];

    // 1. Check for .vgc/ folder using framework's ConfigurationLoader
    const fsAdapter = this.createFileSystemAdapter(fileTree);
    const loader = new ConfigurationLoader(fsAdapter);

    if (loader.hasConfigDirectory('/')) {
      const result = loader.loadAll('/');

      for (const config of result.configs) {
        configs.push({
          id: config.name,
          name: config.config.metadata.name,
          path: config.path,
          source: 'vgc-folder'
        });
      }
    }

    return configs;
  }
}
```

---

### Step 4: Update Panel Component

**File:** `src/panels/VisualValidationGraphPanel.tsx`

**Changes:**

1. **Import framework's ConfigurationSelector:**

```typescript
import {
  GraphRenderer,
  ConfigurationSelector  // NEW
} from '@principal-ai/visual-validation-react';
import {
  ConfigurationLoader,   // NEW
  type ConfigurationFile // NEW
} from '@principal-ai/visual-validation-core';
```

2. **Update state type:**

```typescript
interface GraphPanelState {
  config: PathBasedGraphConfiguration | null;
  nodes: NodeState[];
  edges: EdgeState[];
  loading: boolean;
  error: string | null;
  configurations: ConfigurationFile[];  // UPDATED: Use framework type
  selectedConfigName: string | null;    // UPDATED: Use name instead of ID
}
```

3. **Simplify config loading using ConfigurationLoader:**

```typescript
const loadConfiguration = useCallback(async (configName?: string) => {
  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    if (!context.hasSlice('fileTree')) {
      throw new Error('File tree data not available');
    }

    const fileTreeSlice = context.getSlice('fileTree');
    const fileTreeData = fileTreeSlice?.data as { allFiles?: Array<...> } | null;

    if (!fileTreeData?.allFiles) {
      // Empty state
      setState({...});
      return;
    }

    // Use framework's ConfigurationLoader
    const fsAdapter = ConfigManager.createFileSystemAdapter(fileTreeData.allFiles);
    const loader = new ConfigurationLoader(fsAdapter);

    if (!loader.hasConfigDirectory('/')) {
      // No .vgc/ folder - show empty state or check legacy locations
      setState({...});
      return;
    }

    // Load all configs
    const result = loader.loadAll('/');

    if (result.errors.length > 0) {
      console.warn('Config loading errors:', result.errors);
    }

    if (result.configs.length === 0) {
      setState({...});
      return;
    }

    // Select config
    const selectedConfig = configName
      ? result.configs.find(c => c.name === configName) || result.configs[0]
      : result.configs[0];

    // Convert to graph
    const { nodes, edges } = GraphConverter.configToGraph(selectedConfig.config);

    setState({
      config: selectedConfig.config,
      nodes,
      edges,
      loading: false,
      error: null,
      configurations: result.configs,
      selectedConfigName: selectedConfig.name
    });
  } catch (error) {
    // Error handling...
  }
}, [context]);
```

4. **Replace inline selector with ConfigurationSelector component:**

```typescript
{/* OLD: Custom select dropdown */}
{state.availableConfigs.length > 1 && (
  <div style={{ position: 'relative' }}>
    <select
      value={state.selectedConfigId || ''}
      onChange={(e) => loadConfiguration(e.target.value)}
      style={{...}}
    >
      {state.availableConfigs.map(config => (
        <option key={config.id} value={config.id}>
          {config.name}
        </option>
      ))}
    </select>
    <ChevronDown ... />
  </div>
)}

{/* NEW: Use framework's ConfigurationSelector */}
{state.configurations.length > 1 && (
  <ConfigurationSelector
    configurations={state.configurations}
    selectedConfig={state.selectedConfigName || ''}
    onConfigChange={loadConfiguration}
    showDescription={false}
    showVersion={false}
  />
)}
```

5. **Update GraphRenderer to include configName:**

```typescript
<GraphRenderer
  configuration={state.config}
  configName={state.selectedConfigName || undefined}  // NEW
  nodes={state.nodes}
  edges={state.edges}
  showMinimap={true}
  showControls={true}
  showBackground={true}
/>
```

---

### Step 5: Update EmptyStateContent

**File:** `src/panels/visual-validation/EmptyStateContent.tsx`

Update the empty state message to reference `.vgc/` folder:

```typescript
<div style={{ textAlign: 'center', maxWidth: '500px' }}>
  <FileText size={48} style={{ color: theme.colors.textMuted, marginBottom: theme.space[4] }} />

  <h3 style={{
    margin: 0,
    marginBottom: theme.space[2],
    fontSize: theme.fontSizes[3],
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text
  }}>
    No Configuration Found
  </h3>

  <p style={{
    margin: 0,
    fontSize: theme.fontSizes[1],
    color: theme.colors.textMuted,
    lineHeight: 1.6
  }}>
    Create a <code style={{
      backgroundColor: theme.colors.backgroundSecondary,
      padding: '2px 6px',
      borderRadius: theme.radii[0],
      fontFamily: theme.fonts.mono
    }}>.vgc/</code> folder in your project root and add YAML configuration files.
  </p>

  <p style={{
    margin: `${theme.space[3]} 0 0 0`,
    fontSize: theme.fontSizes[0],
    color: theme.colors.textMuted,
    lineHeight: 1.5
  }}>
    Example: <code style={{
      backgroundColor: theme.colors.backgroundSecondary,
      padding: '2px 6px',
      borderRadius: theme.radii[0],
      fontFamily: theme.fonts.mono,
      fontSize: theme.fontSizes[0]
    }}>.vgc/architecture.yaml</code>
  </p>
</div>
```

---

### Step 6: Update Package Description

**File:** `package.json`

```diff
- "description": "Visual Validation Graph Panel for visualizing vvf.config.yaml files as interactive diagrams",
+ "description": "Visual Validation Graph Panel for visualizing graph configurations from .vgc/ folder as interactive diagrams",
```

---

### Step 7: Testing

**Test scenarios:**

1. **`.vgc/` folder with multiple configs**
   ```
   your-project/
     .vgc/
       architecture.yaml
       data-flow.yaml
       deployment.yaml
   ```
   - Verify all configs load
   - Verify ConfigurationSelector appears
   - Verify switching between configs works

2. **`.vgc/` folder with single config**
   ```
   your-project/
     .vgc/
       main.yaml
   ```
   - Verify config loads
   - Verify ConfigurationSelector is hidden

3. **No configs**
   - Verify empty state shows correct message

4. **Invalid YAML**
   - Verify error state shows helpful message

---

## Benefits of Migration

### Before (v0.2.x)
- ❌ Custom ConfigLoader implementation to maintain
- ❌ Custom YAML parsing logic
- ❌ Custom validation logic
- ❌ Inconsistent config folder locations
- ❌ Custom selector UI implementation

### After (v0.4.0)
- ✅ Use framework's official ConfigurationLoader
- ✅ Built-in YAML parsing with error handling
- ✅ Built-in validation
- ✅ Standard `.vgc/` folder location
- ✅ Ready-to-use ConfigurationSelector component
- ✅ FileSystemAdapter pattern for testing
- ✅ Consistent with other projects using the framework

---

## Breaking Changes for Users

Users must migrate their configs:

```bash
# Create .vgc folder
mkdir .vgc

# Move single config
mv vvf.config.yaml .vgc/main.yaml

# Or move multiple configs from old folder
mv visual-validation-configs/*.vvf.yaml .vgc/
# Rename .vvf.yaml → .yaml
cd .vgc
for f in *.vvf.yaml; do mv "$f" "${f%.vvf.yaml}.yaml"; done
```

**Migration instructions for users should be added to your panel's README.**

---

## Rollout Strategy

1. Update to v0.4.0 packages
2. Only support `.vgc/` folder location
3. Simpler codebase
4. Full framework consistency

---

## Example Migration PR Checklist

- [ ] Update package.json dependencies to v0.4.0
- [ ] Run `bun install`
- [ ] Update ConfigLoader or create new ConfigManager
- [ ] Add `.vgc/` folder support
- [ ] Update VisualValidationGraphPanel component
- [ ] Replace inline selector with ConfigurationSelector
- [ ] Update EmptyStateContent message
- [ ] Add migration guide to README
- [ ] Test with `.vgc/` folder
- [ ] Update Storybook stories
- [ ] Build and verify no TypeScript errors
- [ ] Update version number

---

## Additional Resources

- [Visual Validation Framework v0.4.0 Release Notes](../../visual-validation-core-library/README.md)
- [.vgc/ Folder Guide](../../visual-validation-core-library/.vgc/README.md)
- [Configuration Reference](../../visual-validation-core-library/docs/CONFIGURATION_REFERENCE.md)
- [ConfigurationLoader API](../../visual-validation-core-library/packages/core/src/ConfigurationLoader.ts)
- [ConfigurationSelector Component](../../visual-validation-core-library/packages/react/src/components/ConfigurationSelector.tsx)

---

## Questions or Issues?

If you encounter any issues during migration, check:
1. Package versions are correct (all v0.4.0)
2. `.vgc/` folder exists and contains valid YAML files
3. YAML files have required fields (metadata, nodeTypes, edgeTypes, allowedConnections)
4. FileSystemAdapter is correctly populated with file tree data

For additional help, refer to the framework's example configurations in `.vgc/` folder.
