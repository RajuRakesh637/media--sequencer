import React, { useEffect, useRef } from 'react';

export default function MediaItemRenderer({ mediaItem, offsetSec = 0, isSync = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (mediaItem?.type === 'VIDEO' && videoRef.current) {
      const video = videoRef.current;
      const targetTime = offsetSec;
      // Seek only if difference exceeds 1.5s to prevent stutter while keeping sync
      if (Math.abs(video.currentTime - targetTime) > 1.5) {
        video.currentTime = targetTime;
      }
      if (video.paused) {
        video.play().catch(() => {});
      }
    }
  }, [mediaItem, offsetSec]);

  if (!mediaItem) {
    return (
      <div style={{
        height: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e293b',
        color: '#64748b',
        borderRadius: '8px'
      }}>
        <span>Empty Playlist</span>
      </div>
    );
  }

  if (mediaItem.type === 'IMAGE') {
    return (
      <div style={{
        height: '240px',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#0f172a'
      }}>
        <img
          src={mediaItem.url}
          alt={mediaItem.name || 'Media Image'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#cbd5e1'
        }}>
          IMG: {mediaItem.name}
        </div>
      </div>
    );
  }

  if (mediaItem.type === 'VIDEO') {
    return (
      <div style={{
        height: '240px',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#000'
      }}>
        <video
          ref={videoRef}
          src={mediaItem.url}
          autoPlay
          muted
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#cbd5e1'
        }}>
          VIDEO: {mediaItem.name} ({Math.floor(offsetSec)}s / {mediaItem.durationSec}s)
        </div>
      </div>
    );
  }

  // BLANK PANEL
  return (
    <div style={{
      height: '240px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#334155',
      color: '#cbd5e1',
      borderRadius: '8px',
      border: '2px dashed #475569',
      padding: '16px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '28px',
        marginBottom: '8px',
        opacity: 0.6
      }}>
        ⬛
      </div>
      <div style={{ fontWeight: 600, fontSize: '15px' }}>BLANK SCREEN</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
        {mediaItem.name || 'Intermission'}
      </div>
    </div>
  );
}
