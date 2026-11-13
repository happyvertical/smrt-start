# Container image for the `self-hosted` runtime profile (PostgreSQL, public
# authentication, separate workers). Local development needs none of this:
# `pnpm dev` and `pnpm app:*` run the `local` profile with no containers.
FROM node:26.12.1-alpine@sha256:ae8e1c19d56886270987e99b3cfcef13a919f0655b376ae322bc64ada76f88cd AS build
WORKDIR /app
# Node 25+ images no longer bundle Corepack; a pinned copy keeps
# `packageManager` authoritative for the pnpm version.
RUN npm install --global corepack@0.36.0 && corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:26.12.1-alpine@sha256:ae8e1c19d56886270987e99b3cfcef13a919f0655b376ae322bc64ada76f88cd AS runtime
WORKDIR /app
# The pnpm that `pnpm install` below downloads lives in a shared Corepack home
# the runtime user can read, so workers and health commands that go through
# pnpm never download it again at container start (smrt#4863).
ENV COREPACK_HOME=/usr/local/share/corepack
RUN npm install --global corepack@0.36.0 && corepack enable
COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/.npmrc ./
# The CLI is a devDependency; the workers and the operator commands
# (`smrt app doctor`, `export`, `import`) run it, so it stays in the image.
RUN pnpm install --frozen-lockfile --prod=false
ENV NODE_ENV=production
ENV SMRT_RUNTIME_PROFILE=self-hosted
# Stand-in asset store: a directory, mount a volume here (compose.yaml does).
ENV SMRT_ASSETS_DIR=/data/assets
COPY --from=build /app/build ./build
COPY --from=build /app/.smrt ./.smrt
# smrt.config.ts derives the model packages from package.json and the
# optional cookbook through src/lib/features.ts, so both travel with it.
COPY --from=build /app/smrt.config.ts ./smrt.config.ts
COPY --from=build /app/src/lib/features.ts ./src/lib/features.ts
COPY --from=build /app/smrt.cookbook.jso[n] ./
RUN mkdir -p /data/assets && chown -R node:node /app /data/assets /usr/local/share/corepack
USER node
EXPOSE 3000
CMD ["node", "build"]
