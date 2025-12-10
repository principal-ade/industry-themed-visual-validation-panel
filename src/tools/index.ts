/**
 * Panel Tools
 *
 * UTCP-compatible tools for the Principal View panel extension.
 * These tools can be invoked by AI agents and emit events that panels listen for.
 *
 * IMPORTANT: This file should NOT import any React components to ensure
 * it can be imported server-side without pulling in React dependencies.
 * Use the './tools' subpath export for server-safe imports.
 */

import type { PanelTool, PanelToolsMetadata } from '@principal-ade/utcp-panel-event';

/**
 * Tool: Focus Node
 */
export const focusNodeTool: PanelTool = {
  name: 'focus_node',
  description: 'Focuses the graph view on a specific node',
  inputs: {
    type: 'object',
    properties: {
      nodeId: {
        type: 'string',
        description: 'The ID of the node to focus on',
      },
      animate: {
        type: 'boolean',
        description: 'Whether to animate the transition',
      },
    },
    required: ['nodeId'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
    },
  },
  tags: ['graph', 'navigation', 'focus'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'industry-theme.principal-view-panels:focus-node',
  },
};

/**
 * Tool: Reset View
 */
export const resetViewTool: PanelTool = {
  name: 'reset_view',
  description: 'Resets the graph view to fit all nodes',
  inputs: {
    type: 'object',
    properties: {
      animate: {
        type: 'boolean',
        description: 'Whether to animate the reset',
      },
    },
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
    },
  },
  tags: ['graph', 'navigation', 'reset'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'industry-theme.principal-view-panels:reset-view',
  },
};

/**
 * Tool: Trigger Event
 */
export const triggerEventTool: PanelTool = {
  name: 'trigger_event',
  description: 'Triggers a graph event for animation or state change',
  inputs: {
    type: 'object',
    properties: {
      eventType: {
        type: 'string',
        description: 'The type of event to trigger',
      },
      sourceNodeId: {
        type: 'string',
        description: 'The source node ID for the event',
      },
      targetNodeId: {
        type: 'string',
        description: 'The target node ID for the event',
      },
      payload: {
        type: 'object',
        description: 'Additional event payload data',
      },
    },
    required: ['eventType'],
  },
  outputs: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      eventId: { type: 'string' },
    },
  },
  tags: ['graph', 'event', 'animation'],
  tool_call_template: {
    call_template_type: 'panel_event',
    event_type: 'industry-theme.principal-view-panels:trigger-event',
  },
};

/**
 * All tools exported as an array.
 */
export const principalViewPanelTools: PanelTool[] = [
  focusNodeTool,
  resetViewTool,
  triggerEventTool,
];

/**
 * Panel tools metadata for registration with PanelToolRegistry.
 */
export const principalViewPanelToolsMetadata: PanelToolsMetadata = {
  id: 'industry-theme.principal-view-panels',
  name: 'Principal View Panels',
  description: 'Tools provided by the principal view graph panel extension',
  tools: principalViewPanelTools,
};
