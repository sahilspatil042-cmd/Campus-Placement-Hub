package com.campus.placement.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public Map<String, String> uploadFile(MultipartFile file, String folder, String resourceType) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
            "folder", "campus-placement/" + folder,
            "resource_type", resourceType
        ));
        return Map.of(
            "url", (String) result.get("secure_url"),
            "publicId", (String) result.get("public_id")
        );
    }

    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    public Map<String, String> uploadResume(MultipartFile file) throws IOException {
        return uploadFile(file, "resumes", "raw");
    }

    public Map<String, String> uploadPhoto(MultipartFile file) throws IOException {
        return uploadFile(file, "photos", "image");
    }
}
