import React from 'react';
import MediaItemRenderer from './MediaItemRenderer';

export default function WindowTile({
  window,
  playbackState,
  isGlobalSyncActive,
  syncMediaItem,
  syncRemainingSec,
  onOpenAddMedia
}) {
  const isSync = isGlobalSyncActive && syncMediaItem;
  const currentItem = isSync ? syncMediaItem : playbackState?.mediaItem;
  const offsetSec = isSync ? 0 : (playbackState?.offsetSec || 0);
  const durationSec = isSync ? (syncMediaItem?.durationSec || 0) : (currentItem?.durationSec || 1);
  const progressPercent = Math.min(100, Math.max(0, (offsetSec / durationSec) * 100));

  return (
    <div style={{
      backgroundColor: '#182234',
      borderRadius: '12px',
      border: isSync ? '2px solid #f43f5e' : '1px solid #2a3a52',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: isSync ? '0 0 20px rgba(244, 63, 94, 0.25)' : '0 4px 6px -1px rgba(0,0,0,0.3)',
      transition: 'border-color 0.3s, box-shadow 0.3s'
    }}>
      {/* Tile Header */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#131a26',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #2a3a52'
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>
            {window.name}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
            Window #{window.id} &bull; Anchor: {window.cycleAnchor}
          </div>
        </div>

        {isSync ? (
          <span style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '12px',
            letterSpacing: '0.5px',
            animation: 'pulse 1.5s infinite'
          }}>
            SYNC ({syncRemainingSec}s)
          </span>
        ) : (
          <span style={{
            backgroundColor: '#0f766e',
            color: '#5eead4',
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '12px'
          }}>
            CYCLE
          </span>
        )}
      </div>

      {/* Screen Area */}
      <div style={{ padding: '12px' }}>
        <MediaItemRenderer
          mediaItem={currentItem}
          offsetSec={offsetSec}
          isSync={isSync}
        />
      </div>

      {/* Progress & Timing Bar */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#94a3b8',
          marginBottom: '6px'
        }}>
          <span>
            {isSync ? (
              <strong style={{ color: '#f43f5e' }}>Global Override</strong>
            ) : (
              <span>Pos: <strong>#{playbackState?.entryIndex + 1 || 1}</strong> of {window.playlist?.length || 0}</span>
            )}
          </span>
          <span style={{ fontFamily: 'monospace' }}>
            {Math.floor(offsetSec)}s / {durationSec}s
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '4px',
          width: '100%',
          backgroundColor: '#334155',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: isSync ? '100%' : `${progressPercent}%`,
            backgroundColor: isSync ? '#f43f5e' : '#06b6d4',
            transition: 'width 1s linear'
          }} />
        </div>
      </div>

      {/* Playlist Items & Add Button */}
      <div style={{
        marginTop: 'auto',
        padding: '12px 16px',
        backgroundColor: '#0f172a',
        borderTop: '1px solid #1e293b'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Playlist ({window.playlist?.length || 0} items)
          </span>
          <button
            onClick={() => onOpenAddMedia(window)}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            + Add Media
          </button>
        </div>

        {/* Horizontal Mini Playlist Preview */}
        <div style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {window.playlist?.map((entry, index) => {
            const isPlayingThis = !isSync && playbackState?.entryIndex === index;
            return (
              <div
                key={entry.id || index}
                style={{
                  flexShrink: 0,
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: isPlayingThis ? 'rgba(6, 182, 212, 0.2)' : '#1e293b',
                  border: isPlayingThis ? '1px solid #06b6d4' : '1px solid #334155',
                  color: isPlayingThis ? '#67e8f9' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title={`${entry.mediaItem?.name} (${entry.mediaItem?.durationSec}s)`}
              >
                <span>{entry.mediaItem?.type === 'IMAGE' ? '🖼️' : entry.mediaItem?.type === 'VIDEO' ? '🎥' : '⬛'}</span>
                <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.mediaItem?.name}
                </span>
                <span style={{ opacity: 0.7 }}>({entry.mediaItem?.durationSec}s)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
