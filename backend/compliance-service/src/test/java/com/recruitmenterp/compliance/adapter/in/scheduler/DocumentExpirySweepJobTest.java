package com.recruitmenterp.compliance.adapter.in.scheduler;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class DocumentExpirySweepJobTest {

    @Test
    void shouldExecuteSweepJobWithoutErrors() {
        DocumentExpirySweepJob job = new DocumentExpirySweepJob();
        ReflectionTestUtils.setField(job, "alertDays", List.of(7, 15, 30));
        
        assertDoesNotThrow(() -> job.sweepExpiringDocuments());
    }
}
