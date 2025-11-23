import YAML from 'js-yaml';
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
 * Utility for loading and parsing vvf.config.yaml files
 * Supports both single config files and folders of configs
 */
export class ConfigLoader {
  /**
   * Parse YAML content to config object
   */
  static parseYaml(content: string): PathBasedGraphConfiguration {
    try {
      const config = YAML.load(content) as unknown;

      // Validate config structure
      this.validateConfig(config);

      return config as PathBasedGraphConfiguration;
    } catch (error) {
      throw new Error(`Invalid YAML: ${(error as Error).message}`);
    }
  }

  /**
   * Validate config has required fields
   */
  static validateConfig(config: unknown): void {
    const cfg = config as Record<string, unknown>;
    if (!cfg.metadata) {
      throw new Error('Missing metadata section');
    }
    const metadata = cfg.metadata as Record<string, unknown>;
    if (!metadata.name) {
      throw new Error('Missing metadata.name');
    }
    if (!metadata.version) {
      throw new Error('Missing metadata.version');
    }
    if (!cfg.nodeTypes) {
      throw new Error('Missing nodeTypes section');
    }
    if (Object.keys(cfg.nodeTypes as object).length === 0) {
      throw new Error('nodeTypes cannot be empty');
    }
  }

  /**
   * Find vvf.config.yaml file path from file list (legacy single-config support)
   * Returns the file path if found, null otherwise
   * @deprecated Use findConfigs() instead for multi-config support
   */
  static findConfigPath(files: Array<{ path?: string; relativePath?: string; name?: string }>): string | null {
    const configNames = [
      'vvf.config.yaml',
      'vvf.config.yml',
      '.vvf.yaml',
      '.vvf.yml'
    ];

    for (const file of files) {
      const filePath = file.relativePath || file.path || '';
      const fileName = file.name || '';

      // Check if the file name matches any config names
      if (configNames.includes(fileName)) {
        return filePath;
      }

      // Check if the path ends with any config names
      if (configNames.some(name => filePath.endsWith(`/${name}`) || filePath === name)) {
        return filePath;
      }
    }

    return null;
  }

  /**
   * Find all config files - both standalone and in config folders
   * Returns array of config files with metadata
   *
   * Supports:
   * 1. Standalone: vvf.config.yaml, .vvf.yaml, etc. in project root
   * 2. Config folder: visual-validation-configs/*.vvf.yaml
   */
  static findConfigs(files: Array<{ path?: string; relativePath?: string; name?: string }>): ConfigFile[] {
    const configs: ConfigFile[] = [];

    // Known config folder names
    const configFolders = [
      'visual-validation-configs',
      'vvf-configs',
      '.vvf'
    ];

    // Standalone config names (in project root)
    const standaloneNames = [
      'vvf.config.yaml',
      'vvf.config.yml',
      '.vvf.yaml',
      '.vvf.yml'
    ];

    for (const file of files) {
      const filePath = file.relativePath || file.path || '';
      const fileName = file.name || '';

      // Check for standalone config in root
      if (standaloneNames.includes(fileName)) {
        // Only include if it's in the root (no directory separator before it)
        const pathParts = filePath.split('/');
        if (pathParts.length === 1 || (pathParts.length === 2 && pathParts[0] === '')) {
          configs.push({
            id: 'default',
            name: 'Default Configuration',
            path: filePath,
            source: 'standalone'
          });
        }
      }

      // Check for configs in known config folders
      for (const folder of configFolders) {
        // Match files like: visual-validation-configs/something.vvf.yaml
        if (filePath.includes(`${folder}/`) &&
            (fileName.endsWith('.vvf.yaml') || fileName.endsWith('.vvf.yml'))) {

          // Extract config ID from filename (remove extension)
          const id = fileName.replace(/\.vvf\.(yaml|yml)$/, '');

          // Use a readable name (convert kebab-case to Title Case)
          const name = id
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          configs.push({
            id,
            name,
            path: filePath,
            source: 'folder'
          });
        }
      }
    }

    return configs;
  }

  /**
   * Extract config ID from a file path
   */
  static getConfigId(filePath: string): string {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace(/\.vvf\.(yaml|yml)$/, '').replace(/^\.?vvf\.config\./, 'default');
  }
}
