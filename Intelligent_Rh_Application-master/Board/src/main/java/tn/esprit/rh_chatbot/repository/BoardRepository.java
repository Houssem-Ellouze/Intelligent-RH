package tn.esprit.rh_chatbot.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.rh_chatbot.entity.Board;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {}