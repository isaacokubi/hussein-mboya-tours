#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "Searching JWT generation..."

grep -Rni "jwt.sign" controllers services middleware utils

