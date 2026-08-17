# Builds the container image every beam-tier site deploys to Cloud Run via .github/workflows/
# deploy.yml + splicewire:beam:provision (splicewire/laravel-beam-provision). Proven live against
# beam-pilot-gcp-cloud-run (gcp-cloud-run-provisioning map, tickets 10 + the CI follow-on).
#
# Single builder stage, not split PHP/Node stages: @laravel/vite-plugin-wayfinder's `vite build`
# shells out to `php artisan wayfinder:generate` to emit typed route helpers, so the frontend build
# itself needs a booted (vendor-installed) Laravel app, not just Node — found live, not assumed.

FROM php:8.4-cli-bookworm AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip libpq-dev libzip-dev ca-certificates curl gnupg \
    && docker-php-ext-install pdo_pgsql pgsql zip bcmath exif \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN corepack enable

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --optimize-autoloader
COPY . .
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

# A throwaway .env/APP_KEY, needed only so `artisan wayfinder:generate` can boot the framework
# during the build — never copied into the runtime stage below; the real value is injected via
# Cloud Run env vars at deploy time.
RUN cp .env.example .env && php artisan key:generate --ansi \
    && pnpm install --no-frozen-lockfile --ignore-scripts \
    && pnpm run build \
    && rm .env

FROM php:8.4-cli-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev libzip-dev \
    && docker-php-ext-install pdo_pgsql pgsql zip bcmath exif \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html
COPY --from=builder /app /var/www/html
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && chmod -R a+rwX storage bootstrap/cache

ENV APP_ENV=production
ENV LOG_CHANNEL=stderr
# Laravel's own docs document a bare socket-directory `host` as PDO pgsql's way to address a Unix
# socket — Cloud Run's Auth Proxy volume mount exposes it at /cloudsql/<connection_name> (ticket
# 01's finding). Real value is exported by entrypoint.sh from DB_CREDENTIALS_JSON at boot.
ENV DB_CONNECTION=pgsql

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
