package com.rakesh.media_sequencer.controller;

import com.rakesh.media_sequencer.dto.SyncRequest;
import com.rakesh.media_sequencer.dto.SyncResponse;
import com.rakesh.media_sequencer.model.MediaItem;
import com.rakesh.media_sequencer.model.SyncState;
import com.rakesh.media_sequencer.repository.MediaItemRepository;
import com.rakesh.media_sequencer.repository.SyncStateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private final SyncStateRepository syncStateRepository;
    private final MediaItemRepository mediaItemRepository;

    public SyncController(SyncStateRepository syncStateRepository,
                          MediaItemRepository mediaItemRepository) {
        this.syncStateRepository = syncStateRepository;
        this.mediaItemRepository = mediaItemRepository;
    }

    @GetMapping
    public ResponseEntity<SyncResponse> getSyncState() {
        SyncState syncState = getOrCreateSyncState();
        return ResponseEntity.ok(buildSyncResponse(syncState));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<SyncResponse> setSyncState(@RequestBody SyncRequest request) {
        if (request.getMediaId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "mediaId is required");
        }
        if (request.getDurationSec() == null || request.getDurationSec() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "durationSec must be greater than 0");
        }

        MediaItem mediaItem = mediaItemRepository.findById(request.getMediaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "MediaItem not found: " + request.getMediaId()));

        long startEpoch = (request.getStartEpoch() != null && request.getStartEpoch() > 0)
                ? request.getStartEpoch()
                : Instant.now().getEpochSecond();

        SyncState syncState = getOrCreateSyncState();
        syncState.setMediaId(mediaItem.getId());
        syncState.setMediaItem(mediaItem);
        syncState.setStartEpoch(startEpoch);
        syncState.setDurationSec(request.getDurationSec());

        SyncState saved = syncStateRepository.save(syncState);
        return ResponseEntity.ok(buildSyncResponse(saved));
    }

    private SyncState getOrCreateSyncState() {
        return syncStateRepository.findById(1L).orElseGet(() -> {
            SyncState initial = SyncState.builder()
                    .id(1L)
                    .mediaId(null)
                    .mediaItem(null)
                    .startEpoch(0L)
                    .durationSec(0)
                    .build();
            return syncStateRepository.save(initial);
        });
    }

    private SyncResponse buildSyncResponse(SyncState syncState) {
        long nowMillis = System.currentTimeMillis();
        long nowSec = nowMillis / 1000;

        Long startEpoch = syncState.getStartEpoch() != null ? syncState.getStartEpoch() : 0L;
        int durationSec = syncState.getDurationSec() != null ? syncState.getDurationSec() : 0;
        long endEpoch = startEpoch + durationSec;

        boolean active = syncState.getMediaId() != null
                && nowSec >= startEpoch
                && nowSec < endEpoch;

        MediaItem mediaItem = null;
        if (syncState.getMediaId() != null) {
            mediaItem = mediaItemRepository.findById(syncState.getMediaId()).orElse(null);
        }

        return SyncResponse.builder()
                .id(syncState.getId())
                .mediaId(syncState.getMediaId())
                .mediaItem(mediaItem)
                .startEpoch(startEpoch)
                .durationSec(durationSec)
                .startEpochMillis(startEpoch * 1000L)
                .endEpochMillis(endEpoch * 1000L)
                .serverTimeMillis(nowMillis)
                .active(active)
                .build();
    }
}
