package com.rakesh.media_sequencer.dto;

import com.rakesh.media_sequencer.model.MediaType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaItemRequest {
    // If referencing an existing media item
    private Long mediaId;

    // If creating or defining an inline media item
    private String name;
    private MediaType type;
    private String url;
    private Integer durationSec;
}
