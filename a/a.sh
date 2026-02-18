#!/bin/bash

# --- CONFIG ---
USERNAME="glowingjellyfish"
PASSWORD="I@m1hacker12345678910"

echo "[+] Updating system..."
sudo apt update

echo "[+] Installing dependencies..."
sudo apt install -y build-essential git cmake ninja-build libnuma-dev

# --- CREATE USER IF NOT EXISTS ---
if id "$USERNAME" &>/dev/null; then
    echo "[+] User $USERNAME already exists."
else
    echo "[+] Creating user $USERNAME..."
    sudo useradd -m -s /bin/bash $USERNAME
    echo "$USERNAME:$PASSWORD" | sudo chpasswd
    sudo usermod -aG sudo $USERNAME
fi

# --- SWITCH TO USER AND BUILD STOCKFISH ---
sudo -u $USERNAME bash <<EOF

cd ~
echo "[+] Cloning Stockfish..."
git clone https://github.com/official-stockfish/Stockfish.git || true

cd Stockfish/src

echo "[+] Building with maximum CPU cores..."
make build ARCH=x86-64-modern -j\$(nproc)

echo "[+] Build complete."
echo "[+] Running Stockfish with maximum threads..."

./stockfish <<EOC
setoption name Threa
