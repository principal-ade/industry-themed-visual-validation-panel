import { ExamplePanel } from './panels/ExamplePanel';
import { VisualValidationGraphPanel } from './panels/VisualValidationGraphPanel';
import type { PanelDefinition, PanelContextValue } from './types';

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
      version: '0.1.0',
      author: 'Principal AI',
      description: 'Visualizes vvf.config.yaml configuration files as interactive graph diagrams',
      slices: ['fileTree'], // Data slices this panel depends on
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
      id: 'your-org.example-panel',
      name: 'Example Panel',
      icon: '📝',
      version: '0.1.0',
      author: 'Your Organization',
      description: 'A simple example panel demonstrating the panel framework',
      slices: ['git', 'markdown', 'fileTree'], // Data slices this panel depends on
    },
    component: ExamplePanel,

    // Optional: Called when this specific panel is mounted
    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Example Panel mounted',
        context.currentScope.repository?.path
      );

      // Example: Refresh git data if available
      if (context.hasSlice('git') && !context.isSliceLoading('git')) {
        await context.refresh('repository', 'git');
      }
    },

    // Optional: Called when this specific panel is unmounted
    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Example Panel unmounting');
    },
  },
];

/**
 * Optional: Called once when the entire package is loaded.
 * Use this for package-level initialization.
 */
export const onPackageLoad = async () => {
  // eslint-disable-next-line no-console
  console.log('Panel package loaded - Example Panel Extension');
};

/**
 * Optional: Called once when the package is unloaded.
 * Use this for package-level cleanup.
 */
export const onPackageUnload = async () => {
  // eslint-disable-next-line no-console
  console.log('Panel package unloading - Example Panel Extension');
};
