-- Seed Media Items (6 items: 3 images, 2 videos, 1 blank)
INSERT INTO media_items (id, name, type, url, duration_sec)
VALUES
  (1, 'Alpine Waterfall', 'IMAGE', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80', 15),
  (2, 'Blooming Flower', 'VIDEO', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', 10),
  (3, 'Playful Kitten', 'IMAGE', 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80', 20),
  (4, 'Friday Nature Stream', 'VIDEO', 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4', 15),
  (5, 'Intermission Blank Screen', 'BLANK', NULL, 10),
  (6, 'Mountain Horizon', 'IMAGE', 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80', 25)
ON CONFLICT (id) DO NOTHING;

-- Seed Display Windows (3 windows)
-- cycleAnchor = 1726500000 (epoch seconds)
INSERT INTO display_windows (id, name, cycle_anchor)
VALUES
  (1, 'Window 1 - Lobby Display', 1726500000),
  (2, 'Window 2 - Entrance Screen', 1726500000),
  (3, 'Window 3 - Hallway Display', 1726500000)
ON CONFLICT (id) DO NOTHING;

-- Seed Playlist Entries
INSERT INTO playlist_entries (id, window_id, media_id, position)
VALUES
  -- Window 1 Playlist
  (1, 1, 1, 0),
  (2, 1, 2, 1),
  (3, 1, 5, 2),

  -- Window 2 Playlist
  (4, 2, 3, 0),
  (5, 2, 4, 1),
  (6, 2, 1, 2),

  -- Window 3 Playlist
  (7, 3, 6, 0),
  (8, 3, 2, 1),
  (9, 3, 4, 2),
  (10, 3, 5, 3)
ON CONFLICT (id) DO NOTHING;

-- Seed Sync State (singleton id=1)
INSERT INTO sync_state (id, media_id, start_epoch, duration_sec)
VALUES (1, NULL, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Sync sequences with max IDs so subsequent auto-generated IDs do not conflict
SELECT setval(pg_get_serial_sequence('media_items', 'id'), COALESCE(MAX(id), 1)) FROM media_items;
SELECT setval(pg_get_serial_sequence('display_windows', 'id'), COALESCE(MAX(id), 1)) FROM display_windows;
SELECT setval(pg_get_serial_sequence('playlist_entries', 'id'), COALESCE(MAX(id), 1)) FROM playlist_entries;
