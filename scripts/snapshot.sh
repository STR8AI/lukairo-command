#!/usr/bin/env bash
set -euo pipefail

BASE="${1:-https://main.automations-cbs.pages.dev}"
OUTDIR="snapshots/$(date -u +"%Y%m%dT%H%M%SZ")"
mkdir -p "$OUTDIR"

# default endpoints - pass extra ones as additional args
ENDPOINTS=( "/" "/api/test" "/api/health" "/robots.txt" "/sitemap.xml" )
if [ "$#" -gt 1 ]; then
  # if user passed endpoints after base
  ENDPOINTS=("${@:2}")
fi

echo "Snapshotting $BASE -> $OUTDIR"
for ep in "${ENDPOINTS[@]}"; do
  # normalize endpoint -> file-safe name
  safe=$(echo "$ep" | sed 's@^/@_@; s@/@_@g; s@[^a-zA-Z0-9_.-]@_@g')
  url="${BASE%/}${ep}"
  echo "Fetching: $url"
  # save headers and body separately
  curl -sS -L -D "$OUTDIR/$safe.headers" -o "$OUTDIR/$safe.body" "$url" || echo "WARN: curl returned non-zero for $url"
  # add a small metadata file with URL and timestamp + http status from headers
  status=$(awk 'NR==1{print $2}' "$OUTDIR/$safe.headers" || echo "unknown")
  printf "url: %s\nfetched_at_utc: %s\nstatus: %s\nsource_preview: https://1878568c.automations-cbs.pages.dev\nalias: https://main.automations-cbs.pages.dev\n" \
    "$url" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$status" > "$OUTDIR/$safe.meta"
done

echo "Snapshots written to: $OUTDIR"
