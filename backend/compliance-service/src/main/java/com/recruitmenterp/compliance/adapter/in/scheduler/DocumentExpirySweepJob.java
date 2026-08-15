package com.recruitmenterp.compliance.adapter.in.scheduler;

import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentExpirySweepJob {

    @Value("${compliance.expiry.alert-days:7,15,30}")
    private List<Integer> alertDays;

    @Scheduled(cron = "${compliance.expiry.cron:0 0 0 * * ?}")
    @SchedulerLock(name = "documentExpirySweepLock", lockAtMostFor = "10m", lockAtLeastFor = "1m")
    public void sweepExpiringDocuments() {
        log.info("Starting document expiry sweep job for alert days: {}", alertDays);
        
        LocalDate today = LocalDate.now();
        for (Integer days : alertDays) {
            LocalDate targetDate = today.plusDays(days);
            log.debug("Sweeping documents expiring on {}", targetDate);
            // In a real implementation, we would query ChecklistItem by expiryDate = targetDate
            // and publish document.expiring_soon Kafka events
        }
        
        log.info("Completed document expiry sweep job");
    }
}
