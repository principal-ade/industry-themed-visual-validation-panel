import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConfigLibraryBrowserPanel } from './ConfigLibraryBrowserPanel';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { MockPanelProvider } from '../mocks/panelContext';
import type { DataSlice } from '../types';

/**
 * Mock library.yaml content
 */
const mockLibraryYaml = `
version: "1.0.0"
name: "Demo Component Library"
description: "Sample components for visual validation"

nodeComponents:
  api-handler:
    description: "HTTP API endpoint handler"
    tags: ["api", "http"]
    shape: rectangle
    icon: Server
    color: "#3b82f6"
    sources:
      - "src/api/**/*.ts"

  database:
    description: "Database connection"
    tags: ["storage", "persistence"]
    shape: hexagon
    icon: Database
    color: "#8b5cf6"
    states:
      connected:
        color: "#22c55e"
        label: "Connected"
      disconnected:
        color: "#ef4444"
        label: "Disconnected"
    sources:
      - "src/db/**/*.ts"

  logger:
    description: "Logging service"
    tags: ["observability", "logging"]
    shape: circle
    icon: FileText
    color: "#06b6d4"
    sources:
      - "src/logger.ts"

  cache:
    description: "Redis cache layer"
    tags: ["storage", "cache"]
    shape: diamond
    icon: Zap
    color: "#f59e0b"
    sources:
      - "src/cache/**/*.ts"

edgeComponents:
  http-request:
    description: "HTTP request between services"
    tags: ["http"]
    style: solid
    color: "#3b82f6"
    width: 2
    directed: true

  db-query:
    description: "Database query"
    tags: ["database"]
    style: solid
    color: "#8b5cf6"
    width: 2
    directed: true

  log-write:
    description: "Log message"
    tags: ["logging"]
    style: dashed
    color: "#9ca3af"
    width: 1
    directed: true

  cache-hit:
    description: "Cache read/write"
    tags: ["cache"]
    style: dotted
    color: "#f59e0b"
    width: 2
    directed: true
    animation:
      type: flow
      duration: 1000

connectionRules:
  - from: api-handler
    to: database
    via: db-query
  - from: api-handler
    to: cache
    via: cache-hit
  - from: api-handler
    to: logger
    via: log-write
`;

/**
 * Mock canvas configs
 */
const mockSimpleCanvasJSON = JSON.stringify({
  nodes: [
    { id: 'api', type: 'text', x: 100, y: 100, width: 120, height: 80, text: 'API', vv: { shape: 'rectangle', icon: 'Server' } },
    { id: 'db', type: 'text', x: 300, y: 100, width: 120, height: 80, text: 'Database', vv: { shape: 'hexagon', icon: 'Database' } },
  ],
  edges: [{ id: 'e1', fromNode: 'api', toNode: 'db', vv: { edgeType: 'query' } }],
  vv: { name: 'Simple Service', version: '1.0.0' },
}, null, 2);

const mockComplexCanvasJSON = JSON.stringify({
  nodes: [
    { id: 'gateway', type: 'text', x: 100, y: 200, width: 140, height: 80, text: 'API Gateway', vv: { shape: 'rectangle', icon: 'Globe' } },
    { id: 'auth', type: 'text', x: 300, y: 100, width: 120, height: 80, text: 'Auth Service', vv: { shape: 'rectangle', icon: 'Shield' } },
    { id: 'users', type: 'text', x: 300, y: 300, width: 120, height: 80, text: 'Users Service', vv: { shape: 'rectangle', icon: 'Users' } },
    { id: 'db', type: 'text', x: 500, y: 200, width: 120, height: 100, text: 'PostgreSQL', vv: { shape: 'hexagon', icon: 'Database' } },
  ],
  edges: [
    { id: 'e1', fromNode: 'gateway', toNode: 'auth', vv: { edgeType: 'http' } },
    { id: 'e2', fromNode: 'gateway', toNode: 'users', vv: { edgeType: 'http' } },
    { id: 'e3', fromNode: 'auth', toNode: 'db', vv: { edgeType: 'query' } },
    { id: 'e4', fromNode: 'users', toNode: 'db', vv: { edgeType: 'query' } },
  ],
  vv: { name: 'Microservices Architecture', version: '2.0.0', description: 'Multi-service setup with shared database' },
}, null, 2);

/**
 * Create mock file tree with multiple configs and library
 */
const createMockFileTreeWithLibrary = () => {
  const files = [
    {
      path: '.vgc/simple-service.canvas',
      relativePath: '.vgc/simple-service.canvas',
      name: 'simple-service.canvas',
      content: mockSimpleCanvasJSON,
    },
    {
      path: '.vgc/microservices.canvas',
      relativePath: '.vgc/microservices.canvas',
      name: 'microservices.canvas',
      content: mockComplexCanvasJSON,
    },
    {
      path: '.vgc/library.yaml',
      relativePath: '.vgc/library.yaml',
      name: 'library.yaml',
      content: mockLibraryYaml,
    },
    { path: 'src/api/index.ts', relativePath: 'src/api/index.ts', name: 'index.ts' },
    { path: 'src/db/client.ts', relativePath: 'src/db/client.ts', name: 'client.ts' },
    { path: 'README.md', relativePath: 'README.md', name: 'README.md' },
  ];

  return { allFiles: files };
};

/**
 * ConfigLibraryBrowserPanel displays available .canvas configurations
 * and component library items from the .vgc/ folder.
 */
const meta = {
  title: 'Panels/ConfigLibraryBrowserPanel',
  component: ConfigLibraryBrowserPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Browse and select .canvas configurations and component libraries. Clicking a config emits an event that the graph panel listens to.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '100vh', width: '100vw', background: '#f5f5f5' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof ConfigLibraryBrowserPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story with multiple configs and a library
 */
export const WithConfigsAndLibrary: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    const fileTreeData = createMockFileTreeWithLibrary();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: fileTreeData,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            return mockSlices.get(name) as DataSlice<T> | undefined;
          },
          hasSlice: (name: string) => mockSlices.has(name),
          isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
          repositoryPath: '/mock/repository',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
        actionsOverrides={{
          readFile: async (path: string) => {
            const fileName = path.split('/').pop() || '';
            const relativePath = path.replace('/mock/repository/', '');
            const file = fileTreeData.allFiles.find(
              (f) => f.path === fileName || f.name === fileName || f.relativePath === relativePath
            );
            if (!file || !file.content) {
              throw new Error(`File not found: ${path}`);
            }
            return { content: file.content };
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => <ConfigLibraryBrowserPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Story with only configs, no library
 */
export const ConfigsOnly: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    const fileTreeData = {
      allFiles: [
        {
          path: '.vgc/simple-service.canvas',
          relativePath: '.vgc/simple-service.canvas',
          name: 'simple-service.canvas',
          content: mockSimpleCanvasJSON,
        },
        {
          path: '.vgc/microservices.canvas',
          relativePath: '.vgc/microservices.canvas',
          name: 'microservices.canvas',
          content: mockComplexCanvasJSON,
        },
      ],
    };
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: fileTreeData,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            return mockSlices.get(name) as DataSlice<T> | undefined;
          },
          hasSlice: (name: string) => mockSlices.has(name),
          isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
          repositoryPath: '/mock/repository',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
        actionsOverrides={{
          readFile: async (path: string) => {
            const relativePath = path.replace('/mock/repository/', '');
            const file = fileTreeData.allFiles.find((f) => f.relativePath === relativePath);
            if (!file || !file.content) {
              throw new Error(`File not found: ${path}`);
            }
            return { content: file.content };
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => <ConfigLibraryBrowserPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Empty state - no .vgc folder
 */
export const EmptyState: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    const fileTreeData = {
      allFiles: [
        { path: 'src/index.ts', relativePath: 'src/index.ts', name: 'index.ts' },
        { path: 'README.md', relativePath: 'README.md', name: 'README.md' },
      ],
    };
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: fileTreeData,
      loading: false,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            return mockSlices.get(name) as DataSlice<T> | undefined;
          },
          hasSlice: (name: string) => mockSlices.has(name),
          isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
          repositoryPath: '/mock/repository',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
        actionsOverrides={{
          readFile: async () => {
            throw new Error('File not found');
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => <ConfigLibraryBrowserPanel {...props} />}
      </MockPanelProvider>
    );
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {} as never,
  render: () => {
    const mockSlices = new Map<string, DataSlice>();
    mockSlices.set('fileTree', {
      scope: 'repository',
      name: 'fileTree',
      data: null,
      loading: true,
      error: null,
      refresh: async () => {},
    });

    return (
      <MockPanelProvider
        contextOverrides={{
          slices: mockSlices,
          getSlice: <T,>(name: string): DataSlice<T> | undefined => {
            return mockSlices.get(name) as DataSlice<T> | undefined;
          },
          hasSlice: (name: string) => mockSlices.has(name),
          isSliceLoading: (name: string) => mockSlices.get(name)?.loading || false,
          repositoryPath: '/mock/repository',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any}
      >
        {(props) => <ConfigLibraryBrowserPanel {...props} />}
      </MockPanelProvider>
    );
  },
};
