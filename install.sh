#!/usr/bin/env bash
set -euo pipefail

echo "=== Installing Atlas dependencies (Arch Linux) ==="

sudo pacman -S --needed ripgrep fd bat ast-grep uv

if ! command -v sd &>/dev/null; then
  cargo install sd
fi

uv tool install semgrep
uv tool install grep-ast

if ! command -v comby &>/dev/null; then
  bash <(curl -sL get.comby.dev)
fi

echo "=== All tools installed ==="
