package com.rakesh.media_sequencer.dto;

import com.rakesh.media_sequencer.model.MediaItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncResponse {
    private Long id;
    private Long mediaId;
    private MediaItem mediaItem;
    private Long startEpoch;       // in seconds
    private Integer durationSec;   // in seconds
    private Long startEpochMillis; // convenient for frontend calculations
    private Long endEpochMillis;
    private Long serverTimeMillis;
    private boolean active;
}
