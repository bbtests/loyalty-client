#!/usr/bin/env zsh

echo $(pwd)

if [ ! -d ./node_modules ] || [ -z "$(ls -A ./node_modules 2>/dev/null)" ]; then
    echo "Installing packages"
    pnpm i
    echo "Done installing packages"
fi

pnpm dev
