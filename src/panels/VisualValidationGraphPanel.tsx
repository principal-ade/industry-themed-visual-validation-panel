import React, { useState, useEffect, useCallback } from 'react';
import type { PanelComponentProps } from '@principal-ade/panel-framework-core';
import { useTheme } from '@principal-ade/industry-theme';
import { GraphRenderer } from '@principal-ai/visual-validation-react';
import type { PathBasedGraphConfiguration, NodeState, EdgeState } from '@principal-ai/visual-validation-core';
import { FileText, AlertCircle, Loader } from 'lucide-react';
import { ConfigLoader } from './visual-validation/ConfigLoader';
import { GraphConverter } from './visual-validation/GraphConverter';

interface GraphPanelState {
  config: PathBasedGraphConfiguration | null;
  nodes: NodeState[];
  edges: EdgeState[];
  loading: boolean;
  error: string | null;
}

/**
 * Visual Validation Graph Panel
 *
 * Visualizes vvf.config.yaml configuration files as interactive graph diagrams
 */
export const VisualValidationGraphPanel: React.FC<PanelComponentProps> = ({
  context,
  events
}) => {
  const { theme } = useTheme();
  const [state, setState] = useState<GraphPanelState>({
    config: null,
    nodes: [],
    edges: [],
    loading: true,
    error: null
  });

  const loadConfiguration = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check if fileTree slice is available
      if (!context.hasSlice('fileTree')) {
        throw new Error('File tree data not available');
      }

      if (context.isSliceLoading('fileTree')) {
        // Still loading, keep in loading state
        return;
      }

      const fileTreeSlice = context.getSlice('fileTree');
      const fileTreeData = fileTreeSlice?.data;

      // For now, we'll expect fileTree to be an array of files
      // This may need adjustment based on actual FileTree structure
      const files = Array.isArray(fileTreeData) ? fileTreeData : (fileTreeData as { files?: unknown[] })?.files || [];

      // Look for vvf.config.yaml
      const configContent = ConfigLoader.findConfigContent(files);

      if (!configContent) {
        throw new Error('No vvf.config.yaml found in project root');
      }

      // Parse YAML config
      const config = ConfigLoader.parseYaml(configContent);

      // Convert config to nodes/edges
      const { nodes, edges } = GraphConverter.configToGraph(config);

      setState({
        config,
        nodes,
        edges,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        config: null,
        nodes: [],
        edges: [],
        loading: false,
        error: (error as Error).message
      });
    }
  }, [context]);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  // Subscribe to data refresh events
  useEffect(() => {
    const unsubscribe = events.on('data:refresh', () => {
      loadConfiguration();
    });

    return unsubscribe;
  }, [events, loadConfiguration]);

  if (state.loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.body
      }}>
        <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: theme.space[2] }}>
          Loading configuration...
        </span>
      </div>
    );
  }

  if (state.error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: theme.space[4],
        color: theme.colors.error,
        fontFamily: theme.fonts.body,
        textAlign: 'center'
      }}>
        <AlertCircle size={48} />
        <h3 style={{ marginTop: theme.space[3], marginBottom: theme.space[2] }}>
          Configuration Error
        </h3>
        <p style={{ color: theme.colors.textMuted, marginTop: theme.space[2], maxWidth: '400px' }}>
          {state.error}
        </p>
        <button
          onClick={loadConfiguration}
          style={{
            marginTop: theme.space[4],
            padding: `${theme.space[2]} ${theme.space[4]}`,
            backgroundColor: theme.colors.primary,
            color: theme.colors.background,
            border: 'none',
            borderRadius: theme.radii[1],
            cursor: 'pointer',
            fontFamily: theme.fonts.body,
            fontSize: theme.fontSizes[2]
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!state.config) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: theme.space[4],
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.body,
        textAlign: 'center'
      }}>
        <FileText size={48} />
        <h3 style={{ marginTop: theme.space[3], marginBottom: theme.space[2] }}>
          No Configuration Found
        </h3>
        <p style={{ maxWidth: '400px' }}>
          Add a <code style={{ backgroundColor: theme.colors.backgroundSecondary, padding: '2px 4px', borderRadius: theme.radii[0] }}>vvf.config.yaml</code> file to your project root to visualize your component graph.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: theme.fonts.body
    }}>
      {/* Header */}
      <div style={{
        padding: `${theme.space[4]} ${theme.space[5]}`,
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.background,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: theme.fontSizes[3],
              fontWeight: theme.fontWeights.medium,
              color: theme.colors.text
            }}>
              {state.config.metadata.name}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.space[2],
              marginTop: theme.space[1]
            }}>
              <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
                v{state.config.metadata.version}
              </span>
              {state.config.metadata.description && (
                <>
                  <span style={{ color: theme.colors.textMuted }}>•</span>
                  <span style={{ fontSize: theme.fontSizes[1], color: theme.colors.textMuted }}>
                    {state.config.metadata.description}
                  </span>
                </>
              )}
            </div>
          </div>
          <div style={{
            fontSize: theme.fontSizes[1],
            color: theme.colors.textMuted
          }}>
            {state.nodes.length} component{state.nodes.length !== 1 ? 's' : ''} • {state.edges.length} connection{state.edges.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Graph */}
      <div style={{ flex: 1, position: 'relative' }}>
        <GraphRenderer
          configuration={state.config}
          nodes={state.nodes}
          edges={state.edges}
          showMinimap={true}
          showControls={true}
          showBackground={true}
        />
      </div>
    </div>
  );
};
