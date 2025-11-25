import type { PathBasedGraphConfiguration } from '@principal-ai/visual-validation-core';
import YAML from 'js-yaml';

/**
 * Mock VVF configurations for Storybook stories
 */

export const mockSimpleConfig: PathBasedGraphConfiguration = {
  metadata: {
    name: 'Simple Service',
    version: '1.0.0',
    description: 'Basic service with API and database'
  },
  nodeTypes: {
    'api-handler': {
      shape: 'rectangle',
      icon: 'server',
      color: '#3b82f6',
      dataSchema: {},
      sources: ['src/api/**/*.ts']
    },
    'database': {
      shape: 'hexagon',
      icon: 'database',
      color: '#8b5cf6',
      dataSchema: {},
      sources: ['src/db/**/*.ts']
    },
    'logger': {
      shape: 'circle',
      icon: 'file-text',
      color: '#06b6d4',
      dataSchema: {},
      sources: ['src/logger.ts']
    }
  },
  edgeTypes: {
    'query': {
      style: 'solid',
      color: '#64748b',
      width: 2,
      directed: true
    },
    'log': {
      style: 'dashed',
      color: '#9ca3af',
      width: 1,
      directed: true
    }
  },
  allowedConnections: [
    {
      from: 'api-handler',
      to: 'database',
      via: 'query'
    },
    {
      from: 'api-handler',
      to: 'logger',
      via: 'log'
    },
    {
      from: 'database',
      to: 'logger',
      via: 'log'
    }
  ]
};

export const mockControlTowerConfig: PathBasedGraphConfiguration = {
  metadata: {
    name: 'Control Tower Core - Client-Server Demo',
    version: '0.1.19',
    description: 'Alpha testing: Server with two client connections'
  },
  nodeTypes: {
    'server': {
      shape: 'rectangle',
      icon: 'server',
      color: '#8b5cf6',
      size: {
        width: 200,
        height: 120
      },
      position: {
        x: 500,
        y: 300
      },
      dataSchema: {},
      sources: ['src/server/BaseServer.ts', 'src/server/ServerBuilder.ts', 'src/server/ExperimentalAPI.ts']
    },
    'client-a': {
      shape: 'circle',
      icon: 'user',
      color: '#3b82f6',
      size: {
        width: 120,
        height: 120
      },
      position: {
        x: 50,
        y: 100
      },
      dataSchema: {},
      sources: ['src/client/BaseClient.ts', 'src/client/ClientBuilder.ts']
    },
    'transport': {
      shape: 'diamond',
      icon: 'radio',
      color: '#06b6d4',
      size: {
        width: 140,
        height: 140
      },
      position: {
        x: 250,
        y: 300
      },
      dataSchema: {},
      sources: ['src/adapters/websocket/WebSocketServerTransportAdapter.ts']
    },
    'room-manager': {
      shape: 'hexagon',
      icon: 'users',
      color: '#22c55e',
      size: {
        width: 150,
        height: 130
      },
      position: {
        x: 800,
        y: 50
      },
      dataSchema: {},
      sources: ['src/abstractions/DefaultRoomManager.ts']
    },
    'lock-manager': {
      shape: 'hexagon',
      icon: 'lock',
      color: '#f59e0b',
      size: {
        width: 150,
        height: 130
      },
      position: {
        x: 800,
        y: 300
      },
      dataSchema: {},
      sources: ['src/abstractions/DefaultLockManager.ts']
    },
    'presence-manager': {
      shape: 'hexagon',
      icon: 'activity',
      color: '#ec4899',
      size: {
        width: 150,
        height: 130
      },
      position: {
        x: 800,
        y: 550
      },
      dataSchema: {},
      sources: ['src/abstractions/DefaultPresenceManager.ts']
    },
    'auth': {
      shape: 'rectangle',
      icon: 'shield',
      color: '#ef4444',
      size: {
        width: 130,
        height: 90
      },
      position: {
        x: 500,
        y: 550
      },
      dataSchema: {},
      sources: ['src/abstractions/AuthAdapter.ts']
    }
  },
  edgeTypes: {
    'websocket-connection': {
      style: 'solid',
      color: '#3b82f6',
      width: 3,
      directed: true,
      animation: {
        type: 'flow',
        duration: 1500,
        color: '#60a5fa'
      }
    },
    'auth-flow': {
      style: 'dotted',
      color: '#ef4444',
      width: 2,
      directed: true,
      animation: {
        type: 'particle',
        duration: 1000,
        color: '#f87171'
      }
    },
    'room-flow': {
      style: 'solid',
      color: '#22c55e',
      width: 2,
      directed: true,
      animation: {
        type: 'particle',
        duration: 2000,
        color: '#4ade80'
      }
    },
    'lock-flow': {
      style: 'dashed',
      color: '#f59e0b',
      width: 2,
      directed: true,
      animation: {
        type: 'flow',
        duration: 2000,
        color: '#fbbf24'
      }
    },
    'presence-flow': {
      style: 'dotted',
      color: '#ec4899',
      width: 2,
      directed: true,
      animation: {
        type: 'pulse',
        duration: 1500,
        color: '#f472b6'
      }
    },
    'service-call': {
      style: 'solid',
      color: '#64748b',
      width: 2,
      directed: true
    }
  },
  allowedConnections: [
    { from: 'client-a', to: 'transport', via: 'websocket-connection' },
    { from: 'transport', to: 'server', via: 'websocket-connection' },
    { from: 'server', to: 'auth', via: 'auth-flow' },
    { from: 'server', to: 'room-manager', via: 'service-call' },
    { from: 'server', to: 'lock-manager', via: 'service-call' },
    { from: 'server', to: 'presence-manager', via: 'service-call' },
    { from: 'client-a', to: 'room-manager', via: 'room-flow' },
    { from: 'client-a', to: 'lock-manager', via: 'lock-flow' },
    { from: 'client-a', to: 'presence-manager', via: 'presence-flow' },
    { from: 'room-manager', to: 'client-a', via: 'room-flow' }
  ],
  display: {
    layout: 'manual',
    theme: {
      primary: '#3b82f6',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4'
    },
    animations: {
      enabled: true,
      speed: 1.0
    }
  }
};

export const mockComplexConfig: PathBasedGraphConfiguration = {
  metadata: {
    name: 'Repository Traffic Controller',
    version: '2.1.0',
    description: 'GitHub webhook processing with lock management'
  },
  nodeTypes: {
    'request-handler': {
      shape: 'rectangle',
      icon: 'server',
      color: '#3b82f6',
      dataSchema: {},
      sources: ['app/handlers/**/*.ts']
    },
    'lock-manager': {
      shape: 'rectangle',
      icon: 'lock',
      color: '#8b5cf6',
      dataSchema: {},
      sources: ['lib/lock-manager.ts', 'lib/branch-aware-lock-manager.ts'],
      states: {
        idle: { color: '#94a3b8', icon: 'unlock', label: 'Idle' },
        acquired: { color: '#22c55e', icon: 'lock', label: 'Lock Held' },
        waiting: { color: '#eab308', icon: 'clock', label: 'Waiting' },
        error: { color: '#ef4444', icon: 'alert-circle', label: 'Error' }
      }
    },
    'github-api': {
      shape: 'hexagon',
      icon: 'github',
      color: '#22c55e',
      dataSchema: {},
      sources: ['lib/github-api-client.ts', 'services/github/**/*.ts']
    },
    'database': {
      shape: 'hexagon',
      icon: 'database',
      color: '#64748b',
      dataSchema: {},
      sources: ['lib/db/**/*.ts']
    }
  },
  edgeTypes: {
    'webhook-flow': {
      style: 'solid',
      color: '#3b82f6',
      width: 3,
      directed: true,
      animation: {
        type: 'flow',
        duration: 1500
      }
    },
    'lock-request': {
      style: 'dashed',
      color: '#8b5cf6',
      width: 2,
      directed: true
    },
    'api-call': {
      style: 'solid',
      color: '#22c55e',
      width: 2,
      directed: true
    },
    'db-query': {
      style: 'dashed',
      color: '#64748b',
      width: 2,
      directed: true
    }
  },
  allowedConnections: [
    {
      from: 'request-handler',
      to: 'lock-manager',
      via: 'lock-request'
    },
    {
      from: 'lock-manager',
      to: 'github-api',
      via: 'api-call'
    },
    {
      from: 'request-handler',
      to: 'github-api',
      via: 'webhook-flow'
    },
    {
      from: 'lock-manager',
      to: 'database',
      via: 'db-query'
    }
  ]
};

// Convert configs to YAML strings for mock file content
export const mockSimpleConfigYAML = YAML.dump(mockSimpleConfig);
export const mockComplexConfigYAML = YAML.dump(mockComplexConfig);
export const mockControlTowerConfigYAML = YAML.dump(mockControlTowerConfig);

// Mock file tree with config using .vgc/ folder structure
export const createMockFileTree = (config: 'simple' | 'complex' | 'control-tower' | 'none') => {
  const files: Array<{ path: string; relativePath: string; name: string; content?: string }> = [];

  if (config === 'simple') {
    files.push({
      path: '.vgc/simple-service.yaml',
      relativePath: '.vgc/simple-service.yaml',
      name: 'simple-service.yaml',
      content: mockSimpleConfigYAML
    });
  } else if (config === 'complex') {
    files.push({
      path: '.vgc/traffic-controller.yaml',
      relativePath: '.vgc/traffic-controller.yaml',
      name: 'traffic-controller.yaml',
      content: mockComplexConfigYAML
    });
  } else if (config === 'control-tower') {
    files.push({
      path: '.vgc/vvf.config.yaml',
      relativePath: '.vgc/vvf.config.yaml',
      name: 'vvf.config.yaml',
      content: mockControlTowerConfigYAML
    });
  }

  // Add some other files for realism
  files.push(
    { path: 'src/api/index.ts', relativePath: 'src/api/index.ts', name: 'index.ts', content: '// API code' },
    { path: 'src/db/client.ts', relativePath: 'src/db/client.ts', name: 'client.ts', content: '// DB code' },
    { path: 'README.md', relativePath: 'README.md', name: 'README.md', content: '# Project' }
  );

  // Return in the expected structure with allFiles property
  return { allFiles: files };
};
