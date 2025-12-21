package com.insurai.insurai_backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.insurai.insurai_backend.model.Policy;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {

    // Find all active policies
    List<Policy> findByPolicyStatus(String policyStatus);

    // Find policies by type
    List<Policy> findByPolicyType(String policyType);

    // Find policies by provider
    List<Policy> findByProviderName(String providerName);

    // Find policies by renewal date range (for renewal alerts)
    List<Policy> findByRenewalDateBetween(LocalDate start, LocalDate end);

    // Find active policies with renewal date before given date (expired)
    List<Policy> findByPolicyStatusAndRenewalDateBefore(String policyStatus, LocalDate date);

    // Find policies expiring in X days
    @Query("SELECT p FROM Policy p WHERE p.policyStatus = 'Active' AND p.renewalDate BETWEEN :today AND :futureDate")
    List<Policy> findPoliciesExpiringBetween(@Param("today") LocalDate today, @Param("futureDate") LocalDate futureDate);

    // Find all expired active policies
    @Query("SELECT p FROM Policy p WHERE p.policyStatus = 'Active' AND p.renewalDate < :currentDate")
    List<Policy> findExpiredActivePolicies(@Param("currentDate") LocalDate currentDate);
}
