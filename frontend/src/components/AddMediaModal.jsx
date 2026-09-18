import React, { useState } from 'react';

export default function AddMediaModal({
  window,
  mediaList,
  onClose,
  onAddMedia,
  isSubmitting
}) {
  const [tab, setTab] = useState('existing'); // 'existing' or 'custom'
  const [selectedMediaId, setSelectedMediaId] = useState(mediaList[0]?.id || '');
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState('IMAGE');
  const [customUrl, setCustomUrl] = useState('');
  const [customDuration, setCustomDuration] = useState(15);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tab === 'existing') {
      if (!selectedMediaId) return;
      onAddMedia(window.id, { mediaId: Number(selectedMediaId) });
    } else {
      onAddMedia(window.id, {
        name: customName || `Custom ${customType}`,
        type: customType,
        url: customType === 'BLANK' ? null : customUrl,
        durationSec: Number(customDuration)
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#182234',
        border: '1px solid #2a3a52',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '480px',
        padding: '24px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>
            Add Media to {window.name}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setTab('existing')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: tab === 'existing' ? '1px solid #2563eb' : '1px solid #334155',
              backgroundColor: tab === 'existing' ? '#2563eb' : '#1e293b',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Pick from Library
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: tab === 'custom' ? '1px solid #2563eb' : '1px solid #334155',
              backgroundColor: tab === 'custom' ? '#2563eb' : '#1e293b',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Create New Item
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'existing' ? (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                Select Media Item
              </label>
              <select
                value={selectedMediaId}
                onChange={(e) => setSelectedMediaId(e.target.value)}
                required
                style={{
                  width: '100%',
                  backgroundColor: '#0f172a',
                  color: '#f1f5f9',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '14px'
                }}
              >
                {mediaList.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.type}] {m.name} ({m.durationSec}s)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Promotional Video"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    color: '#f1f5f9',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  Type
                </label>
                <select
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    color: '#f1f5f9',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px'
                  }}
                >
                  <option value="IMAGE">IMAGE</option>
                  <option value="VIDEO">VIDEO</option>
                  <option value="BLANK">BLANK</option>
                </select>
              </div>

              {customType !== 'BLANK' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                    Media URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      backgroundColor: '#0f172a',
                      color: '#f1f5f9',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  Duration (Seconds)
                </label>
                <input
                  type="number"
                  min="1"
                  max="3600"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    color: '#f1f5f9',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {isSubmitting ? 'Adding...' : 'Add to Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
