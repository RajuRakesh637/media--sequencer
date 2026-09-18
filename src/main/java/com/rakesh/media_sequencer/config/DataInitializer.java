package com.rakesh.media_sequencer.config;

import com.rakesh.media_sequencer.model.DisplayWindow;
import com.rakesh.media_sequencer.model.MediaItem;
import com.rakesh.media_sequencer.model.MediaType;
import com.rakesh.media_sequencer.model.PlaylistEntry;
import com.rakesh.media_sequencer.model.SyncState;
import com.rakesh.media_sequencer.repository.DisplayWindowRepository;
import com.rakesh.media_sequencer.repository.MediaItemRepository;
import com.rakesh.media_sequencer.repository.PlaylistEntryRepository;
import com.rakesh.media_sequencer.repository.SyncStateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final MediaItemRepository mediaItemRepository;
    private final DisplayWindowRepository windowRepository;
    private final PlaylistEntryRepository playlistEntryRepository;
    private final SyncStateRepository syncStateRepository;

    public DataInitializer(MediaItemRepository mediaItemRepository,
                           DisplayWindowRepository windowRepository,
                           PlaylistEntryRepository playlistEntryRepository,
                           SyncStateRepository syncStateRepository) {
        this.mediaItemRepository = mediaItemRepository;
        this.windowRepository = windowRepository;
        this.playlistEntryRepository = playlistEntryRepository;
        this.syncStateRepository = syncStateRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Ensure sync_state id=1 always exists
        if (!syncStateRepository.existsById(1L)) {
            syncStateRepository.save(SyncState.builder()
                    .id(1L)
                    .mediaId(null)
                    .startEpoch(0L)
                    .durationSec(0)
                    .build());
            log.info("Initialized default SyncState (id=1)");
        }

        if (windowRepository.count() > 0) {
            log.info("DisplayWindows already present ({}), skipping JPA fallback seed.", windowRepository.count());
            return;
        }

        log.info("Seeding initial media items and display windows via JPA fallback...");

        MediaItem item1 = MediaItem.builder()
                .name("Alpine Waterfall")
                .type(MediaType.IMAGE)
                .url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80")
                .durationSec(15)
                .build();

        MediaItem item2 = MediaItem.builder()
                .name("Blooming Flower")
                .type(MediaType.VIDEO)
                .url("https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4")
                .durationSec(10)
                .build();

        MediaItem item3 = MediaItem.builder()
                .name("Playful Kitten")
                .type(MediaType.IMAGE)
                .url("https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80")
                .durationSec(20)
                .build();

        MediaItem item4 = MediaItem.builder()
                .name("Friday Nature Stream")
                .type(MediaType.VIDEO)
                .url("https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4")
                .durationSec(15)
                .build();

        MediaItem item5 = MediaItem.builder()
                .name("Intermission Blank Screen")
                .type(MediaType.BLANK)
                .url(null)
                .durationSec(10)
                .build();

        MediaItem item6 = MediaItem.builder()
                .name("Mountain Horizon")
                .type(MediaType.IMAGE)
                .url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80")
                .durationSec(25)
                .build();

        List<MediaItem> items = mediaItemRepository.saveAll(List.of(item1, item2, item3, item4, item5, item6));
        log.info("Saved {} media items", items.size());

        long defaultCycleAnchor = 1726500000L;

        DisplayWindow window1 = windowRepository.save(DisplayWindow.builder()
                .name("Window 1 - Lobby Display")
                .cycleAnchor(defaultCycleAnchor)
                .build());

        DisplayWindow window2 = windowRepository.save(DisplayWindow.builder()
                .name("Window 2 - Entrance Screen")
                .cycleAnchor(defaultCycleAnchor)
                .build());

        DisplayWindow window3 = windowRepository.save(DisplayWindow.builder()
                .name("Window 3 - Hallway Display")
                .cycleAnchor(defaultCycleAnchor)
                .build());

        // Window 1 entries: item1, item2, item5 (blank)
        playlistEntryRepository.save(PlaylistEntry.builder().window(window1).mediaItem(items.get(0)).position(0).build());
        playlistEntryRepository.save(PlaylistEntry.builder().window(window1).mediaItem(items.get(1)).position(1).build());
        playlistEntryRepository.save(PlaylistEntry.builder().window(window1).mediaItem(items.get(4)).position(2).build());

        // Window 2 entries: item3, item4, item1
        playlistEntryRepository.save(PlaylistEntry.builder().window(window2).mediaItem(items.get(2)).position(0).build());
        playlistEntryRepository.save(PlaylistEntry.builder().window(window2).mediaItem(items.get(3)).position(1).build());
        playlistEntryRepository.save(PlaylistEntry.builder().window(window2).mediaItem(items.get(0)).position(2).build());

        // Window 3 entries: item6, item2, item4, item5
        playlistEntryRepository.save(PlaylistEntry.builder().window(window3).mediaItem(items.get(5)).position(0).build());
        playlistEntryRepository.save(PlaylistEntry.builder().window(window3).mediaItem(items.get(1)).position(1).build());
        playlistEntryRepository.save(PlaylistEntry.builder().window(window3).mediaItem(items.get(3)).position(2).build());
        playlistEntryRepository.save(PlaylistEntry.builder().window(window3).mediaItem(items.get(4)).position(3).build());

        log.info("Seeding completed successfully with 3 windows and playlists!");
    }
}
