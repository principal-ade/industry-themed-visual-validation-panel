import React, { useEffect, useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { ThemeProvider, useTheme } from '@principal-ade/industry-theme';
import type { PanelComponentProps } from '../types';

/**
 * ExamplePanelContent - Internal component that uses theme
 */
const ExamplePanelContent: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const [eventLog, setEventLog] = useState<string[]>([]);
  const { theme } = useTheme();

  // Subscribe to panel events
  useEffect(() => {
    const unsubscribe = events.on<{ filePath: string }>(
      'file:opened',
      (event) => {
        const timestamp = new Date().toLocaleTimeString();
        setEventLog((prev) => [
          ...prev,
          `[${timestamp}] File opened: ${event.payload?.filePath || 'unknown'}`,
        ]);
      }
    );

    return unsubscribe;
  }, [events]);

  // Example: Handle refresh button click
  const handleRefresh = async () => {
    try {
      await context.refresh();
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
  };

  // Get data slices
  const gitSlice = context.getSlice<{
    staged: string[];
    unstaged: string[];
    untracked: string[];
    deleted: string[];
  }>('git');

  const hasGitData = context.hasSlice('git');
  const isGitLoading = context.isSliceLoading('git');

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: theme.fonts.body,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <FileText size={24} color={theme.colors.primary} />
        <h2
          style={{
            margin: 0,
            fontSize: theme.fontSizes[4],
            color: theme.colors.text,
          }}
        >
          Example Panel
        </h2>
        <button
          onClick={handleRefresh}
          style={{
            marginLeft: 'auto',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii[1],
            background: theme.colors.surface,
            color: theme.colors.text,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Repository Info */}
      <section
        style={{
          padding: '16px',
          background: theme.colors.backgroundSecondary,
          borderRadius: theme.radii[2],
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: theme.fontSizes[3],
            color: theme.colors.text,
          }}
        >
          Repository Info
        </h3>
        {context.currentScope.repository ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <strong style={{ color: theme.colors.text }}>Path:</strong>{' '}
              <code
                style={{
                  fontFamily: theme.fonts.monospace,
                  color: theme.colors.textSecondary,
                }}
              >
                {context.currentScope.repository.path}
              </code>
            </div>
            <div>
              <strong style={{ color: theme.colors.text }}>Name:</strong>{' '}
              {context.currentScope.repository.name}
            </div>
          </div>
        ) : (
          <p style={{ color: theme.colors.textMuted, margin: 0 }}>
            No repository loaded
          </p>
        )}
      </section>

      {/* Git Status */}
      {hasGitData && (
        <section
          style={{
            padding: '16px',
            background: theme.colors.backgroundSecondary,
            borderRadius: theme.radii[2],
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <h3
            style={{
              margin: '0 0 12px 0',
              fontSize: theme.fontSizes[3],
              color: theme.colors.text,
            }}
          >
            Git Status
          </h3>
          {isGitLoading ? (
            <p style={{ color: theme.colors.textMuted, margin: 0 }}>
              Loading git status...
            </p>
          ) : gitSlice?.data ? (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div>
                <strong style={{ color: theme.colors.success }}>Staged:</strong>{' '}
                {gitSlice.data.staged.length} files
              </div>
              <div>
                <strong style={{ color: theme.colors.warning }}>
                  Unstaged:
                </strong>{' '}
                {gitSlice.data.unstaged.length} files
              </div>
              <div>
                <strong style={{ color: theme.colors.info }}>Untracked:</strong>{' '}
                {gitSlice.data.untracked.length} files
              </div>
            </div>
          ) : (
            <p style={{ color: theme.colors.textMuted, margin: 0 }}>
              No git data available
            </p>
          )}
        </section>
      )}

      {/* Event Log */}
      <section
        style={{
          padding: '16px',
          background: theme.colors.backgroundSecondary,
          borderRadius: theme.radii[2],
          border: `1px solid ${theme.colors.border}`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: theme.fontSizes[3],
            color: theme.colors.text,
          }}
        >
          Event Log
        </h3>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            fontFamily: theme.fonts.monospace,
            fontSize: theme.fontSizes[1],
            background: theme.colors.background,
            color: theme.colors.textSecondary,
            padding: '12px',
            borderRadius: theme.radii[1],
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          {eventLog.length === 0 ? (
            <p style={{ color: theme.colors.textMuted, margin: 0 }}>
              No events yet...
            </p>
          ) : (
            eventLog.map((log, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Example Actions */}
      <section
        style={{
          padding: '16px',
          background: theme.colors.backgroundSecondary,
          borderRadius: theme.radii[2],
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: theme.fontSizes[3],
            color: theme.colors.text,
          }}
        >
          Example Actions
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => actions.openFile?.('README.md')}
            style={{
              padding: '8px 16px',
              border: `1px solid ${theme.colors.primary}`,
              borderRadius: theme.radii[1],
              background: theme.colors.primary,
              color: theme.colors.background,
              cursor: 'pointer',
              fontWeight: theme.fontWeights.medium,
            }}
          >
            Open README.md
          </button>
          <button
            onClick={() => actions.navigateToPanel?.('git-status')}
            style={{
              padding: '8px 16px',
              border: `1px solid ${theme.colors.success}`,
              borderRadius: theme.radii[1],
              background: theme.colors.success,
              color: theme.colors.background,
              cursor: 'pointer',
              fontWeight: theme.fontWeights.medium,
            }}
          >
            Navigate to Git Panel
          </button>
        </div>
      </section>
    </div>
  );
};

/**
 * ExamplePanel - A simple panel demonstrating the panel framework integration.
 *
 * This panel shows:
 * - How to access panel context (repository info, data slices)
 * - How to use panel actions (open files, navigate)
 * - How to subscribe to panel events
 * - How to display loading states
 * - How to use the industry theme
 */
export const ExamplePanel: React.FC<PanelComponentProps> = (props) => {
  return (
    <ThemeProvider>
      <ExamplePanelContent {...props} />
    </ThemeProvider>
  );
};
