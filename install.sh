#!/usr/bin/env bash
set -e

# Atlas Installer
# Combines Superpowers (methodology) + OpenAgentsControl (context) + Oh My OpenCode (infrastructure)

PLATFORM="$(uname -s)"
case "$PLATFORM" in
    Linux*)     PLATFORM="Linux";;
    Darwin*)    PLATFORM="macOS";;
    CYGWIN*|MINGW*|MSYS*) PLATFORM="Windows";;
    *)          PLATFORM="Unknown";;
esac

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REPO_URL="https://github.com/S1NXIAN/atlas.git"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Atlas Installer${NC}"
echo -e "${BLUE}  Unified OpenCode Experience${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check prerequisites
if ! command -v git &>/dev/null; then
    echo -e "${RED}Error: git is required but not installed.${NC}"
    exit 1
fi

if ! command -v opencode &>/dev/null; then
    echo -e "${YELLOW}Warning: opencode CLI not found. Install it from https://opencode.ai${NC}"
    echo -e "${YELLOW}You can continue installing Atlas and it will be available when OpenCode is installed.${NC}"
fi

# Choose install location
echo "Choose installation location:"
echo ""
echo "  1) Local - Install to .opencode/ in current directory"
echo "     (Best for project-specific Atlas setup)"
echo ""
echo "  2) Global - Install to ~/.config/opencode/"
echo "     (Best for user-wide Atlas access across all projects)"
echo ""
echo -n "Enter your choice [1-2] (default: 1): "
read -r choice
choice=${choice:-1}

case "$choice" in
    1) INSTALL_DIR=".opencode/atlas"
       echo -e "${GREEN}Installing to ${INSTALL_DIR}${NC}"
       ;;
    2) INSTALL_DIR="$HOME/.config/opencode/atlas"
       echo -e "${GREEN}Installing to ${INSTALL_DIR}${NC}"
       ;;
    *) echo -e "${RED}Invalid choice. Exiting.${NC}"; exit 1 ;;
esac

# Clone Atlas
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}Atlas already installed. Updating...${NC}"
    cd "$INSTALL_DIR" && git pull
else
    mkdir -p "$(dirname "$INSTALL_DIR")"
    git clone "$REPO_URL" "$INSTALL_DIR"
fi

# Register plugin for OpenCode
OPENCODE_PLUGIN_DIR="$HOME/.config/opencode/plugins"
mkdir -p "$OPENCODE_PLUGIN_DIR"

if [ -f "$OPENCODE_PLUGIN_DIR/atlas.js" ] || [ -L "$OPENCODE_PLUGIN_DIR/atlas.js" ]; then
    rm -f "$OPENCODE_PLUGIN_DIR/atlas.js"
fi
ln -s "$INSTALL_DIR/.opencode/plugins/atlas.js" "$OPENCODE_PLUGIN_DIR/atlas.js"

# Verify
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Atlas installed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Atlas:    ${INSTALL_DIR}"
echo -e "  Plugin:   ${OPENCODE_PLUGIN_DIR}/atlas.js"
echo ""
echo -e "  Restart OpenCode and verify with:"
echo -e "    skill tool to list skills"
echo -e ""
echo -e "  Or use the ultrawork keyword to activate full power:"
echo -e "    \"build a login system — ultrawork\""
echo ""
