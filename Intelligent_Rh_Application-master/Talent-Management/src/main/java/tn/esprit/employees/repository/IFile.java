package tn.esprit.employees.repository;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface IFile {
    String save(MultipartFile file);
    Resource getFile(String fileName);
}