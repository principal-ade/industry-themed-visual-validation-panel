import { VisualValidationGraphPanel } from './panels/VisualValidationGraphPanel';
import { ConfigLibraryBrowserPanel } from './panels/ConfigLibraryBrowserPanel';
import { EventControllerPanel } from './panels/EventControllerPanel';
import type { PanelDefinition, PanelContextValue } from './types';
import { visualValidationPanelTools, visualValidationPanelToolsMetadata } from './tools';

// Re-export components for direct usage
export { EventControllerPanel } from './panels/EventControllerPanel';
export type { EventControllerPanelProps, PlaybackState, PlaybackStatus } from './panels/EventControllerPanel';

export { ConfigLibraryBrowserPanel } from './panels/ConfigLibraryBrowserPanel';
export type { ConfigSelectedEventPayload } from './panels/ConfigLibraryBrowserPanel';

// Re-export adapter for external use
export { PanelFileSystemAdapter } from './adapters/PanelFileSystemAdapter';
export type { FileTreeEntry, PanelFileSystemAdapterOptions } from './adapters/PanelFileSystemAdapter';

/**
 * Export array of panel definitions.
 * This is the required export for panel extensions.
 */
export const panels: PanelDefinition[] = [
  {
    metadata: {
      id: 'principal-ai.visual-validation-graph',
      name: 'Visual Validation Graph',
      icon: '🕸️',
      version: '0.1.1',
      author: 'Principal AI',
      description: 'Visualizes .canvas configuration files as interactive graph diagrams',
      slices: ['fileTree'], // Data slices this panel depends on
      // UTCP-compatible tools this panel exposes
      tools: visualValidationPanelTools,
    },
    component: VisualValidationGraphPanel,

    // Optional: Called when this specific panel is mounted
    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Visual Validation Graph Panel mounted',
        context.currentScope.repository?.path
      );

      // Refresh file tree if available
      if (context.hasSlice('fileTree') && !context.isSliceLoading('fileTree')) {
        await context.refresh('repository', 'fileTree');
      }
    },

    // Optional: Called when this specific panel is unmounted
    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Visual Validation Graph Panel unmounting');
    },
  },
  {
    metadata: {
      id: 'principal-ai.config-library-browser',
      name: 'Config Browser',
      icon: '📚',
      version: '0.1.0',
      author: 'Principal AI',
      description: 'Browse and select .canvas configurations and component libraries',
      slices: ['fileTree'], // Data slices this panel depends on
    },
    component: ConfigLibraryBrowserPanel,

    // Optional: Called when this specific panel is mounted
    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Config Library Browser Panel mounted',
        context.currentScope.repository?.path
      );

      // Refresh file tree if available
      if (context.hasSlice('fileTree') && !context.isSliceLoading('fileTree')) {
        await context.refresh('repository', 'fileTree');
      }
    },

    // Optional: Called when this specific panel is unmounted
    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Config Library Browser Panel unmounting');
    },
  },
];

/**
 * Optional: Called once when the entire package is loaded.
 * Use this for package-level initialization.
 */
export const onPackageLoad = async () => {
  // eslint-disable-next-line no-console
  console.log('Panel package loaded - Visual Validation Graph Panel');
};

/**
 * Optional: Called once when the package is unloaded.
 * Use this for package-level cleanup.
 */
export const onPackageUnload = async () => {
  // eslint-disable-next-line no-console
  console.log('Panel package unloading - Visual Validation Graph Panel');
};

/**
 * Export tools for server-safe imports.
 * Use '@industry-theme/visual-validation-panel/tools' to import without React dependencies.
 */
export {
  visualValidationPanelTools,
  visualValidationPanelToolsMetadata,
  focusNodeTool,
  resetViewTool,
  triggerEventTool,
} from './tools';
