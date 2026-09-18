package com.rakesh.media_sequencer.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "display_windows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisplayWindow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Long cycleAnchor;

    @OneToMany(mappedBy = "window", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("position ASC")
    @Builder.Default
    private List<PlaylistEntry> playlist = new ArrayList<>();
}
