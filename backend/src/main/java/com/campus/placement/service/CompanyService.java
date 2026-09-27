package com.campus.placement.service;

import com.campus.placement.dto.CompanyDto;
import com.campus.placement.dto.PageResponse;
import com.campus.placement.entity.Company;
import com.campus.placement.entity.User;
import com.campus.placement.exception.ResourceNotFoundException;
import com.campus.placement.repository.CompanyRepository;
import com.campus.placement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public PageResponse<CompanyDto> list(int page, int size, String search, String sector) {
        return PageResponse.from(
            companyRepository.findAllFiltered(
                search != null && !search.isBlank() ? search : null,
                sector != null && !sector.isBlank() ? sector : null,
                PageRequest.of(page, size)
            ),
            CompanyDto::from
        );
    }

    public CompanyDto getById(Long id) {
        return CompanyDto.from(companyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found")));
    }

    @Transactional
    public CompanyDto create(CompanyDto.Input input, String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail).orElse(null);
        Company company = Company.builder()
            .name(input.getName()).sector(input.getSector()).website(input.getWebsite())
            .description(input.getDescription()).logoUrl(input.getLogoUrl())
            .location(input.getLocation()).employeeCount(input.getEmployeeCount())
            .foundedYear(input.getFoundedYear()).createdBy(creator).build();
        return CompanyDto.from(companyRepository.save(company));
    }

    @Transactional
    public CompanyDto update(Long id, CompanyDto.Input input) {
        Company c = companyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        if (input.getName() != null) c.setName(input.getName());
        if (input.getSector() != null) c.setSector(input.getSector());
        if (input.getWebsite() != null) c.setWebsite(input.getWebsite());
        if (input.getDescription() != null) c.setDescription(input.getDescription());
        if (input.getLogoUrl() != null) c.setLogoUrl(input.getLogoUrl());
        if (input.getLocation() != null) c.setLocation(input.getLocation());
        if (input.getEmployeeCount() != null) c.setEmployeeCount(input.getEmployeeCount());
        if (input.getFoundedYear() != null) c.setFoundedYear(input.getFoundedYear());
        return CompanyDto.from(companyRepository.save(c));
    }

    @Transactional
    public void delete(Long id) {
        if (!companyRepository.existsById(id)) throw new ResourceNotFoundException("Company not found");
        companyRepository.deleteById(id);
    }
}
