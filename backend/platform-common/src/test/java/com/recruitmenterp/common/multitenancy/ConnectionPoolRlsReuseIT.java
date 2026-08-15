package com.recruitmenterp.common.multitenancy;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

@SpringBootTest(classes = ConnectionPoolRlsReuseIT.TestConfig.class)
@Testcontainers
@ActiveProfiles("test")
class ConnectionPoolRlsReuseIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("recruitment_erp")
            .withUsername("app_user")
            .withPassword("app_password");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Test
    void testConnectionReuseDoesNotLeakTenantContext() {
        // Setup table with RLS
        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS test_tenant_items (id INT PRIMARY KEY, tenant_id VARCHAR(50));");
        jdbcTemplate.execute("ALTER TABLE test_tenant_items ENABLE ROW LEVEL SECURITY;");
        jdbcTemplate.execute("ALTER TABLE test_tenant_items FORCE ROW LEVEL SECURITY;");
        jdbcTemplate.execute("DROP POLICY IF EXISTS test_tenant_policy ON test_tenant_items;");
        jdbcTemplate.execute("CREATE POLICY test_tenant_policy ON test_tenant_items USING (tenant_id = current_setting('app.current_tenant_id', true));");

        // Insert rows for tenant-a and tenant-b
        jdbcTemplate.execute("INSERT INTO test_tenant_items (id, tenant_id) VALUES (1, 'tenant-a') ON CONFLICT DO NOTHING;");
        jdbcTemplate.execute("INSERT INTO test_tenant_items (id, tenant_id) VALUES (2, 'tenant-b') ON CONFLICT DO NOTHING;");

        // Step 1: Open Transaction 1 as rls_tester role for tenant-a
        jdbcTemplate.execute("DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rls_tester') THEN CREATE ROLE rls_tester; END IF; END $$;");
        jdbcTemplate.execute("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rls_tester");

        TransactionStatus tx1 = transactionManager.getTransaction(new DefaultTransactionDefinition());
        jdbcTemplate.execute("SET LOCAL ROLE rls_tester;");
        jdbcTemplate.execute("SET LOCAL app.current_tenant_id = 'tenant-a';");
        List<String> resultTx1 = jdbcTemplate.queryForList("SELECT tenant_id FROM test_tenant_items", String.class);
        assertEquals(1, resultTx1.size(), "Tenant A should see exactly 1 row");
        assertEquals("tenant-a", resultTx1.get(0));
        transactionManager.commit(tx1); // Connection returned to pool

        // Step 2: Open Transaction 2 on pooled connection without setting tenant context
        TransactionStatus tx2 = transactionManager.getTransaction(new DefaultTransactionDefinition());
        jdbcTemplate.execute("SET LOCAL ROLE rls_tester;");
        List<String> resultTx2 = jdbcTemplate.queryForList("SELECT tenant_id FROM test_tenant_items", String.class);
        assertTrue(resultTx2.isEmpty(), "Pooled connection reuse must NOT leak Tenant A context when no context is set");
        transactionManager.commit(tx2);

        // Step 3: Open Transaction 3 on reused pooled connection explicitly setting tenant-b context
        TransactionStatus tx3 = transactionManager.getTransaction(new DefaultTransactionDefinition());
        jdbcTemplate.execute("SET LOCAL ROLE rls_tester;");
        jdbcTemplate.execute("SET LOCAL app.current_tenant_id = 'tenant-b';");
        List<String> resultTx3 = jdbcTemplate.queryForList("SELECT tenant_id FROM test_tenant_items", String.class);
        assertEquals(1, resultTx3.size(), "Tenant B must see exactly 1 row");
        assertEquals("tenant-b", resultTx3.get(0), "Tenant B should see only tenant-b data");
        assertTrue(!resultTx3.contains("tenant-a"), "Tenant B query must NEVER see Tenant A data from previous transaction on reused connection");
        transactionManager.commit(tx3);
    }

    @org.springframework.boot.test.context.TestConfiguration
    @org.springframework.boot.SpringBootConfiguration
    @org.springframework.boot.autoconfigure.EnableAutoConfiguration
    static class TestConfig {}
}
