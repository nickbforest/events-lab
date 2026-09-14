#!/bin/sh

set -eu

target_file="lib/supabase/database.types.ts"
temporary_file="${target_file}.tmp"

trap 'rm -f "$temporary_file"' EXIT
supabase gen types typescript --local > "$temporary_file"
mv "$temporary_file" "$target_file"
trap - EXIT
