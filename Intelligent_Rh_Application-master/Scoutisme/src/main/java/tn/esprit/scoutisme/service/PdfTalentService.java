package tn.esprit.scoutisme.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import tn.esprit.scoutisme.entity.SkillScore;
import tn.esprit.scoutisme.entity.TalentProfile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service responsable de l'extraction de texte et de compétences à partir de CV (PDF).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PdfTalentService {

    // -------------------------------------------------------------------------
    // Configuration injectable (peut venir de application.properties ou d'une table)
    // -------------------------------------------------------------------------

    @Value("${scouting.skills.hard:}")
    private List<String> configuredHardSkills = new ArrayList<>();

    @Value("${scouting.skills.soft:}")
    private List<String> configuredSoftSkills = new ArrayList<>();

    // Map <mot-clé normalisé → compétence canonique + poids + type>
    private final Map<String, SkillDefinition> skillDefinitions = new HashMap<>();

    @PostConstruct
    public void initSkillDefinitions() {
        // ────────────────────────────────────────────────
//  ★★★★★  Très haute valeur / rareté / complexité élevée
// ────────────────────────────────────────────────
        addHardSkill("Rust",                        10.0);
        addHardSkill("Zig",                         9.9);
        addHardSkill("Flutter",                     9.8);
        addHardSkill("Dart",                        9.7);
        addHardSkill("LLM",             9.6);
        addHardSkill("RAG", 9.5);
        addHardSkill("LangGraph LangChain",         9.4);
        addHardSkill("Kubernetes",        9.3);
        addHardSkill("eBPF",                        9.2);
        addHardSkill("WebAssembly",                 9.1);
        addHardSkill("Golang Microservices",        9.0);
        addHardSkill("Spring Boot",         8.9);
        addHardSkill("Ktor",                        8.8);
        addHardSkill("Kotlin ",        8.7);
        addHardSkill("Solidity Smart Contracts",    8.6);

// ────────────────────────────────────────────────
//  ★★★★☆  Haute valeur – Stack moderne très demandé
// ────────────────────────────────────────────────
        addHardSkill("TypeScript tRPC",             8.5);
        addHardSkill("Nextjs",           8.4);
        addHardSkill("Remix",                       8.3);
        addHardSkill("Flask",                   8.2);
        addHardSkill("React",     8.1);
        addHardSkill("Nestjs",                      8.0);
        addHardSkill("FastAPI Pydantic",            7.9);
        addHardSkill("Django",                 7.8);
        addHardSkill("GraphQL",   7.7);
        addHardSkill("Kafka",                7.6);
        addHardSkill("RabbitMQ",               7.5);
        addHardSkill("Redis",            7.4);
        addHardSkill("Elasticsearch",    7.3);
        addHardSkill("Terraform",          7.2);
        addHardSkill("AWS",              7.1);

// ────────────────────────────────────────────────
//  ★★★☆☆  Valeur forte – Marché principal 2025
// ────────────────────────────────────────────────
        addHardSkill("React",                       7.0);
        addHardSkill("React Native",                7.0);
        addHardSkill("Vue Nuxt",                    6.9);
        addHardSkill("Angular",                     6.8);
        addHardSkill("Java",        6.7);
        addHardSkill("Spring Boot",            6.6);
        addHardSkill("PostgreSQ",          6.5);
        addHardSkill("MongoDB",               6.4);
        addHardSkill("Docker",                6.3);
        addHardSkill("GitHub Actions",    6.2);

// ────────────────────────────────────────────────
//  ★★☆☆☆  Compétences courantes mais valorisées
// ────────────────────────────────────────────────
        addHardSkill("HTML",         6.0);
        addHardSkill("CSS",         6.0);
        addHardSkill("JS",         6.0);
        addHardSkill("JQuery",         6.0);
        addHardSkill("Bootstrap",       5.8);
        addHardSkill("PHP",                 5.7);
        addHardSkill("Symfony",                 5.7);
        addHardSkill("WordPress",          5.5);

// ────────────────────────────────────────────────
//  ★☆☆☆☆  Soft skills & transversales
// ────────────────────────────────────────────────
        addSoftSkill("Leadership",      8.0);
        addSoftSkill("Agile Scrum",     7.5);
        addSoftSkill("Resolution de Problemes Complexes", 7.2);
        addSoftSkill("Communication Technique",     7.0);
        addSoftSkill("Mentorat Transmission",       6.8);
        addSoftSkill("Adaptabilite au Changement",  6.7);
        addSoftSkill("Travail en Equipe Distributee", 6.5);
        addSoftSkill("Anglais Professionnel Technique", 6.5);
        addSoftSkill("Gestion du Stress Resilience", 6.0);
        addSoftSkill("Creativite Innovation",       5.8);
        addSoftSkill("Ethique Responsabilite Numerique", 5.5);

// ────────────────────────────────────────────────
//  Émergents & Stratégiques 2025–2027
// ────────────────────────────────────────────────
        addHardSkill("Prompt Engineering Avance",   9.5);
        addHardSkill("Agentic AI Multi Agents",     9.4);
        addHardSkill("MLOps MLflow BentoML",        9.2);
        addHardSkill("LLMOps",                      9.1);
        addHardSkill("Computer Vision YOLO SAM",    9.0);
        addHardSkill("Voice AI Speech to Text",     8.9);
        addHardSkill("Blockchain Layer 2",          8.8);
        addHardSkill("Zero Knowledge Rollups",      8.7);
        addHardSkill("Cyber Threat Hunting",        8.6);
        addHardSkill("Penetration Testing Avance",  8.5);
        addHardSkill("DevSecOps SAST DAST",         8.4);
        addHardSkill("Data Mesh Data Fabric",       8.3);
        addHardSkill("Apache Spark Databricks",     8.2);
        addHardSkill("Edge Computing IoT",          8.0);
        addHardSkill("AR VR Development Unity Unreal", 7.8);
        addHardSkill("Low Code OutSystems Mendix",  7.0);
        addHardSkill("No Code Bubble Webflow",      6.5);

        // On surcharge avec les valeurs venant de properties si présentes
        configuredHardSkills.forEach(this::addHardSkillFromProperty);
        configuredSoftSkills.forEach(this::addSoftSkillFromProperty);

        log.info("Initialisé {} définitions de compétences (hard: {}, soft: {})",
                skillDefinitions.size(),
                skillDefinitions.values().stream().filter(SkillDefinition::isHard).count(),
                skillDefinitions.values().stream().filter(def -> !def.isHard).count());
    }

    private void addHardSkill(String canonicalName, double weight) {
        addSkill(canonicalName, weight, true);
    }

    private void addSoftSkill(String canonicalName, double weight) {
        addSkill(canonicalName, weight, false);
    }

    private void addSkill(String canonicalName, double weight, boolean isHard) {
        String normalized = canonicalName.trim().toLowerCase();
        skillDefinitions.put(normalized, new SkillDefinition(canonicalName, weight, isHard));
    }

    private void addHardSkillFromProperty(String line) {
        addSkillFromProperty(line, true);
    }

    private void addSoftSkillFromProperty(String line) {
        addSkillFromProperty(line, false);
    }

    private void addSkillFromProperty(String line, boolean isHard) {
        String[] parts = line.split("=");
        if (parts.length == 2) {
            String name = parts[0].trim().toLowerCase();
            try {
                double weight = Double.parseDouble(parts[1].trim());
                skillDefinitions.put(name, new SkillDefinition(name, weight, isHard));
            } catch (NumberFormatException e) {
                log.warn("Format poids invalide pour compétence '{}'", line);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Méthodes publiques
    // -------------------------------------------------------------------------

    /**
     * Extrait le texte brut d'un fichier PDF
     */
    public String extractTextFromPDF(File pdfFile) {
        if (pdfFile == null || !pdfFile.exists()) {
            throw new IllegalArgumentException("Fichier PDF null ou inexistant");
        }

        try (PDDocument document = PDDocument.load(pdfFile)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document).trim();
        } catch (IOException e) {
            log.error("Échec extraction texte PDF: {}", pdfFile.getName(), e);
            throw new RuntimeException("Impossible de lire le PDF", e);
        }
    }

    /**
     * Version avec InputStream (plus moderne – à privilégier quand possible)
     */
    public String extractTextFromInputStream(InputStream inputStream) throws IOException {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document).trim();
        }
    }

    /**
     * Détecte les compétences dans le texte et crée les SkillScore associés
     */
    public List<SkillScore> extractSkillsFromText(String text, TalentProfile profile) {
        if (text == null || text.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedText = normalizeText(text);
        List<SkillScore> skills = new ArrayList<>();

        for (Map.Entry<String, SkillDefinition> entry : skillDefinitions.entrySet()) {
            String keyword = entry.getKey();
            SkillDefinition def = entry.getValue();

            // Recherche simple (contains) – peut être amélioré avec regex / fuzzy / NLP plus tard
            if (normalizedText.contains(keyword)) {
                SkillScore score = new SkillScore();
                score.setCompetence(def.canonicalName);
                score.setPoids(def.weight);                    // déjà OK
                double computedScore = calculateSkillScore(def);
                score.setScore(computedScore > 0 ? computedScore : 60.0); // force min 60
                score.setTalentProfile(profile);
                skills.add(score);
            }
        }

        // Éviter les doublons si plusieurs mots-clés pointent vers la même compétence canonique
        return skills.stream()
                .collect(Collectors.groupingBy(
                        SkillScore::getCompetence,
                        Collectors.maxBy(Comparator.comparingDouble(SkillScore::getPoids))
                ))
                .values()
                .stream()
                .flatMap(Optional::stream)
                .toList();
    }

    // -------------------------------------------------------------------------
    // Logique de scoring (à enrichir selon besoins métier)
    // -------------------------------------------------------------------------

    private double calculateSkillScore(SkillDefinition def) {
        double base = switch ((int) Math.round(def.weight)) {
            case 10,9   -> 92.0;
            case 8      -> 86.0;
            case 7      -> 80.0;
            case 6      -> 72.0;
            default     -> def.isHard ? 68.0 : 58.0;
        };

        double multiplier = 1.0 + (def.weight / 18.0); // +~55% max pour poids 10

        double score = base * multiplier;

        // Bonus techno chaude
        String nameLower = def.canonicalName.toLowerCase();
        if (nameLower.contains("flutter") || nameLower.contains("kubernetes") ||
                nameLower.contains("rust") || nameLower.contains("llm") ||
                nameLower.contains("rag") || nameLower.contains("prompt")) {
            score *= 1.10;
        }

        return Math.min(100.0, Math.max(45.0, score));
    }

    private String normalizeText(String text) {
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s]", " ")     // enlève ponctuation
                .replaceAll("\\s+", " ")             // normalise espaces
                .trim();
    }

    // -------------------------------------------------------------------------
    // Record interne (Java 14+)
    // -------------------------------------------------------------------------
    private record SkillDefinition(String canonicalName, double weight, boolean isHard) {
    }
}