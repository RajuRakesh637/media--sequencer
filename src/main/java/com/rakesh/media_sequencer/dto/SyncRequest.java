package com.rakesh.media_sequencer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncRequest {
    private Long mediaId;
    private Integer durationSec;
    private Long startEpoch; // Optional: epoch seconds (defaults to now if null)
}
