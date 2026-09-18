package com.rakesh.media_sequencer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sync_state")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SyncState {

    @Id
    private Long id; // Singleton record with id = 1

    @Column(name = "media_id")
    private Long mediaId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "media_id", insertable = false, updatable = false)
    private MediaItem mediaItem;

    @Column(nullable = false)
    private Long startEpoch; // Epoch seconds

    @Column(nullable = false)
    private Integer durationSec;
}
