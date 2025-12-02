import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState, useCallback } from 'react';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/visual-validation-react';
import type { GraphConfiguration, NodeState, EdgeState, GraphEvent } from '@principal-ai/visual-validation-core';
import { EventControllerPanel } from './EventControllerPanel';

/**
 * EventControllerPanel controls event playback and emits events to GraphRenderer.
 * This demonstrates the panel-to-panel communication pattern where the EventController
 * stores events and plays them back, while GraphRenderer consumes them for animations.
 */
const meta = {
  title: 'Panels/EventControllerPanel',
  component: EventControllerPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Controls event playback and emits events to GraphRenderer. Provides play, pause, stop, step, and seek controls with variable speed playback.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div style={{ height: '100vh', width: '100vw', background: '#1a1a2e' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof EventControllerPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample configuration for the graph
const sampleConfiguration: GraphConfiguration = {
  metadata: {
    name: 'Event Playback Demo',
    version: '1.0.0',
    description: 'Demonstrates event playback between panels',
  },
  nodeTypes: {
    server: {
      shape: 'rectangle',
      color: '#8b5cf6',
      icon: 'Server',
      dataSchema: {
        name: { type: 'string', required: true, displayInLabel: true },
      },
      states: {
        idle: { label: 'Idle', color: '#6b7280' },
        processing: { label: 'Processing', color: '#3b82f6' },
        completed: { label: 'Completed', color: '#10b981' },
        error: { label: 'Error', color: '#ef4444' },
      },
    },
    client: {
      shape: 'circle',
      color: '#3b82f6',
      icon: 'Monitor',
      dataSchema: {
        name: { type: 'string', required: true, displayInLabel: true },
      },
      states: {
        disconnected: { label: 'Disconnected', color: '#6b7280' },
        connecting: { label: 'Connecting', color: '#f59e0b' },
        connected: { label: 'Connected', color: '#10b981' },
      },
    },
    database: {
      shape: 'hexagon',
      color: '#10b981',
      icon: 'Database',
      dataSchema: {
        name: { type: 'string', required: true, displayInLabel: true },
      },
    },
  },
  edgeTypes: {
    websocket: {
      style: 'solid',
      color: '#60a5fa',
      directed: true,
      animated: true,
    },
    query: {
      style: 'dashed',
      color: '#34d399',
      directed: true,
    },
  },
  allowedConnections: [
    { from: 'client', to: 'server', via: 'websocket' },
    { from: 'server', to: 'database', via: 'query' },
    { from: 'server', to: 'client', via: 'websocket' },
  ],
};

// Sample nodes
const sampleNodes: NodeState[] = [
  {
    id: 'client-1',
    type: 'client',
    data: { name: 'Client A' },
    position: { x: 100, y: 150 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'server-1',
    type: 'server',
    data: { name: 'Server' },
    position: { x: 350, y: 150 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'database-1',
    type: 'database',
    data: { name: 'Database' },
    position: { x: 600, y: 150 },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// Sample edges
const sampleEdges: EdgeState[] = [
  {
    id: 'edge-client-server',
    from: 'client-1',
    to: 'server-1',
    type: 'websocket',
    data: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'edge-server-db',
    from: 'server-1',
    to: 'database-1',
    type: 'query',
    data: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// Create a sequence of events that simulate a request flow
const createEventSequence = (): GraphEvent[] => {
  const baseTime = Date.now();

  return [
    // Client connects
    {
      id: 'evt-1',
      type: 'state_changed',
      timestamp: baseTime,
      category: 'state',
      operation: 'update',
      payload: {
        nodeId: 'client-1',
        newState: 'connecting',
      },
    },
    // Connection animation
    {
      id: 'evt-2',
      type: 'edge_animated',
      timestamp: baseTime + 500,
      category: 'edge',
      operation: 'animate',
      payload: {
        operation: 'animate',
        edgeId: 'edge-client-server',
        edgeType: 'websocket',
        from: 'client-1',
        to: 'server-1',
        animation: {
          duration: 1000,
          direction: 'forward' as const,
        },
      },
    },
    // Client connected
    {
      id: 'evt-3',
      type: 'state_changed',
      timestamp: baseTime + 1500,
      category: 'state',
      operation: 'update',
      payload: {
        nodeId: 'client-1',
        newState: 'connected',
      },
    },
    // Server processing
    {
      id: 'evt-4',
      type: 'state_changed',
      timestamp: baseTime + 2000,
      category: 'state',
      operation: 'update',
      payload: {
        nodeId: 'server-1',
        newState: 'processing',
      },
    },
    // Server queries database
    {
      id: 'evt-5',
      type: 'edge_animated',
      timestamp: baseTime + 2500,
      category: 'edge',
      operation: 'animate',
      payload: {
        operation: 'animate',
        edgeId: 'edge-server-db',
        edgeType: 'query',
        from: 'server-1',
        to: 'database-1',
        animation: {
          duration: 1200,
          direction: 'forward' as const,
        },
      },
    },
    // Server completed
    {
      id: 'evt-6',
      type: 'state_changed',
      timestamp: baseTime + 4000,
      category: 'state',
      operation: 'update',
      payload: {
        nodeId: 'server-1',
        newState: 'completed',
      },
    },
    // Response back to client
    {
      id: 'evt-7',
      type: 'edge_animated',
      timestamp: baseTime + 4500,
      category: 'edge',
      operation: 'animate',
      payload: {
        operation: 'animate',
        edgeId: 'edge-client-server',
        edgeType: 'websocket',
        from: 'server-1',
        to: 'client-1',
        animation: {
          duration: 1000,
          direction: 'backward' as const,
        },
      },
    },
  ];
};

/**
 * Combined Panel Demo - Shows EventControllerPanel and GraphRenderer working together
 * This is the main story demonstrating panel-to-panel communication
 */
export const CombinedPanelDemo: Story = {
  args: {
    events: [],
    onEventsEmit: () => {},
  },
  render: () => {
    const [events, setEvents] = useState<GraphEvent[]>([]);
    const eventSequence = React.useMemo(() => createEventSequence(), []);

    const handleEventsEmit = useCallback((emittedEvents: GraphEvent[]) => {
      setEvents(emittedEvents);
    }, []);

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* Graph Panel - Takes most of the space */}
        <div style={{ flex: 1, position: 'relative' }}>
          <GraphRenderer
            configuration={sampleConfiguration}
            nodes={sampleNodes}
            edges={sampleEdges}
            events={events}
            width="100%"
            height="100%"
            showMinimap={false}
            showControls={true}
            showBackground={true}
            onEventProcessed={(event) => {
              console.log('Event processed by GraphRenderer:', event.type);
            }}
          />
        </div>

        {/* Event Controller Panel - Sidebar */}
        <div style={{ width: '320px', borderLeft: '1px solid #333' }}>
          <EventControllerPanel
            events={eventSequence}
            onEventsEmit={handleEventsEmit}
            onPlaybackStateChange={(state) => {
              console.log('Playback state:', state);
            }}
            defaultSpeed={1}
            loop={false}
          />
        </div>
      </div>
    );
  },
};

/**
 * With Looping - Auto-restarts when reaching the end
 */
export const WithLooping: Story = {
  args: {
    events: [],
    onEventsEmit: () => {},
  },
  render: () => {
    const [events, setEvents] = useState<GraphEvent[]>([]);
    const eventSequence = React.useMemo(() => createEventSequence(), []);

    const handleEventsEmit = useCallback((emittedEvents: GraphEvent[]) => {
      setEvents(emittedEvents);
    }, []);

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <GraphRenderer
            configuration={sampleConfiguration}
            nodes={sampleNodes}
            edges={sampleEdges}
            events={events}
            width="100%"
            height="100%"
            showMinimap={false}
            showControls={true}
            showBackground={true}
          />
        </div>

        <div style={{ width: '320px', borderLeft: '1px solid #333' }}>
          <EventControllerPanel
            events={eventSequence}
            onEventsEmit={handleEventsEmit}
            defaultSpeed={1}
            loop={true}
          />
        </div>
      </div>
    );
  },
};

/**
 * Auto-Play - Starts playing automatically on mount
 */
export const AutoPlay: Story = {
  args: {
    events: [],
    onEventsEmit: () => {},
  },
  render: () => {
    const [events, setEvents] = useState<GraphEvent[]>([]);
    const eventSequence = React.useMemo(() => createEventSequence(), []);

    const handleEventsEmit = useCallback((emittedEvents: GraphEvent[]) => {
      setEvents(emittedEvents);
    }, []);

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <GraphRenderer
            configuration={sampleConfiguration}
            nodes={sampleNodes}
            edges={sampleEdges}
            events={events}
            width="100%"
            height="100%"
            showMinimap={false}
            showControls={true}
            showBackground={true}
          />
        </div>

        <div style={{ width: '320px', borderLeft: '1px solid #333' }}>
          <EventControllerPanel
            events={eventSequence}
            onEventsEmit={handleEventsEmit}
            defaultSpeed={1}
            autoPlay={true}
            loop={true}
          />
        </div>
      </div>
    );
  },
};

/**
 * Fast Playback - Default speed set to 2x
 */
export const FastPlayback: Story = {
  args: {
    events: [],
    onEventsEmit: () => {},
  },
  render: () => {
    const [events, setEvents] = useState<GraphEvent[]>([]);
    const eventSequence = React.useMemo(() => createEventSequence(), []);

    const handleEventsEmit = useCallback((emittedEvents: GraphEvent[]) => {
      setEvents(emittedEvents);
    }, []);

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <GraphRenderer
            configuration={sampleConfiguration}
            nodes={sampleNodes}
            edges={sampleEdges}
            events={events}
            width="100%"
            height="100%"
            showMinimap={false}
            showControls={true}
            showBackground={true}
          />
        </div>

        <div style={{ width: '320px', borderLeft: '1px solid #333' }}>
          <EventControllerPanel
            events={eventSequence}
            onEventsEmit={handleEventsEmit}
            defaultSpeed={2}
          />
        </div>
      </div>
    );
  },
};

/**
 * Empty State - No events loaded
 */
export const EmptyState: Story = {
  args: {
    events: [],
    onEventsEmit: () => {},
  },
  render: () => {
    const [events, setEvents] = useState<GraphEvent[]>([]);

    const handleEventsEmit = useCallback((emittedEvents: GraphEvent[]) => {
      setEvents(emittedEvents);
    }, []);

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <GraphRenderer
            configuration={sampleConfiguration}
            nodes={sampleNodes}
            edges={sampleEdges}
            events={events}
            width="100%"
            height="100%"
            showMinimap={false}
            showControls={true}
            showBackground={true}
          />
        </div>

        <div style={{ width: '320px', borderLeft: '1px solid #333' }}>
          <EventControllerPanel
            events={[]}
            onEventsEmit={handleEventsEmit}
          />
        </div>
      </div>
    );
  },
};

/**
 * Standalone Controller - Just the event controller panel
 */
export const StandaloneController: Story = {
  args: {
    events: [],
    onEventsEmit: () => {},
  },
  render: () => {
    const eventSequence = React.useMemo(() => createEventSequence(), []);

    return (
      <div style={{ width: '320px', height: '600px', margin: '20px auto' }}>
        <EventControllerPanel
          events={eventSequence}
          onEventsEmit={(events) => {
            console.log('Events emitted:', events.length);
          }}
          onPlaybackStateChange={(state) => {
            console.log('Playback state:', state);
          }}
        />
      </div>
    );
  },
};

/**
 * Many Events - Demonstrates scrolling in the event list
 */
export const ManyEvents: Story = {
  args: {
    events: [],
    onEventsEmit: () => {},
  },
  render: () => {
    const [events, setEvents] = useState<GraphEvent[]>([]);

    // Create a longer sequence of events
    const eventSequence = React.useMemo(() => {
      const baseTime = Date.now();
      const events: GraphEvent[] = [];

      for (let i = 0; i < 20; i++) {
        events.push({
          id: `evt-${i * 2}`,
          type: 'edge_animated',
          timestamp: baseTime + (i * 800),
          category: 'edge',
          operation: 'animate',
          payload: {
            operation: 'animate',
            edgeId: i % 2 === 0 ? 'edge-client-server' : 'edge-server-db',
            edgeType: i % 2 === 0 ? 'websocket' : 'query',
            from: i % 2 === 0 ? 'client-1' : 'server-1',
            to: i % 2 === 0 ? 'server-1' : 'database-1',
            animation: {
              duration: 600,
              direction: 'forward' as const,
            },
          },
        });
        events.push({
          id: `evt-${i * 2 + 1}`,
          type: 'state_changed',
          timestamp: baseTime + (i * 800) + 400,
          category: 'state',
          operation: 'update',
          payload: {
            nodeId: 'server-1',
            newState: i % 3 === 0 ? 'processing' : i % 3 === 1 ? 'completed' : 'idle',
          },
        });
      }

      return events;
    }, []);

    const handleEventsEmit = useCallback((emittedEvents: GraphEvent[]) => {
      setEvents(emittedEvents);
    }, []);

    return (
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <GraphRenderer
            configuration={sampleConfiguration}
            nodes={sampleNodes}
            edges={sampleEdges}
            events={events}
            width="100%"
            height="100%"
            showMinimap={false}
            showControls={true}
            showBackground={true}
          />
        </div>

        <div style={{ width: '320px', borderLeft: '1px solid #333' }}>
          <EventControllerPanel
            events={eventSequence}
            onEventsEmit={handleEventsEmit}
            defaultSpeed={2}
          />
        </div>
      </div>
    );
  },
};
