package com.campus.placement.service;

import com.campus.placement.dto.PageResponse;
import com.campus.placement.dto.RecruiterDto;
import com.campus.placement.entity.Recruiter;
import com.campus.placement.entity.User;
import com.campus.placement.exception.ResourceNotFoundException;
import com.campus.placement.repository.RecruiterRepository;
import com.campus.placement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecruiterService {
    private final RecruiterRepository recruiterRepository;
    private final UserRepository userRepository;

    public RecruiterDto getProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Recruiter r = recruiterRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));
        return RecruiterDto.from(r);
    }

    @Transactional
    public RecruiterDto updateProfile(String email, RecruiterDto.ProfileInput input) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Recruiter r = recruiterRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("Recruiter profile not found"));
        if (input.getFirstName() != null) { user.setFirstName(input.getFirstName()); userRepository.save(user); }
        if (input.getLastName() != null) { user.setLastName(input.getLastName()); userRepository.save(user); }
        if (input.getDesignation() != null) r.setDesignation(input.getDesignation());
        if (input.getPhone() != null) r.setPhone(input.getPhone());
        if (input.getLinkedinUrl() != null) r.setLinkedinUrl(input.getLinkedinUrl());
        return RecruiterDto.from(recruiterRepository.save(r));
    }

    public PageResponse<RecruiterDto> list(int page, int size) {
        return PageResponse.from(recruiterRepository.findAll(PageRequest.of(page, size)), RecruiterDto::from);
    }
}
