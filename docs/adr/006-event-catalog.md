# 006 - Event Catalog

## Status
Accepted

## Context
We need a unified event catalog across the Recruitment ERP to decouple services and broadcast updates to the frontend via the gateway service.

## Decision
We will use Kafka with the following topics:

### 1. `requisition-events`
- **Key**: `tenantId`
- **Partitions**: 12
- **Event Types**: `RequisitionCreated`, `RequisitionApproved`, `RequisitionClosed`
- **Payload Schema**:
  - `requisitionId` (string)
  - `status` (string)
  - `title` (string)
- **PII**: None

### 2. `candidate-events`
- **Key**: `tenantId`
- **Partitions**: 12
- **Event Types**: `CandidateApplied`, `CandidateShortlisted`, `CandidateRejected`
- **Payload Schema**:
  - `candidateId` (string)
  - `stage` (string)
  - `name` (string)
- **PII**: `name` contains PII

### 3. `compliance-events`
- **Key**: `tenantId`
- **Partitions**: 12
- **Event Types**: `ChecklistCreated`, `ChecklistItemCompleted`
- **Payload Schema**:
  - `checklistId` (string)
  - `candidateId` (string)
  - `status` (string)
- **PII**: None

### 4. `notification-events`
- **Key**: `tenantId`
- **Partitions**: 6
- **Event Types**: `EmailSent`, `SmsSent`
- **Payload Schema**:
  - `recipientId` (string)
  - `type` (string)
  - `status` (string)
- **PII**: None

### Shared Envelope Structure
All events will be wrapped in this envelope:
```json
{
  "eventType": "string",
  "tenantId": "string",
  "timestamp": "ISO-8601",
  "version": "1.0",
  "payload": {}
}
```

## Consequences
- Requires all publishers to use the standard envelope
- Enables the Gateway Service to listen to topics generically using `DomainEvent<JsonNode>` without knowing payload structures
