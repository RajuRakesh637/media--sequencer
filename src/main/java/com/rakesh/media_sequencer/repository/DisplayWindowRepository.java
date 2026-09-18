package com.rakesh.media_sequencer.repository;

import com.rakesh.media_sequencer.model.DisplayWindow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DisplayWindowRepository extends JpaRepository<DisplayWindow, Long> {
}
