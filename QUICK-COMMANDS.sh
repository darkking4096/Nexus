#!/bin/bash
# ============================================================================
# Story 8.1.1: Quick Command Reference
# ============================================================================
# Copy & paste individual commands as needed
# ============================================================================

echo "🚀 Story 8.1.1 — Supabase Setup Quick Commands"
echo ""

# ============================================================================
# STEP 1: SQL SETUP (Manual via Supabase Dashboard)
# ============================================================================
echo "📋 STEP 1: Execute SQL Setup"
echo "  → File: SUPABASE-COPY-PASTE.txt"
echo "  → Destination: Supabase Dashboard → SQL Editor → New Query"
echo "  → Action: Copy & paste entire file, then RUN (Ctrl+Enter)"
echo "  → Expected: 'Schema and RLS setup complete!'"
echo ""

# ============================================================================
# STEP 2: Data Migration
# ============================================================================
echo "📋 STEP 2: Run Data Migration"
echo ""

echo "  2a. Navigate to backend directory:"
cd packages/backend 2>/dev/null && echo "    ✓ In packages/backend" || echo "    ⚠️  Run from project root"
echo ""

echo "  2b. Install dependencies (if needed):"
echo "    npm install pg dotenv"
echo ""

echo "  2c. Test with dry-run (no changes):"
echo "    npm run migrate:data -- --dry-run"
echo ""

echo "  2d. Check migration results:"
echo "    cat migration-log.json | jq ."
echo ""

echo "  2e. If dry-run successful, run actual migration:"
echo "    npm run migrate:data"
echo ""

# ============================================================================
# STEP 3: Validate Setup
# ============================================================================
echo "📋 STEP 3: Validate Schema & RLS"
echo ""

echo "  3a. Run schema validation tests:"
echo "    npm run test:migrations"
echo ""

echo "  3b. Expected: 18/18 tests PASS"
echo ""

# ============================================================================
# STEP 4: Verify in Supabase Dashboard
# ============================================================================
echo "📋 STEP 4: Verify in Supabase"
echo ""

echo "  4a. List all tables (Supabase SQL Editor):"
echo "    SELECT table_name FROM information_schema.tables"
echo "    WHERE table_schema = 'public' ORDER BY table_name;"
echo ""

echo "  4b. Count RLS policies:"
echo "    SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';"
echo ""

echo "  4c. Test RLS (with context):"
echo "    SET app.current_user_id = 'user-123';"
echo "    SET app.current_user_role = 'user';"
echo "    SELECT COUNT(*) FROM profiles WHERE user_id = 'user-123';"
echo ""

# ============================================================================
# STEP 5: Configure Backups
# ============================================================================
echo "📋 STEP 5: Enable Backups"
echo ""
echo "  → Supabase Dashboard → Settings → Backups"
echo "  → Enable automated daily backups"
echo "  → Retention: 30 days"
echo "  → Schedule: 02:00 UTC (off-peak)"
echo ""

# ============================================================================
# TROUBLESHOOTING COMMANDS
# ============================================================================
echo "❓ TROUBLESHOOTING"
echo ""

echo "  Test Supabase Connection:"
echo "    node test-supabase.mjs"
echo ""

echo "  View Migration Log:"
echo "    cat packages/backend/migration-log.json"
echo ""

echo "  Check SQLite Row Count:"
echo "    sqlite3 packages/backend/data/nexus.db 'SELECT COUNT(*) FROM users'"
echo ""

echo "  Check PostgreSQL Row Count (in Supabase):"
echo "    SELECT COUNT(*) FROM users;"
echo ""

echo "  View .env.local (verify credentials):"
echo "    cat packages/backend/.env.local | grep DB_"
echo ""

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "✅ READY FOR EXECUTION"
echo ""
echo "Files to use:"
echo "  • SUPABASE-COPY-PASTE.txt — Copy/paste into Supabase"
echo "  • packages/backend/.env.local — Credentials configured"
echo "  • STORY-8-1-1-COMPLETION-CHECKLIST.md — Full details"
echo "  • docs/SUPABASE-EXECUTION-GUIDE.md — Step-by-step guide"
echo ""
echo "Next story: 8.1.2 (Backend Supabase Connection)"
echo ""
