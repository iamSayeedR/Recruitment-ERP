package com.recruitmenterp.compliance.config;

import net.javacrumbs.shedlock.core.LockProvider;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import javax.sql.DataSource;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class ShedLockConfigTest {

    @Test
    void shouldCreateLockProvider() {
        ShedLockConfig config = new ShedLockConfig();
        DataSource dataSource = Mockito.mock(DataSource.class);
        LockProvider lockProvider = config.lockProvider(dataSource);
        
        assertNotNull(lockProvider);
    }
}
