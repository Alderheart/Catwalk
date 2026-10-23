#!/usr/bin/env bash
# Pulls the latest main, builds both packages, applies database migrations and
# restarts the backend. Run on the VPS with: sudo /opt/catwalk/deploy/deploy.sh
# Never touches the database file itself, only migrates it.

set -euo pipefail

app_dir=/opt/catwalk
run_as=(sudo -u catwalk -H)

cd "$app_dir"
"${run_as[@]}" git pull --ff-only

cd "$app_dir/backend"
"${run_as[@]}" npm ci
"${run_as[@]}" npm run build
"${run_as[@]}" npx prisma migrate deploy

cd "$app_dir/frontend"
"${run_as[@]}" npm ci
"${run_as[@]}" npm run build

systemctl restart catwalk
sleep 2
curl -fsS http://127.0.0.1:3000/api/health && echo
echo 'Deployed'
