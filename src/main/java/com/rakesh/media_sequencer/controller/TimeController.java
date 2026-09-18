package com.rakesh.media_sequencer.controller;

import com.rakesh.media_sequencer.dto.TimeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/time")
public class TimeController {

    @GetMapping
    public ResponseEntity<TimeResponse> getServerTime() {
        long nowMillis = System.currentTimeMillis();
        long nowSeconds = Instant.now().getEpochSecond();
        return ResponseEntity.ok(TimeResponse.builder()
                .epochMillis(nowMillis)
                .epochSeconds(nowSeconds)
                .build());
    }
}
