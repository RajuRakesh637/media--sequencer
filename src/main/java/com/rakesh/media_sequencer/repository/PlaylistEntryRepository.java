package com.rakesh.media_sequencer.repository;

import com.rakesh.media_sequencer.model.PlaylistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistEntryRepository extends JpaRepository<PlaylistEntry, Long> {
    List<PlaylistEntry> findByWindowIdOrderByPositionAsc(Long windowId);
}
