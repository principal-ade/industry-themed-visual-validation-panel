# Quick Start: Migrate to v0.4.0

**TL;DR:** Update packages, adopt `.vgc/` folder, use framework's ConfigurationLoader & ConfigurationSelector.

---

## 5-Minute Migration

### 1. Update Packages (1 min)

```bash
# Update package.json
npm install @principal-ai/visual-validation-core@0.4.0 \
            @principal-ai/visual-validation-react@0.4.0 \
            @principal-ai/repository-abstraction@0.2.5

# Remove js-yaml (now included)
npm uninstall js-yaml
```

### 2. Migration Strategy

This migration only supports `.vgc/` folder for simpler implementation and full framework consistency. Users must migrate their configs.

---

## Quick Implementation

### Update ConfigLoader.ts

**Replace with:**

```typescript
import {
  ConfigurationLoader,
  InMemoryFileSystemAdapter,
  type ConfigurationFile
} from '@principal-ai/visual-validation-core';

export class ConfigManager {
  static createAdapter(fileTree: any[]) {
    const adapter = new InMemoryFileSystemAdapter();

    // Populate adapter
    for (const file of fileTree) {
      const path = file.relativePath || file.path || '';
      if (file.content && path) {
        // Create dirs
        const parts = path.split('/');
        let current = '';
        for (let i = 0; i < parts.length - 1; i++) {
          current += parts[i];
          if (!adapter.exists(current)) adapter.createDir(current);
          current += '/';
        }
        adapter.writeFile(path, file.content);
      }
    }
    return adapter;
  }

  static findConfigs(fileTree: any[]): ConfigurationFile[] {
    const adapter = this.createAdapter(fileTree);
    const loader = new ConfigurationLoader(adapter);

    if (!loader.hasConfigDirectory('/')) return [];

    const result = loader.loadAll('/');
    return result.configs;
  }
}
```

### Update Panel Component

**In VisualValidationGraphPanel.tsx:**

1. **Import ConfigurationSelector:**
```typescript
import {
  GraphRenderer,
  ConfigurationSelector
} from '@principal-ai/visual-validation-react';
```

2. **Replace custom selector with:**
```typescript
{state.configurations.length > 1 && (
  <ConfigurationSelector
    configurations={state.configurations}
    selectedConfig={state.selectedConfigName || ''}
    onConfigChange={loadConfiguration}
  />
)}
```

3. **Update loadConfiguration to use ConfigManager:**
```typescript
const configs = ConfigManager.findConfigs(fileTreeData.allFiles);
```

### Update Empty State

**In EmptyStateContent.tsx:**

Change message to reference `.vgc/` folder instead of `vvf.config.yaml`.

---

## Testing

```bash
# Build
bun run build

# Run storybook
bun run storybook
```

**Test with `.vgc/` folder:**
```
your-project/
  .vgc/
    architecture.yaml
    data-flow.yaml
```

---

## User Migration Instructions

Add to your README:

```markdown
## Configuration Migration

Visual Validation Panel now uses the `.vgc/` folder for configurations.

### Migrate from single config:
```bash
mkdir .vgc
mv vvf.config.yaml .vgc/main.yaml
```

### Migrate from old config folder:
```bash
mkdir .vgc
mv visual-validation-configs/*.vvf.yaml .vgc/
cd .vgc
for f in *.vvf.yaml; do mv "$f" "${f%.vvf.yaml}.yaml"; done
```

---

## Full Details

See [MIGRATION_TO_V0.4.0.md](./MIGRATION_TO_V0.4.0.md) for complete guide.

## Example Configs

See framework's [`.vgc/` folder](../../visual-validation-core-library/.vgc/) for examples:
- simple-service.yaml
- microservices.yaml
- data-pipeline.yaml
- test-validation.yaml
