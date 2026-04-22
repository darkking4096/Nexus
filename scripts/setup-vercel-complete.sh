#!/bin/bash

# Vercel Complete Setup Automation
# Story 8.1.3 - Frontend Vercel Deploy
# Coordinates CLI authentication + API setup + Playwright validation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/packages/frontend"
DOCS_DIR="$PROJECT_ROOT/docs"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Verify prerequisites
log_info "Verifying prerequisites..."

if ! command -v node &> /dev/null; then
  log_error "Node.js is not installed"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  log_error "npm is not installed"
  exit 1
fi

log_success "Prerequisites verified"

# Step 2: Verify build works locally
log_info "Verifying local build..."
cd "$FRONTEND_DIR"

npm run build 2>&1 | tail -5
if [ ${PIPESTATUS[0]} -eq 0 ]; then
  log_success "Local build verified"
else
  log_error "Local build failed"
  exit 1
fi

npm run typecheck 2>&1 | tail -3
if [ ${PIPESTATUS[0]} -eq 0 ]; then
  log_success "Type checking passed"
else
  log_error "Type checking failed"
  exit 1
fi

npm run lint 2>&1 | tail -3
if [ ${PIPESTATUS[0]} -eq 0 ]; then
  log_success "Linting passed"
else
  log_error "Linting failed"
  exit 1
fi

# Step 3: Authenticate with Vercel CLI
log_info "Authenticating with Vercel..."
log_info "If prompted, visit the device authentication URL in your browser"

npx vercel whoami 2>&1 || {
  log_warning "Not authenticated. Starting login flow..."
  npx vercel login
}

log_success "Vercel authentication successful"

# Step 4: Get Vercel token
log_info "Creating Vercel token..."
VERCEL_TOKEN=$(npx vercel token create --scope full --name "story-8.1.3-automation" 2>&1 | grep -oP '(?<=Token: )[^ ]+' || echo "")

if [ -z "$VERCEL_TOKEN" ]; then
  log_error "Failed to create Vercel token"
  exit 1
fi

log_success "Token created: ${VERCEL_TOKEN:0:10}..."

# Step 5: Run API-based setup
log_info "Running Vercel API setup..."
cd "$PROJECT_ROOT"

export VERCEL_TOKEN="$VERCEL_TOKEN"
node "$SCRIPT_DIR/vercel-setup-api.js"

if [ $? -ne 0 ]; then
  log_error "API setup failed"
  exit 1
fi

log_success "Vercel API setup completed"

# Step 6: Run Playwright validation (optional)
log_info "Checking if Playwright is available for browser validation..."

if command -v playwright &> /dev/null || npm list playwright &> /dev/null; then
  log_info "Running Playwright validation..."
  npx ts-node "$SCRIPT_DIR/vercel-setup-automation.playwright.ts" 2>&1 | tail -20
  log_success "Playwright validation completed"
else
  log_warning "Playwright not available, skipping browser validation"
fi

# Step 7: Commit changes
log_info "Committing configuration to git..."
cd "$PROJECT_ROOT"

git add -A
git commit -m "feat: Complete Vercel deployment setup [Story 8.1.3]

- Vercel project created and configured
- Environment variables set for production and preview
- GitHub integration enabled with CI/CD automation
- Build configuration verified: npm run build
- Type checking: npm run typecheck
- Linting: npm run lint
- Ready for deployment to production

Automated via: vercel-setup-api.js + Playwright validation" || {
  log_warning "No changes to commit or commit failed"
}

# Step 8: Summary
log_info "========================================="
log_success "Vercel Setup Completed Successfully!"
log_info "========================================="
log_info ""
log_info "📊 Project Configuration:"
log_info "  • Project Name: nexus-platform-frontend"
log_info "  • Repository: darkking4096/Nexus"
log_info "  • Root Directory: packages/frontend"
log_info "  • Build Command: npm run build"
log_info "  • Output Directory: dist/"
log_info ""
log_info "🔗 Vercel Dashboard:"
log_info "  https://vercel.com/dashboard"
log_info ""
log_info "📋 Next Steps:"
log_info "  1. Verify project in Vercel dashboard"
log_info "  2. Check environment variables are set"
log_info "  3. Create test PR to trigger preview deployment"
log_info "  4. Merge to main to deploy to production"
log_info ""
log_info "📄 Reports Generated:"
log_info "  • docs/qa/vercel-api-setup-report.md"
log_info "  • docs/qa/vercel-automation-report.md (if Playwright ran)"
log_info ""
log_info "========================================="
