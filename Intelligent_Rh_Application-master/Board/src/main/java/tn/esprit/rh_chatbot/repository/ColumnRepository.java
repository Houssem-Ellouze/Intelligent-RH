package tn.esprit.rh_chatbot.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.rh_chatbot.entity.Column;

import java.util.List;

@Repository
public interface ColumnRepository extends JpaRepository<Column, Long> {
    List<Column> findByBoardIdOrderByPositionAsc(Long boardId);
}