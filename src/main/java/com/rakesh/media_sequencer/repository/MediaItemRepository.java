package com.rakesh.media_sequencer.repository;

import com.rakesh.media_sequencer.model.MediaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MediaItemRepository extends JpaRepository<MediaItem, Long> {
}
