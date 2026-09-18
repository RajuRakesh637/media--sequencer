package com.rakesh.media_sequencer.controller;

import com.rakesh.media_sequencer.dto.MediaItemRequest;
import com.rakesh.media_sequencer.model.DisplayWindow;
import com.rakesh.media_sequencer.model.MediaItem;
import com.rakesh.media_sequencer.model.MediaType;
import com.rakesh.media_sequencer.model.PlaylistEntry;
import com.rakesh.media_sequencer.repository.DisplayWindowRepository;
import com.rakesh.media_sequencer.repository.MediaItemRepository;
import com.rakesh.media_sequencer.repository.PlaylistEntryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/windows")
public class WindowController {

    private final DisplayWindowRepository windowRepository;
    private final MediaItemRepository mediaItemRepository;
    private final PlaylistEntryRepository playlistEntryRepository;

    public WindowController(DisplayWindowRepository windowRepository,
                            MediaItemRepository mediaItemRepository,
                            PlaylistEntryRepository playlistEntryRepository) {
        this.windowRepository = windowRepository;
        this.mediaItemRepository = mediaItemRepository;
        this.playlistEntryRepository = playlistEntryRepository;
    }

    @GetMapping
    public ResponseEntity<List<DisplayWindow>> getAllWindows() {
        List<DisplayWindow> windows = windowRepository.findAll();
        return ResponseEntity.ok(windows);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DisplayWindow> getWindowById(@PathVariable Long id) {
        return windowRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/media")
    @Transactional
    public ResponseEntity<DisplayWindow> addMediaToWindow(
            @PathVariable Long id,
            @RequestBody MediaItemRequest request) {

        DisplayWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Window not found: " + id));

        MediaItem mediaItem;
        if (request.getMediaId() != null) {
            mediaItem = mediaItemRepository.findById(request.getMediaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "MediaItem not found: " + request.getMediaId()));
        } else if (request.getType() != null) {
            int duration = (request.getDurationSec() != null && request.getDurationSec() > 0)
                    ? request.getDurationSec() : 10;
            mediaItem = MediaItem.builder()
                    .name(request.getName() != null ? request.getName() : "Media Item " + (request.getType()))
                    .type(request.getType())
                    .url(request.getType() == MediaType.BLANK ? null : request.getUrl())
                    .durationSec(duration)
                    .build();
            mediaItem = mediaItemRepository.save(mediaItem);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Either mediaId or media details (type, url, durationSec) must be provided");
        }

        int nextPosition = window.getPlaylist().size();
        PlaylistEntry entry = PlaylistEntry.builder()
                .window(window)
                .mediaItem(mediaItem)
                .position(nextPosition)
                .build();

        window.getPlaylist().add(entry);
        playlistEntryRepository.save(entry);

        DisplayWindow savedWindow = windowRepository.save(window);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedWindow);
    }
}
