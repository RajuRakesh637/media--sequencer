import React, { useState } from 'react';

export default function SyncControl({
  mediaList,
  syncState,
  isGlobalSyncActive,
  syncRemainingSec,
  onTriggerSync,
  isSyncing
}) {
  const [selectedMediaId, setSelectedMediaId] = useState('');
  const [durationSec, setDurationSec] = useState(15);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMediaId) return;
    onTriggerSync(Number(selectedMediaId), Number(durationSec));
  };

  return (
    <div style={{
      backgroundColor: '#131a26',
      border: '1px solid #2a3a52',
      borderRadius: '12px',
      padding: '16px 20px',
      marginBottom: '24px'
    }}>
      {/* Top Banner if Global Sync is Active */}
      {isGlobalSyncActive && syncState?.mediaItem && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fca5a5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              display: 'inline-block',
              boxShadow: '0 0 8px #ef4444'
            }} />
            <span style={{ fontWeight: 700, color: '#f87171' }}>
              GLOBAL SYNC ACTIVE:
            </span>
            <span style={{ color: '#fff', fontWeight: 600 }}>
              "{syncState.mediaItem.name}" ({syncState.mediaItem.type})
            </span>
            <span style={{ fontSize: '13px', opacity: 0.9 }}>
              &mdash; All windows currently overridden
            </span>
          </div>

          <div style={{
            fontSize: '14px',
            fontWeight: 700,
            backgroundColor: '#ef4444',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: '6px'
          }}>
            {syncRemainingSec}s remaining
          </div>
        </div>
      )}

      {/* Control Form */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡ Global Sync Override</span>
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
            Override every window simultaneously to display a synchronized media item. Fallback is automatic.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Media Select */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
              Select Media Item
            </label>
            <select
              value={selectedMediaId}
              onChange={(e) => setSelectedMediaId(e.target.value)}
              required
              style={{
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                minWidth: '220px'
              }}
            >
              <option value="">-- Choose Media --</option>
              {mediaList.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.type}] {m.name} ({m.durationSec}s)
                </option>
              ))}
            </select>
          </div>

          {/* Duration Input */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
              Duration (Seconds)
            </label>
            <input
              type="number"
              min="1"
              max="3600"
              value={durationSec}
              onChange={(e) => setDurationSec(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                width: '100px'
              }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ alignSelf: 'flex-end' }}>
            <button
              type="submit"
              disabled={!selectedMediaId || isSyncing}
              style={{
                backgroundColor: isSyncing ? '#475569' : '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: selectedMediaId ? 'pointer' : 'not-allowed',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                transition: 'background-color 0.2s'
              }}
            >
              {isSyncing ? 'Triggering...' : 'Trigger Sync Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
