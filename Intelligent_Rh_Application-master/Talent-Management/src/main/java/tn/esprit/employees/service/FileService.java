package tn.esprit.employees.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.employees.repository.IFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileService implements IFile {

    @Value("${file.path}")
    private String filePath;

    @Override
    public String save(MultipartFile file) {
        try {
            // 1. Calcul du chemin absolu
            Path root = Paths.get(System.getProperty("user.dir"), filePath).toAbsolutePath().normalize();
            // LOG DE DEBUG : Vérifiez ce qui s'affiche dans votre console IntelliJ !
            System.out.println("DEBUG - Tentative de création du dossier à : " + root.toString());

            // 2. Création robuste du dossier (crée les dossiers parents si nécessaire)
            if (!Files.exists(root)) {
                Files.createDirectories(root);
                System.out.println("DEBUG - Dossier créé avec succès.");
            }

            if (file.isEmpty()) {
                throw new RuntimeException("Le fichier est vide.");
            }

            // 3. Sauvegarde
            Path target = root.resolve(file.getOriginalFilename());
            file.transferTo(target.toFile());

            return file.getOriginalFilename();
        } catch (IOException e) {
            throw new RuntimeException("Erreur critique : " + e.getMessage(), e);
        }
    }

    @Override
    public Resource getFile(String fileName) {
        try {
            Path file = Paths.get(System.getProperty("user.dir"), filePath).resolve(fileName);
            Resource resource = new UrlResource (file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + fileName);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }
}