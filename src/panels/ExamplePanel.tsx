import React, { useEffect, useState } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import type { PanelComponentProps } from '../types';

/**
 * ExamplePanel - A simple panel demonstrating the panel framework integration.
 *
 * This panel shows:
 * - How to access panel context (repository info, data slices)
 * - How to use panel actions (open files, navigate)
 * - How to subscribe to panel events
 * - How to display loading states
 */
export const ExamplePanel: React.FC<PanelComponentProps> = ({
  context,
  actions,
  events,
}) => {
  const [eventLog, setEventLog] = useState<string[]>([]);

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

  // Check if git data is available
  const hasGitData = context.hasSlice('git');

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <FileText size={24} />
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Example Panel</h2>
        <button
          onClick={handleRefresh}
          style={{
            marginLeft: 'auto',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer',
          }}
          disabled={context.loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Repository Info */}
      <section
        style={{
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
          Repository Info
        </h3>
        {context.repositoryPath ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <strong>Path:</strong> <code>{context.repositoryPath}</code>
            </div>
            {context.repository?.name && (
              <div>
                <strong>Name:</strong> {context.repository.name}
              </div>
            )}
            {context.repository?.branch && (
              <div>
                <strong>Branch:</strong> {context.repository.branch}
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: '#666', margin: 0 }}>No repository loaded</p>
        )}
      </section>

      {/* Git Status */}
      {hasGitData && (
        <section
          style={{
            padding: '16px',
            background: '#f0f9ff',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
            Git Status
          </h3>
          {context.gitStatusLoading ? (
            <p style={{ color: '#666', margin: 0 }}>Loading git status...</p>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <div>
                <strong>Staged:</strong> {context.gitStatus.staged.length} files
              </div>
              <div>
                <strong>Unstaged:</strong> {context.gitStatus.unstaged.length}{' '}
                files
              </div>
              <div>
                <strong>Untracked:</strong> {context.gitStatus.untracked.length}{' '}
                files
              </div>
            </div>
          )}
        </section>
      )}

      {/* Event Log */}
      <section
        style={{
          padding: '16px',
          background: '#fff9e6',
          borderRadius: '8px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Event Log</h3>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            background: 'white',
            padding: '12px',
            borderRadius: '4px',
            border: '1px solid #e6ddc4',
          }}
        >
          {eventLog.length === 0 ? (
            <p style={{ color: '#666', margin: 0 }}>No events yet...</p>
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
          background: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>
          Example Actions
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => actions.openFile?.('README.md')}
            style={{
              padding: '8px 16px',
              border: '1px solid #007bff',
              borderRadius: '4px',
              background: '#007bff',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Open README.md
          </button>
          <button
            onClick={() => actions.navigateToPanel?.('git-status')}
            style={{
              padding: '8px 16px',
              border: '1px solid #28a745',
              borderRadius: '4px',
              background: '#28a745',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Navigate to Git Panel
          </button>
        </div>
      </section>
    </div>
  );
};
