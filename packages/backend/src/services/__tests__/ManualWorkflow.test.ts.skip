import Database from 'better-sqlite3';
import path from 'path';
import { randomUUID } from 'crypto';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { ManualWorkflow } from '../ManualWorkflow.js';

describe('ManualWorkflow Service', () => {
  let db: Database.Database;
  let workflow: ManualWorkflow;
  let testProfileId: string;

  beforeAll(() => {
    const testDb = path.join(__dirname, `test-manual-workflow-${randomUUID()}.db`);
    db = new Database(testDb);
    db.pragma('foreign_keys = ON');

    // Create minimal schema for testing
    db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      );

      CREATE TABLE profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        instagram_username TEXT UNIQUE NOT NULL,
        access_token TEXT NOT NULL
      );

      CREATE TABLE content (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        type TEXT NOT NULL,
        caption TEXT,
        status TEXT DEFAULT 'draft',
        created_at DATETIME,
        updated_at DATETIME
      );

      CREATE TABLE workflow_states (
        id TEXT PRIMARY KEY,
        content_id TEXT NOT NULL UNIQUE REFERENCES content(id),
        profile_id TEXT NOT NULL REFERENCES profiles(id),
        mode TEXT NOT NULL DEFAULT 'manual',
        current_step TEXT NOT NULL,
        schedule_data TEXT,
        content_data TEXT,
        publish_data TEXT,
        user_edits TEXT,
        auto_approve_enabled BOOLEAN DEFAULT 1,
        auto_approve_timeout_hours INTEGER DEFAULT 24,
        last_approval_at DATETIME,
        approved_by TEXT,
        rejected_at DATETIME,
        rejection_reason TEXT,
        created_at DATETIME,
        updated_at DATETIME
      );

      CREATE TABLE workflow_history (
        id TEXT PRIMARY KEY,
        content_id TEXT NOT NULL REFERENCES content(id),
        profile_id TEXT NOT NULL REFERENCES profiles(id),
        action TEXT NOT NULL,
        from_step TEXT,
        to_step TEXT,
        decision TEXT NOT NULL,
        user_id TEXT,
        reason TEXT,
        timestamp DATETIME
      );
    `);

    workflow = new ManualWorkflow(db);

    // Create test data
    const userId = randomUUID();
    testProfileId = randomUUID();

    db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)')
      .run(userId, 'test@example.com', 'hash');

    db.prepare(
      'INSERT INTO profiles (id, user_id, instagram_username, access_token) VALUES (?, ?, ?, ?)'
    ).run(testProfileId, userId, 'test_user', 'token_123');
  });

  afterAll(() => {
    db.close();
  });

  describe('initializeWorkflow', () => {
    it('should create workflow in schedule_pending state', async () => {
      const contentId = randomUUID();

      // Create content row first
      db.prepare('INSERT INTO content (id, profile_id, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(contentId, testProfileId, 'multi', 'draft', new Date().toISOString(), new Date().toISOString());

      const scheduleData = {
        publish_dates: ['2026-04-14'],
        content_types: ['feed'],
        posting_times: ['10:00'],
      };

      const state = await workflow.initializeWorkflow(contentId, testProfileId, scheduleData);

      expect(state).toBeDefined();
      expect(state.contentId).toBe(contentId);
      expect(state.currentStep).toBe('schedule_pending');
      expect(state.scheduleData).toEqual(scheduleData);
      expect(state.mode).toBe('manual');
    });

    it('should have auto-approval enabled by default', async () => {
      const contentId = randomUUID();

      // Create content row first
      db.prepare('INSERT INTO content (id, profile_id, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(contentId, testProfileId, 'multi', 'draft', new Date().toISOString(), new Date().toISOString());

      const state = await workflow.initializeWorkflow(
        contentId,
        testProfileId,
        { publish_dates: ['2026-04-14'] }
      );

      expect(state.autoApproveEnabled).toBe(true);
      expect(state.autoApproveTimeoutHours).toBe(24);
    });
  });

  describe('submitApproval', () => {
    let contentId: string;

    beforeEach(async () => {
      contentId = randomUUID();
      db.prepare('INSERT INTO content (id, profile_id, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(contentId, testProfileId, 'multi', 'draft', new Date().toISOString(), new Date().toISOString());

      await workflow.initializeWorkflow(contentId, testProfileId, {
        publish_dates: ['2026-04-14'],
      });
    });

    it('should approve schedule and move to schedule_approved', async () => {
      const result = await workflow.submitApproval({
        contentId,
        decision: 'approve',
        userId: 'user_123',
      });

      expect(result.currentStep).toBe('schedule_approved');
      expect(result.lastApprovalAt).toBeDefined();
      expect(result.approvedBy).toBe('user_123');
    });

    it('should reject and move to rejected state', async () => {
      const result = await workflow.submitApproval({
        contentId,
        decision: 'reject',
        reason: 'Schedule conflict',
        userId: 'user_123',
      });

      expect(result.currentStep).toBe('rejected');
      expect(result.rejectedAt).toBeDefined();
      expect(result.rejectionReason).toBe('Schedule conflict');
    });

    it('should edit and stay in same step', async () => {
      const edits = {
        publish_dates: ['2026-04-15'],
        posting_times: ['14:00'],
      };

      const result = await workflow.submitApproval({
        contentId,
        decision: 'edit',
        customEdits: edits,
        userId: 'user_123',
      });

      expect(result.currentStep).toBe('schedule_pending');
      expect(result.userEdits).toEqual(edits);
    });

    it('should progress through schedule → content → publish', async () => {
      // Step 1: Approve schedule
      let result = await workflow.submitApproval({
        contentId,
        decision: 'approve',
        userId: 'user_123',
      });
      expect(result.currentStep).toBe('schedule_approved');

      // Step 2: Approve moves to content_pending
      result = await workflow.submitApproval({
        contentId,
        decision: 'approve',
        userId: 'user_123',
      });
      expect(result.currentStep).toBe('content_pending');

      // Step 3: Approve content moves to content_approved
      result = await workflow.submitApproval({
        contentId,
        decision: 'approve',
        userId: 'user_123',
      });
      expect(result.currentStep).toBe('content_approved');

      // Step 4: Approve moves to publish_pending
      result = await workflow.submitApproval({
        contentId,
        decision: 'approve',
        userId: 'user_123',
      });
      expect(result.currentStep).toBe('publish_pending');

      // Step 5: Final approval publishes
      result = await workflow.submitApproval({
        contentId,
        decision: 'approve',
        userId: 'user_123',
      });
      expect(result.currentStep).toBe('published');
    });
  });

  describe('saveDraft', () => {
    let contentId: string;

    beforeEach(async () => {
      contentId = randomUUID();
      db.prepare('INSERT INTO content (id, profile_id, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(contentId, testProfileId, 'multi', 'draft', new Date().toISOString(), new Date().toISOString());

      await workflow.initializeWorkflow(contentId, testProfileId, {
        publish_dates: ['2026-04-14'],
      });
    });

    it('should save draft without changing workflow step', async () => {
      const draftData = {
        publish_dates: ['2026-04-14'],
        posting_times: ['10:00'],
        notes: 'Draft save test',
      };

      const result = await workflow.saveDraft(contentId, draftData);

      expect(result.currentStep).toBe('schedule_pending');
      expect(result.scheduleData).toEqual(draftData);
      expect(result.updatedAt).toBeDefined();
    });

    it('should persist multiple drafts to same step', async () => {
      const draft1 = { publish_dates: ['2026-04-14'], note: 'Version 1' };
      const draft2 = { publish_dates: ['2026-04-14'], note: 'Version 2' };

      await workflow.saveDraft(contentId, draft1);
      const result = await workflow.saveDraft(contentId, draft2);

      expect(result.scheduleData?.note).toBe('Version 2');
    });
  });

  describe('getApprovalPanel', () => {
    let contentId: string;

    beforeEach(async () => {
      contentId = randomUUID();
      db.prepare('INSERT INTO content (id, profile_id, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(contentId, testProfileId, 'multi', 'draft', new Date().toISOString(), new Date().toISOString());

      await workflow.initializeWorkflow(contentId, testProfileId, {
        publish_dates: ['2026-04-14'],
        content_types: ['feed', 'carousel'],
      });
    });

    it('should return approval panel with current step info', () => {
      const panel = workflow.getApprovalPanel(contentId);

      expect(panel).toBeDefined();
      expect(panel?.contentId).toBe(contentId);
      expect(panel?.currentStep).toBe('schedule_pending');
      expect(panel?.stepsHistory).toBeDefined();
      expect(panel?.editableFields).toBeDefined();
      expect(panel?.actionButtons).toBeDefined();
    });

    it('should include schedule data in approval panel', () => {
      const panel = workflow.getApprovalPanel(contentId);

      expect(panel?.scheduleData).toEqual({
        publish_dates: ['2026-04-14'],
        content_types: ['feed', 'carousel'],
      });
    });

    it('should enable approve and reject buttons when pending', () => {
      const panel = workflow.getApprovalPanel(contentId);

      expect(panel?.actionButtons.approve).toBe(true);
      expect(panel?.actionButtons.reject).toBe(true);
      expect(panel?.actionButtons.edit).toBe(true);
    });
  });

  describe('Complete E2E Workflow', () => {
    it('should complete full schedule → content → publish flow', async () => {
      const contentId = randomUUID();

      db.prepare('INSERT INTO content (id, profile_id, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(contentId, testProfileId, 'multi', 'draft', new Date().toISOString(), new Date().toISOString());

      // Initialize
      const scheduleData = {
        publish_dates: ['2026-04-14', '2026-04-15'],
        content_types: ['feed', 'carousel'],
        posting_times: ['10:00', '18:00'],
      };

      let state = await workflow.initializeWorkflow(contentId, testProfileId, scheduleData);
      expect(state.currentStep).toBe('schedule_pending');

      // Approve Schedule
      state = await workflow.submitApproval({
        contentId,
        decision: 'approve',
        userId: 'user_123',
      });
      expect(state.currentStep).toBe('schedule_approved');

      // Approval panel shows next step
      let panel = workflow.getApprovalPanel(contentId);
      expect(panel?.stepsHistory.length).toBeGreaterThan(0);

      // Move to content_pending
      state = await workflow.submitApproval({
        contentId,
        decision: 'approve',
        userId: 'user_123',
      });
      expect(state.currentStep).toBe('content_pending');

      // Approve Content
      state = await workflow.submitApproval({
        contentId,
        decision: 'approve',
        userId: 'user_123',
      });
      expect(state.currentStep).toBe('content_approved');

      // Move to publish_pending
      state = await workflow.submitApproval({
        contentId,
        decision: 'approve',
        userId: 'user_123',
      });
      expect(state.currentStep).toBe('publish_pending');

      // Final Approval - Publish
      state = await workflow.submitApproval({
        contentId,
        decision: 'approve',
        userId: 'user_123',
      });
      expect(state.currentStep).toBe('published');

      // Panel should show all completed
      panel = workflow.getApprovalPanel(contentId);
      expect(panel?.currentStep).toBe('published');
      const completedSteps = panel?.stepsHistory.filter(s => s.status === 'completed') || [];
      expect(completedSteps.length).toBe(3);
    });

    it('should handle rejection and restart flow', async () => {
      const contentId = randomUUID();

      db.prepare('INSERT INTO content (id, profile_id, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(contentId, testProfileId, 'multi', 'draft', new Date().toISOString(), new Date().toISOString());

      await workflow.initializeWorkflow(contentId, testProfileId, {
        publish_dates: ['2026-04-14'],
      });

      // Approve schedule
      let state = await workflow.submitApproval({
        contentId,
        decision: 'approve',
        userId: 'user_123',
      });
      expect(state.currentStep).toBe('schedule_approved');

      // Reject at content step
      state = await workflow.submitApproval({
        contentId,
        decision: 'reject',
        reason: 'Content needs revision',
        userId: 'user_123',
      });
      expect(state.currentStep).toBe('rejected');
      expect(state.rejectionReason).toBe('Content needs revision');
    });

    it('should handle edit with custom data', async () => {
      const contentId = randomUUID();

      db.prepare('INSERT INTO content (id, profile_id, type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(contentId, testProfileId, 'multi', 'draft', new Date().toISOString(), new Date().toISOString());

      const original = { publish_dates: ['2026-04-14'], time: '10:00' };
      await workflow.initializeWorkflow(contentId, testProfileId, original);

      const edits = { publish_dates: ['2026-04-15'], time: '14:00' };
      const state = await workflow.submitApproval({
        contentId,
        decision: 'edit',
        customEdits: edits,
        userId: 'user_123',
      });

      expect(state.userEdits).toEqual(edits);
      expect(state.currentStep).toBe('schedule_pending');
    });
  });
});
