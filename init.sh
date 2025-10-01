#!/bin/bash

# Template Initialization Script
# This script helps you customize the template with your project details

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Template Project Initialization Tool    ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo ""

# Function to prompt for input with a default value
prompt_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -r -p "$(echo -e ${GREEN}$prompt ${YELLOW}[$default]${NC}: )" input
        eval $var_name='"${input:-$default}"'
    else
        read -r -p "$(echo -e ${GREEN}$prompt${NC}: )" input
        while [ -z "$input" ]; do
            echo -e "${RED}This field is required!${NC}"
            read -r -p "$(echo -e ${GREEN}$prompt${NC}: )" input
        done
        eval $var_name='"$input"'
    fi
}

# Function to validate URL format
validate_url() {
    local url="$1"
    if [[ ! "$url" =~ ^https?:// ]]; then
        return 1
    fi
    return 0
}

# Collect user inputs
echo -e "${BLUE}Please provide the following information:${NC}"
echo ""

prompt_input "Project Name (e.g., Okane)" "MyProject" PROJECT_NAME
prompt_input "Package/Module Name (lowercase, e.g., okane)" "$(echo $PROJECT_NAME | tr '[:upper:]' '[:lower:]')" PACKAGE_NAME
prompt_input "Short Name (for manifest)" "${PROJECT_NAME:0:10}" SHORT_NAME
prompt_input "Project Description" "A modern web application" DESCRIPTION
prompt_input "Project URL (with https://)" "https://example.com" PROJECT_URL

while ! validate_url "$PROJECT_URL"; do
    echo -e "${RED}Invalid URL format. Please include https:// or http://${NC}"
    prompt_input "Project URL (with https://)" "https://example.com" PROJECT_URL
done

prompt_input "Home Path (e.g., /home/username)" "/home/$USER" HOME_PATH
prompt_input "Icon filename (in assets folder, e.g., okane.png)" "logo.png" ICON_NAME

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Review your inputs:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Project Name:        ${GREEN}$PROJECT_NAME${NC}"
echo -e "Package Name:        ${GREEN}$PACKAGE_NAME${NC}"
echo -e "Short Name:          ${GREEN}$SHORT_NAME${NC}"
echo -e "Description:         ${GREEN}$DESCRIPTION${NC}"
echo -e "Project URL:         ${GREEN}$PROJECT_URL${NC}"
echo -e "Home Path:           ${GREEN}$HOME_PATH${NC}"
echo -e "Icon Filename:       ${GREEN}$ICON_NAME${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "$(echo -e ${GREEN}Proceed with these values? ${YELLOW}[y/N]${NC}: )" confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Starting initialization...${NC}"
echo ""

# Create backup
BACKUP_DIR="./backup_$(date +%Y%m%d_%H%M%S)"
echo -e "${YELLOW}Creating backup at $BACKUP_DIR...${NC}"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/" 2>/dev/null || true
echo -e "${GREEN}✓ Backup created${NC}"

# Function to perform case-sensitive replacement in a file
replace_in_file() {
    local file="$1"
    local search="$2"
    local replace="$3"
    
    if [ -f "$file" ]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|$search|$replace|g" "$file"
        else
            # Linux
            sed -i "s|$search|$replace|g" "$file"
        fi
    fi
}

# Function to replace in files with pattern matching
replace_pattern() {
    local search="$1"
    local replace="$2"
    local description="$3"
    
    echo -e "${YELLOW}Replacing $description...${NC}"
    
    # Find and replace in Go files
    find . -type f -name "*.go" ! -path "*/backup_*/*" -exec sed -i.bak "s|$search|$replace|g" {} \; 2>/dev/null || true
    
    # Find and replace in JSON files
    find . -type f -name "*.json" ! -path "*/backup_*/*" ! -path "*/node_modules/*" -exec sed -i.bak "s|$search|$replace|g" {} \; 2>/dev/null || true
    
    # Find and replace in TypeScript/JavaScript files
    find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -path "*/backup_*/*" ! -path "*/node_modules/*" -exec sed -i.bak "s|$search|$replace|g" {} \; 2>/dev/null || true
    
    # Find and replace in Markdown files
    find . -type f -name "*.md" ! -path "*/backup_*/*" -exec sed -i.bak "s|$search|$replace|g" {} \; 2>/dev/null || true
    
    # Clean up .bak files
    find . -type f -name "*.bak" ! -path "*/backup_*/*" -delete
    
    echo -e "${GREEN}✓ $description replaced${NC}"
}

# Perform replacements
echo ""
echo -e "${BLUE}Performing replacements...${NC}"
echo ""

# Replace module name in go.mod (handle it separately for better control)
echo -e "${YELLOW}Replacing Go module name...${NC}"
if [ -f "go.mod" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/^module Template$/module $PACKAGE_NAME/" go.mod
    else
        sed -i "s/^module Template$/module $PACKAGE_NAME/" go.mod
    fi
    echo -e "${GREEN}✓ Go module name replaced${NC}"
else
    echo -e "${RED}⚠ go.mod not found${NC}"
fi

# Replace import paths in Go files
replace_pattern "Template/" "$PACKAGE_NAME/" "Go import paths"
replace_pattern "vars \"Template\"" "vars \"$PACKAGE_NAME\"" "Go vars import"

# Replace in README
replace_pattern "# Template" "# $PROJECT_NAME" "README title"
replace_pattern "A modern, self-hostable developer portfolio powered by a \\*\\*Go backend\\*\\* and \\*\\*React frontend (via Bun \\& Vite)\\*\\*\\." "$DESCRIPTION" "README description"
replace_pattern "\\.\\\/bin\\\/Template-" "./bin/$PROJECT_NAME-" "Binary name in README"

# Replace in manifest.json
echo -e "${YELLOW}Replacing in manifest.json...${NC}"
if [ -f "assets/manifest.json" ]; then
    # Escape special characters in variables for sed
    DESCRIPTION_ESCAPED=$(printf '%s\n' "$DESCRIPTION" | sed 's/[&/\]/\\&/g')
    PROJECT_NAME_ESCAPED=$(printf '%s\n' "$PROJECT_NAME" | sed 's/[&/\]/\\&/g')
    SHORT_NAME_ESCAPED=$(printf '%s\n' "$SHORT_NAME" | sed 's/[&/\]/\\&/g')
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/\"name\": \"Template\"/\"name\": \"$PROJECT_NAME_ESCAPED\"/g" assets/manifest.json
        sed -i '' "s/\"short_name\": \"Template\"/\"short_name\": \"$SHORT_NAME_ESCAPED\"/g" assets/manifest.json
        sed -i '' "s/\"description\": \"Go + React Template\"/\"description\": \"$DESCRIPTION_ESCAPED\"/g" assets/manifest.json
    else
        # Linux
        sed -i "s/\"name\": \"Template\"/\"name\": \"$PROJECT_NAME_ESCAPED\"/g" assets/manifest.json
        sed -i "s/\"short_name\": \"Template\"/\"short_name\": \"$SHORT_NAME_ESCAPED\"/g" assets/manifest.json
        sed -i "s/\"description\": \"Go + React Template\"/\"description\": \"$DESCRIPTION_ESCAPED\"/g" assets/manifest.json
    fi
    echo -e "${GREEN}✓ Manifest replaced${NC}"
else
    echo -e "${RED}⚠ assets/manifest.json not found${NC}"
fi

# Replace in package.json
replace_pattern "\"name\": \"template\"" "\"name\": \"$(echo $PACKAGE_NAME | tr '[:upper:]' '[:lower:]')\"" "Package.json name"

# Replace in client config
replace_pattern "\"title\": \"Template\"" "\"title\": \"$PROJECT_NAME\"" "Client config title"

# Replace in server config
replace_pattern "\"home_path\": \"/home/template\"" "\"home_path\": \"$HOME_PATH\"" "Server home path"
replace_pattern "\"host\": \"https://template.example.com\"" "\"host\": \"$PROJECT_URL\"" "Server host URL"

# Replace in static routes - Order matters! Do specific replacements before general ones
echo -e "${YELLOW}Replacing in static routes...${NC}"
if [ -f "config/static.route.json" ]; then
    # Escape special characters in variables for sed
    DESCRIPTION_ESCAPED=$(printf '%s\n' "$DESCRIPTION" | sed 's/[&/\]/\\&/g')
    PROJECT_NAME_ESCAPED=$(printf '%s\n' "$PROJECT_NAME" | sed 's/[&/\]/\\&/g')
    PROJECT_URL_ESCAPED=$(printf '%s\n' "$PROJECT_URL" | sed 's/[&/\]/\\&/g')
    ICON_NAME_ESCAPED=$(printf '%s\n' "$ICON_NAME" | sed 's/[&/\]/\\&/g')
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/Template\\.png/$ICON_NAME_ESCAPED/g" config/static.route.json
        sed -i '' "s/\"content\": \"Go + React - Template\"/\"content\": \"$DESCRIPTION_ESCAPED\"/g" config/static.route.json
        sed -i '' "s/\"content\": \"Go + React Template\"/\"content\": \"$DESCRIPTION_ESCAPED\"/g" config/static.route.json
        sed -i '' "s#https://template\\.example\\.com#$PROJECT_URL_ESCAPED#g" config/static.route.json
        sed -i '' "s/Home | Template/Home | $PROJECT_NAME_ESCAPED/g" config/static.route.json
        sed -i '' "s/Not Found | Template/Not Found | $PROJECT_NAME_ESCAPED/g" config/static.route.json
        sed -i '' "s/Internal Server Error | Template/Internal Server Error | $PROJECT_NAME_ESCAPED/g" config/static.route.json
        sed -i '' "s/Client error | Template/Client error | $PROJECT_NAME_ESCAPED/g" config/static.route.json
        sed -i '' "s/\"content\": \"Template\"/\"content\": \"$PROJECT_NAME_ESCAPED\"/g" config/static.route.json
    else
        # Linux
        sed -i "s/Template\\.png/$ICON_NAME_ESCAPED/g" config/static.route.json
        sed -i "s/\"content\": \"Go + React - Template\"/\"content\": \"$DESCRIPTION_ESCAPED\"/g" config/static.route.json
        sed -i "s/\"content\": \"Go + React Template\"/\"content\": \"$DESCRIPTION_ESCAPED\"/g" config/static.route.json
        sed -i "s#https://template\\.example\\.com#$PROJECT_URL_ESCAPED#g" config/static.route.json
        sed -i "s/Home | Template/Home | $PROJECT_NAME_ESCAPED/g" config/static.route.json
        sed -i "s/Not Found | Template/Not Found | $PROJECT_NAME_ESCAPED/g" config/static.route.json
        sed -i "s/Internal Server Error | Template/Internal Server Error | $PROJECT_NAME_ESCAPED/g" config/static.route.json
        sed -i "s/Client error | Template/Client error | $PROJECT_NAME_ESCAPED/g" config/static.route.json
        sed -i "s/\"content\": \"Template\"/\"content\": \"$PROJECT_NAME_ESCAPED\"/g" config/static.route.json
    fi
    echo -e "${GREEN}✓ Static routes replaced${NC}"
else
    echo -e "${RED}⚠ config/static.route.json not found${NC}"
fi

# Replace in TypeScript/React files
replace_pattern "Template" "$PROJECT_NAME" "Component references"

# Remove temporary .bak files that might have been created
find . -type f -name "*.bak" ! -path "*/backup_*/*" -delete 2>/dev/null || true

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ Initialization complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Review the changes with: ${BLUE}git diff${NC}"
echo -e "  2. Update your icon file to: ${BLUE}assets/$ICON_NAME${NC}"
echo -e "  3. Run: ${BLUE}go mod tidy${NC}"
echo -e "  4. Run: ${BLUE}cd client && bun install${NC}"
echo -e "  5. If you need to revert, restore from: ${BLUE}$BACKUP_DIR${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
