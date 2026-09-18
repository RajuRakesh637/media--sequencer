package com.rakesh.media_sequencer.controller;

import com.rakesh.media_sequencer.model.MediaItem;
import com.rakesh.media_sequencer.repository.MediaItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaItemRepository mediaItemRepository;

    public MediaController(MediaItemRepository mediaItemRepository) {
        this.mediaItemRepository = mediaItemRepository;
    }

    @GetMapping
    public ResponseEntity<List<MediaItem>> getAllMedia() {
        return ResponseEntity.ok(mediaItemRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MediaItem> getMediaById(@PathVariable Long id) {
        return mediaItemRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MediaItem> createMedia(@RequestBody MediaItem mediaItem) {
        if (mediaItem.getDurationSec() == null || mediaItem.getDurationSec() <= 0) {
            mediaItem.setDurationSec(10);
        }
        MediaItem saved = mediaItemRepository.save(mediaItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
