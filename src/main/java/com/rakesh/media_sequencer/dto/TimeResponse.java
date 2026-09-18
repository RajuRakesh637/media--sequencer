package com.rakesh.media_sequencer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeResponse {
    private Long epochMillis;
    private Long epochSeconds;
}
