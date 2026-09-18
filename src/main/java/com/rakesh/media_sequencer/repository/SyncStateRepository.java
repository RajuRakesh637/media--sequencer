package com.rakesh.media_sequencer.repository;

import com.rakesh.media_sequencer.model.SyncState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SyncStateRepository extends JpaRepository<SyncState, Long> {
}
