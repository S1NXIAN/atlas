#!/usr/bin/env bash
set -e

# Atlas Updater

INSTALL_DIR="${1:-.opencode/atlas}"

if [ ! -d "$INSTALL_DIR" ]; then
    INSTALL_DIR="$HOME/.config/opencode/atlas"
fi

if [ ! -d "$INSTALL_DIR" ]; then
    echo "Error: Atlas installation not found. Run install.sh first."
    exit 1
fi

echo "Updating Atlas in $INSTALL_DIR..."
cd "$INSTALL_DIR" && git pull
echo "Atlas updated successfully. Restart OpenCode to apply changes."
