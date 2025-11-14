import type { Meta, StoryObj } from '@storybook/react';
import { ExamplePanel } from './ExamplePanel';
import {
  MockPanelProvider,
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';

/**
 * ExamplePanel demonstrates the panel framework integration.
 * It shows how to access context, use actions, and subscribe to events.
 */
const meta = {
  title: 'Panels/ExamplePanel',
  component: ExamplePanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A simple example panel demonstrating the panel framework API. Shows repository info, git status, event logging, and example actions.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', background: '#f5f5f5' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    context: createMockContext(),
    actions: createMockActions(),
    events: createMockEvents(),
  },
} satisfies Meta<typeof ExamplePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state with all data loaded
 */
export const Default: Story = {
  render: () => (
    <MockPanelProvider>
      {(props) => <ExamplePanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Loading state - shows loading indicators
 */
export const Loading: Story = {
  render: () => (
    <MockPanelProvider
      contextOverrides={{
        loading: true,
        gitStatusLoading: true,
      }}
    >
      {(props) => <ExamplePanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * No repository loaded
 */
export const NoRepository: Story = {
  render: () => (
    <MockPanelProvider
      contextOverrides={{
        repositoryPath: null,
        repository: null,
      }}
    >
      {(props) => <ExamplePanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Empty git status - no changes
 */
export const EmptyGitStatus: Story = {
  render: () => (
    <MockPanelProvider
      contextOverrides={{
        gitStatus: {
          staged: [],
          unstaged: [],
          untracked: [],
          deleted: [],
        },
      }}
    >
      {(props) => <ExamplePanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Lots of changes in git
 */
export const ManyGitChanges: Story = {
  render: () => (
    <MockPanelProvider
      contextOverrides={{
        gitStatus: {
          staged: Array.from(
            { length: 10 },
            (_, i) => `src/components/Component${i}.tsx`
          ),
          unstaged: Array.from(
            { length: 15 },
            (_, i) => `src/utils/util${i}.ts`
          ),
          untracked: Array.from(
            { length: 8 },
            (_, i) => `src/new/file${i}.tsx`
          ),
          deleted: ['src/old/deprecated.ts'],
        },
      }}
    >
      {(props) => <ExamplePanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Interactive example with custom actions
 */
export const WithInteractiveActions: Story = {
  render: () => {
    const context = createMockContext();
    const actions = createMockActions({
      openFile: (filePath) => {
        alert(`Opening file: ${filePath}`);
      },
      navigateToPanel: (panelId) => {
        alert(`Navigating to panel: ${panelId}`);
      },
    });
    const events = createMockEvents();

    return <ExamplePanel context={context} actions={actions} events={events} />;
  },
};

/**
 * Panel without git data slice
 */
export const NoGitSlice: Story = {
  render: () => (
    <MockPanelProvider
      contextOverrides={{
        hasSlice: (slice) => slice !== 'git',
      }}
    >
      {(props) => <ExamplePanel {...props} />}
    </MockPanelProvider>
  ),
};

/**
 * Custom repository configuration
 */
export const CustomRepository: Story = {
  render: () => (
    <MockPanelProvider
      contextOverrides={{
        repositoryPath: '/home/user/awesome-project',
        repository: {
          name: 'awesome-project',
          path: '/home/user/awesome-project',
          branch: 'feature/new-feature',
          remote: 'upstream',
        },
      }}
    >
      {(props) => <ExamplePanel {...props} />}
    </MockPanelProvider>
  ),
};
