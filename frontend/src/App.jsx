import React, { useState, useEffect, useRef, useCallback } from 'react';
import WindowTile from './components/WindowTile';
import SyncControl from './components/SyncControl';
import AddMediaModal from './components/AddMediaModal';

const CYCLE_SECONDS = 18000; // 5 hours constant

export default function App() {
  const [windows, setWindows] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [syncState, setSyncState] = useState(null);
  const [clockOffsetMs, setClockOffsetMs] = useState(0);
  const [serverTimeSec, setServerTimeSec] = useState(Math.floor(Date.now() / 1000));
  const [activeModalWindow, setActiveModalWindow] = useState(null);
  const [isSubmittingMedia, setIsSubmittingMedia] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clockOffsetRef = useRef(0);

  // 1. Initial Load: Measure clock skew once from GET /api/time
  useEffect(() => {
    async function initApp() {
      try {
        setLoading(true);
        // Step 1: Clock skew calibration
        const t0 = Date.now();
        const timeRes = await fetch('/api/time');
        const timeData = await timeRes.json();
        const t1 = Date.now();
        const roundTrip = (t1 - t0) / 2;
        // Server time corresponding to local t1:
        const calculatedOffset = (timeData.epochMillis + roundTrip) - t1;
        clockOffsetRef.current = calculatedOffset;
        setClockOffsetMs(calculatedOffset);

        // Step 2: Fetch windows & media & initial sync
        const [windowsRes, mediaRes, syncRes] = await Promise.all([
          fetch('/api/windows'),
          fetch('/api/media'),
          fetch('/api/sync')
        ]);

        const windowsData = await windowsRes.json();
        const mediaData = await mediaRes.json();
        const syncData = await syncRes.json();

        setWindows(windowsData);
        setMediaList(mediaData);
        setSyncState(syncData);
        setError(null);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to connect to backend server. Ensure Spring Boot is running on port 8080.');
      } finally {
        setLoading(false);
      }
    }

    initApp();
  }, []);

  // 2. Poll /api/sync every 2s
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/sync');
        if (res.ok) {
          const data = await res.json();
          setSyncState(data);
        }
      } catch (e) {
        // Silently handle temporary network hiccups
      }
    }, 2000);

    return () => clearInterval(syncInterval);
  }, []);

  // 3. One setInterval tick per second recomputes all windows
  useEffect(() => {
    const tickInterval = setInterval(() => {
      const nowMs = Date.now() + clockOffsetRef.current;
      setServerTimeSec(Math.floor(nowMs / 1000));
    }, 1000);

    return () => clearInterval(tickInterval);
  }, []);

  // Compute playback position for a window based on deterministic cycle
  const computePlayback = useCallback((win) => {
    if (!win.playlist || win.playlist.length === 0) {
      return null;
    }

    const totalDuration = win.playlist.reduce(
      (sum, entry) => sum + (entry.mediaItem?.durationSec || 0),
      0
    );
    if (totalDuration <= 0) return null;

    const anchor = win.cycleAnchor || 0;
    // elapsed = (serverNow - cycleAnchor) mod CYCLE_SECONDS
    const elapsed = ((serverTimeSec - anchor) % CYCLE_SECONDS + CYCLE_SECONDS) % CYCLE_SECONDS;
    // posInList = elapsed mod sum(playlist durations)
    let posInList = elapsed % totalDuration;

    // Walk entries to find current item + seconds already elapsed into it
    for (let i = 0; i < win.playlist.length; i++) {
      const entry = win.playlist[i];
      const dur = entry.mediaItem?.durationSec || 0;
      if (posInList < dur) {
        return {
          entryIndex: i,
          mediaItem: entry.mediaItem,
          offsetSec: posInList,
          remainingSec: dur - posInList,
          totalDuration: dur
        };
      }
      posInList -= dur;
    }

    return {
      entryIndex: 0,
      mediaItem: win.playlist[0].mediaItem,
      offsetSec: 0,
      remainingSec: win.playlist[0].mediaItem.durationSec,
      totalDuration: win.playlist[0].mediaItem.durationSec
    };
  }, [serverTimeSec]);

  // Check whether global sync is currently active
  const isGlobalSyncActive = Boolean(
    syncState?.mediaItem &&
    syncState?.startEpoch &&
    syncState?.durationSec &&
    serverTimeSec >= syncState.startEpoch &&
    serverTimeSec < (syncState.startEpoch + syncState.durationSec)
  );

  const syncRemainingSec = isGlobalSyncActive
    ? Math.max(0, (syncState.startEpoch + syncState.durationSec) - serverTimeSec)
    : 0;

  // Handle triggering sync override
  const handleTriggerSync = async (mediaId, durationSec) => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, durationSec })
      });
      if (!res.ok) throw new Error('Failed to set sync');
      const data = await res.json();
      setSyncState(data);
    } catch (err) {
      alert('Error triggering sync: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle adding media to a window
  const handleAddMedia = async (windowId, payload) => {
    try {
      setIsSubmittingMedia(true);
      const res = await fetch(`/api/windows/${windowId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to add media');
      const updatedWindow = await res.json();

      setWindows((prev) =>
        prev.map((w) => (w.id === updatedWindow.id ? updatedWindow : w))
      );

      // Refresh media library in case an inline media item was created
      const mediaRes = await fetch('/api/media');
      if (mediaRes.ok) {
        setMediaList(await mediaRes.json());
      }

      setActiveModalWindow(null);
    } catch (err) {
      alert('Error adding media: ' + err.message);
    } finally {
      setIsSubmittingMedia(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Top Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #1e293b'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>
            Multi-Window Media Sequencer
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
            Deterministic clock-based playback &bull; Zero stream overhead &bull; Continuous synchronization
          </p>
        </div>

        {/* Live Clock & Calibration Badge */}
        <div style={{
          backgroundColor: '#131a26',
          border: '1px solid #2a3a52',
          borderRadius: '8px',
          padding: '8px 16px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Server Clock
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
            {new Date(serverTimeSec * 1000).toLocaleTimeString()}
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
            Skew Offset: {clockOffsetMs > 0 ? `+${clockOffsetMs}ms` : `${clockOffsetMs}ms`}
          </div>
        </div>
      </header>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          color: '#fca5a5',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Sync Control Component */}
      <SyncControl
        mediaList={mediaList}
        syncState={syncState}
        isGlobalSyncActive={isGlobalSyncActive}
        syncRemainingSec={syncRemainingSec}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
      />

      {/* Main Window Tiles Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          Loading display windows and synchronizing clock...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          {windows.map((win) => {
            const playbackState = computePlayback(win);
            return (
              <WindowTile
                key={win.id}
                window={win}
                playbackState={playbackState}
                isGlobalSyncActive={isGlobalSyncActive}
                syncMediaItem={syncState?.mediaItem}
                syncRemainingSec={syncRemainingSec}
                onOpenAddMedia={(w) => setActiveModalWindow(w)}
              />
            );
          })}
        </div>
      )}

      {/* Add Media Modal */}
      {activeModalWindow && (
        <AddMediaModal
          window={activeModalWindow}
          mediaList={mediaList}
          onClose={() => setActiveModalWindow(null)}
          onAddMedia={handleAddMedia}
          isSubmitting={isSubmittingMedia}
        />
      )}
    </div>
  );
}
