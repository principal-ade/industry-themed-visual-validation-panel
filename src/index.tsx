import { ExamplePanel } from './panels/ExamplePanel';
import type { PanelDefinition, PanelContextValue } from './types';

/**
 * Export array of panel definitions.
 * This is the required export for panel extensions.
 */
export const panels: PanelDefinition[] = [
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
