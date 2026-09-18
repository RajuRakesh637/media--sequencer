package com.rakesh.media_sequencer.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "media_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MediaType type;

    @Column(length = 2048)
    private String url;

    @Column(nullable = false)
    private Integer durationSec;
}
