#!/bin/sh
# Recrée une base locale « carnet » : environnement Supabase simulé, puis la migration du projet.
# Prérequis : PostgreSQL local, utilisateur postgres / mot de passe postgres.
set -e
DIR=$(cd "$(dirname "$0")" && pwd)
export PGPASSWORD=postgres
psql -h 127.0.0.1 -U postgres -q -c "select pg_terminate_backend(pid) from pg_stat_activity where datname = 'carnet' and pid <> pg_backend_pid()" >/dev/null
psql -h 127.0.0.1 -U postgres -q -c 'drop database if exists carnet' -c 'create database carnet'
psql -h 127.0.0.1 -U postgres -q -v ON_ERROR_STOP=1 -d carnet -f "$DIR/supabase-stub.sql"
psql -h 127.0.0.1 -U postgres -q -v ON_ERROR_STOP=1 -d carnet -f "$DIR/../migrations/20260925000000_init.sql"
echo "Base « carnet » prête."
