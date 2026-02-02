#!/bin/bash
# scripts/snapshot_enhanced.sh

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SNAPSHOT_DIR="snapshots/${TIMESTAMP}"
mkdir -p "$SNAPSHOT_DIR"

# URLs to snapshot
PAGES=(
  "/"                    # Main page
  "/api/test"            # API test endpoint
  "/robots.txt"          # Robots
  "/sitemap.xml"         # Sitemap
  "/api/leads"           # (if exists)
  "/api/qualifications"  # (if exists)
  "/api/workflows"       # (if exists)
  "/api/analytics"       # (if exists)
)

BASE_URL="${1:-https://lukairo-engine.pages.dev}"

echo "📸 Capturing snapshots from: $BASE_URL"

for page in "${PAGES[@]}"; do
  # Clean filename
  filename=$(echo "$page" | sed 's/\//_/g' | sed 's/^_//')
  [ -z "$filename" ] && filename="index"
  
  echo "  → Capturing: $page"
  
  # Capture with curl
  curl -s "${BASE_URL}${page}" > "${SNAPSHOT_DIR}/${filename}.html"
  
  # Also save JSON if it's an API endpoint
  if [[ "$page" == /api/* ]]; then
    curl -s -H "Accept: application/json" "${BASE_URL}${page}" > "${SNAPSHOT_DIR}/${filename}.json"
  fi

done

echo "✅ Snapshots saved to: $SNAPSHOT_DIR"
echo ""
echo "📊 Captured files:"
ls -lh "$SNAPSHOT_DIR"
