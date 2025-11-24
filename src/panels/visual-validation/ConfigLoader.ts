import { parseYaml, isYamlFile, getConfigNameFromFilename } from '@principal-ai/visual-validation-core';
import type { PathBasedGraphConfiguration } from '@principal-ai/visual-validation-core';

export interface ConfigFile {
  /** Unique identifier for this config (derived from filename) */
  id: string;
  /** Display name for this config */
  name: string;
  /** Full file path */
  path: string;
  /** Whether this is from a config folder or standalone */
  source: 'folder' | 'standalone';
}

/**
 * Utility for loading and parsing configuration files from .vgc/ folder
 * Uses the framework's YamlParser for parsing and validation
 */
export class ConfigLoader {
  /**
   * Parse YAML content to config object using framework's parser
   */
  static parseYaml(content: string, filename?: string): PathBasedGraphConfiguration {
    const result = parseYaml(content, filename);

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to parse YAML');
    }

    return result.data;
  }

  /**
   * Find all config files in the .vgc/ folder
   * Returns array of config files with metadata
   */
  static findConfigs(files: Array<{ path?: string; relativePath?: string; name?: string }>): ConfigFile[] {
    const configs: ConfigFile[] = [];
    const VGC_FOLDER = '.vgc';

    for (const file of files) {
      const filePath = file.relativePath || file.path || '';
      const fileName = file.name || '';

      // Check for configs in .vgc/ folder
      // Match files like: .vgc/architecture.yaml or .vgc/data-flow.yml
      if (filePath.startsWith(`${VGC_FOLDER}/`) && isYamlFile(fileName)) {
        // Extract config name using framework's utility
        const configName = getConfigNameFromFilename(fileName);

        // Convert kebab-case to Title Case for display
        const displayName = configName
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        configs.push({
          id: configName,
          name: displayName,
          path: filePath,
          source: 'folder'
        });
      }
    }

    return configs;
  }
}
