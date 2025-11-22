import YAML from 'js-yaml';
import type { PathBasedGraphConfiguration } from '@principal-ai/visual-validation-core';

/**
 * Utility for loading and parsing vvf.config.yaml files
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
   * Find vvf.config.yaml file content from file list
   */
  static findConfigContent(files: Array<{ path: string; content?: string }>): string | null {
    const configNames = [
      'vvf.config.yaml',
      'vvf.config.yml',
      '.vvf.yaml',
      '.vvf.yml'
    ];

    for (const file of files) {
      if (configNames.includes(file.path) || configNames.some(name => file.path.endsWith(`/${name}`))) {
        return file.content || null;
      }
    }

    return null;
  }
}
