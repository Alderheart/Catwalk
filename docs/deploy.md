# Deploying to a VPS

How the game runs on a single Ubuntu or Debian VPS, alongside whatever else is on it (a Minecraft server, for example). Why it's set up this way is in [decision 0005](decisions/0005-vps-deploy.md).

## How it fits together
- Caddy listens on ports 80 and 443, serves `frontend/dist`, proxies `/api/*` to the backend and handles HTTPS
- The backend runs under systemd as the `catwalk` user, listening on `127.0.0.1:3000` only
- The code lives in `/opt/catwalk` and the SQLite database in `/var/lib/catwalk/catwalk.db`, so redeploys never touch save data
- Nothing here uses port 25565, so a Minecraft server on the same box is unaffected

## One-time setup

1. **DNS.** At your domain registrar, add an `A` record for a subdomain (for example `cats`) pointing at the VPS's public IPv4 address. Check it with `dig +short cats.yourdomain.com`.

2. **Firewall.** Open 80 and 443 next to the existing rules. With ufw:
   ```sh
   sudo ufw allow 80,443/tcp
   ```
   Also open them in the VPS provider's firewall panel if it has one.

3. **Node 22 and Caddy.**
   ```sh
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt install -y nodejs git
   sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
   curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
   sudo apt update && sudo apt install -y caddy
   ```

4. **User, folders and code.**
   ```sh
   sudo useradd --system --create-home --shell /usr/sbin/nologin catwalk
   sudo mkdir -p /opt/catwalk /var/lib/catwalk
   sudo chown catwalk:catwalk /opt/catwalk /var/lib/catwalk
   sudo -u catwalk -H git clone https://github.com/Alderheart/Catwalk.git /opt/catwalk
   ```

5. **Backend settings.** Create `/opt/catwalk/backend/.env` (it's gitignored):
   ```sh
   sudo -u catwalk tee /opt/catwalk/backend/.env <<'ENV'
   DATABASE_URL="file:/var/lib/catwalk/catwalk.db"
   PORT=3000
   HOST=127.0.0.1
   ENV
   ```

6. **Service and site.**
   ```sh
   sudo cp /opt/catwalk/deploy/catwalk.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable catwalk
   sudo cp /opt/catwalk/deploy/Caddyfile /etc/caddy/Caddyfile
   ```
   Then change `cats.example.com` in `/etc/caddy/Caddyfile` to your subdomain. Edit that copy, not the one in `/opt/catwalk`, so `git pull` stays clean. If `/etc/caddy/Caddyfile` already has other sites, paste the block in instead of overwriting it.

7. **First deploy.**
   ```sh
   sudo /opt/catwalk/deploy/deploy.sh
   sudo systemctl reload caddy
   ```
   Open `https://cats.yourdomain.com` on your phone.

## Updating
After changes are merged to `main`, run `sudo /opt/catwalk/deploy/deploy.sh` on the VPS.

## Checking on it
- Backend logs: `journalctl -u catwalk -f`
- Caddy logs: `journalctl -u caddy -f`
- Health: `curl https://cats.yourdomain.com/api/health` should print `{"ok":true,"db":true}`

## Backups
The whole game state is one file. Copy it safely while the backend is running with:
```sh
sudo -u catwalk sqlite3 /var/lib/catwalk/catwalk.db ".backup '/var/lib/catwalk/backup-$(date +%F).db'"
```
(`sudo apt install sqlite3` if it's missing.)
