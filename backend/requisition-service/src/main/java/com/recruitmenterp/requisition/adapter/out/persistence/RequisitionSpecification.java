package com.recruitmenterp.requisition.adapter.out.persistence;

import com.recruitmenterp.requisition.domain.model.JobCategory;
import com.recruitmenterp.requisition.domain.model.Requisition;
import com.recruitmenterp.requisition.domain.model.RequisitionStatus;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class RequisitionSpecification {

    public static Specification<Requisition> withFilters(
            JobCategory category,
            String country,
            RequisitionStatus status,
            String searchTerm
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (category != null) {
                predicates.add(criteriaBuilder.equal(root.get("jobCategory"), category));
            }

            if (country != null && !country.isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("destinationCountry"), country));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (searchTerm != null && !searchTerm.isBlank()) {
                String pattern = "%" + searchTerm.toLowerCase() + "%";
                Predicate titleLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern);
                Predicate descLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern);
                predicates.add(criteriaBuilder.or(titleLike, descLike));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
