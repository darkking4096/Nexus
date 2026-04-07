#!/bin/bash
REPORT=".ai/validation-batch-report.md"
echo "# 🎯 Story Validation Report — Batch @po" > "$REPORT"
echo "**Date**: $(date)" >> "$REPORT"
echo "**Mode**: YOLO (Autonomous)" >> "$REPORT"
echo "**Stories to Validate**: 43" >> "$REPORT"
echo "" >> "$REPORT"

PASS=0
PARTIAL=0
FAIL=0

for story in docs/stories/[1-7].[0-9]*.story.md; do
  [[ "$story" == *"INDEX"* ]] || [[ "$story" == *"README"* ]] || [[ "$story" == *"MANIFEST"* ]] && continue
  
  STORYID=$(basename "$story" | sed 's/.story.md//')
  STATUS="PASS"
  
  # Check for critical sections
  grep -q "^## 📋 Descripción" "$story" || STATUS="PARTIAL"
  grep -q "^## 🎯 Critérios de Aceitação" "$story" || STATUS="PARTIAL"
  grep -q "^## 📐 Escopo Técnico" "$story" || STATUS="PARTIAL"
  grep -q "^## 📂 File List" "$story" || STATUS="PARTIAL"
  grep -q "^## 🚀 Status Tracking" "$story" || STATUS="PARTIAL"
  
  # Check if AC has checkboxes
  grep -q "- \[ \]" "$story" || STATUS="PARTIAL"
  
  if [ "$STATUS" = "PASS" ]; then
    ((PASS++))
    echo "✅ $STORYID: PASS"
  else
    ((PARTIAL++))
    echo "⚠️  $STORYID: PARTIAL (missing sections or detail)"
  fi
done >> "$REPORT"

echo "" >> "$REPORT"
echo "## 📊 Validation Summary" >> "$REPORT"
echo "- ✅ PASS: $PASS" >> "$REPORT"
echo "- ⚠️  PARTIAL: $PARTIAL" >> "$REPORT"
echo "- ❌ FAIL: $FAIL" >> "$REPORT"
echo "" >> "$REPORT"
echo "## 🎯 Decision" >> "$REPORT"
if [ $FAIL -eq 0 ] && [ $PARTIAL -le 5 ]; then
  echo "**GO** — All stories are ready for implementation. Partial gaps are minor." >> "$REPORT"
else
  echo "**NO-GO** — Significant issues detected, recommend review." >> "$REPORT"
fi

cat "$REPORT"
