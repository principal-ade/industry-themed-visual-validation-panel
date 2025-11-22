import type { PathBasedGraphConfiguration, NodeState, EdgeState } from '@principal-ai/visual-validation-core';

/**
 * Converts PathBasedGraphConfiguration to nodes and edges for visualization
 */
export class GraphConverter {
  /**
   * Convert configuration to nodes and edges
   */
  static configToGraph(config: PathBasedGraphConfiguration): {
    nodes: NodeState[];
    edges: EdgeState[];
  } {
    const nodes: NodeState[] = [];
    const edges: EdgeState[] = [];
    const now = Date.now();

    // Create nodes from nodeTypes
    Object.entries(config.nodeTypes).forEach(([id, nodeType]) => {
      nodes.push({
        id,
        type: id,
        data: {
          label: id,
          shape: nodeType.shape,
          icon: nodeType.icon,
          color: nodeType.color,
          sources: nodeType.sources || [],
          actions: nodeType.actions || [],
          ...nodeType.dataSchema
        },
        state: 'idle',
        createdAt: now,
        updatedAt: now
      });
    });

    // Create edges from allowedConnections
    if (config.allowedConnections) {
      config.allowedConnections.forEach((connection, index) => {
        const edgeType = config.edgeTypes?.[connection.via];

        edges.push({
          id: `${connection.from}-${connection.to}-${index}`,
          type: connection.via,
          from: connection.from,
          to: connection.to,
          data: {
            label: edgeType?.label || connection.via,
            style: edgeType?.style || 'solid',
            color: edgeType?.color,
            width: edgeType?.width
          },
          createdAt: now,
          updatedAt: now
        });
      });
    }

    return { nodes, edges };
  }
}
