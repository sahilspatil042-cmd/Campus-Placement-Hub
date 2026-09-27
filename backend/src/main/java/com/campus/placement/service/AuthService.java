package com.campus.placement.service;

import com.campus.placement.dto.*;
import com.campus.placement.entity.Recruiter;
import com.campus.placement.entity.Student;
import com.campus.placement.entity.User;
import com.campus.placement.exception.BadRequestException;
import com.campus.placement.exception.ConflictException;
import com.campus.placement.exception.ResourceNotFoundException;
import com.campus.placement.repository.*;
import com.campus.placement.security.JwtUtil;
import com.campus.placement.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final RecruiterRepository recruiterRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final UserDetailsServiceImpl userDetailsService;

    public AuthResponse login(AuthRequest request) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        return AuthResponse.builder().token(token).user(UserDto.from(user)).build();
    }

    @Transactional
    public AuthResponse registerStudent(StudentRegistrationRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already registered");
        }
        if (studentRepository.existsByRollNumber(req.getRollNumber())) {
            throw new ConflictException("Roll number already registered");
        }
        User user = User.builder()
            .email(req.getEmail())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .firstName(req.getFirstName())
            .lastName(req.getLastName())
            .role(User.UserRole.STUDENT)
            .isActive(true)
            .build();
        userRepository.save(user);

        Student student = Student.builder()
            .user(user)
            .rollNumber(req.getRollNumber())
            .branch(req.getBranch())
            .year(req.getYear())
            .phone(req.getPhone())
            .build();
        studentRepository.save(student);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        return AuthResponse.builder().token(token).user(UserDto.from(user)).build();
    }

    @Transactional
    public AuthResponse registerRecruiter(RecruiterRegistrationRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already registered");
        }
        User user = User.builder()
            .email(req.getEmail())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .firstName(req.getFirstName())
            .lastName(req.getLastName())
            .role(User.UserRole.RECRUITER)
            .isActive(true)
            .build();
        userRepository.save(user);

        Recruiter recruiter = Recruiter.builder()
            .user(user)
            .companyName(req.getCompanyName())
            .designation(req.getDesignation())
            .phone(req.getPhone())
            .build();
        recruiterRepository.save(recruiter);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);
        return AuthResponse.builder().token(token).user(UserDto.from(user)).build();
    }

    public MessageResponse forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setResetToken(UUID.randomUUID().toString());
            user.setResetTokenExpires(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            // In production: send email with reset link
        });
        return new MessageResponse("If your email is registered, you will receive a password reset link");
    }

    @Transactional
    public MessageResponse resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
            .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        if (user.getResetTokenExpires() == null || user.getResetTokenExpires().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpires(null);
        userRepository.save(user);
        return new MessageResponse("Password reset successfully");
    }

    public UserDto getMe(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserDto.from(user);
    }
}
