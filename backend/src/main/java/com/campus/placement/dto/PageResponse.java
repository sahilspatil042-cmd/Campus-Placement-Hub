package com.campus.placement.dto;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Data @Builder
public class PageResponse<T> {
    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;

    public static <T, E> PageResponse<T> from(Page<E> page, Function<E, T> mapper) {
        return PageResponse.<T>builder()
            .content(page.getContent().stream().map(mapper).collect(Collectors.toList()))
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .page(page.getNumber())
            .size(page.getSize())
            .build();
    }
}
