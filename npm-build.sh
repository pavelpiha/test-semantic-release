#! /usr/bin/env sh

set -e

# the npm script to run to perform the build
if [ -z "$NPM_SCRIPT" ]; then
  echo "[NPM BUILD IMAGE] ERROR: An npm script must be specified"
  exit 1
fi

# optionally add gh ssh key to pull private repos
if [ -f /ssh/id_rsa ]; then
  echo "[NPM BUILD IMAGE] Adding Github SSH Config"
  cp /ssh/id_rsa /root/.ssh/id_rsa
  chmod 0400 /root/.ssh/id_rsa
  # accept github.com host
  ssh-keyscan -t rsa github.com 2>&1 >> /root/.ssh/known_hosts
fi

# optionally add .npmrc with custom repo config and/or
# personal access token
if [ ! -z "$NPMRC" ]; then
  echo "[NPM BUILD IMAGE] Adding .npmrc"
  echo $NPMRC > /root/.npmrc
  chmod 0400 /root/.npmrc
fi

cd app

# copy everything from app except node_modules and dist dir
echo "[NPM BUILD IMAGE] Copying Source Files"
cp -rf `ls -A | grep -v "node_modules"` . ../app-copy
cd ../app-copy

echo "[NPM BUILD IMAGE] Installing Deps"
npm install

# meant to force deps to update (with respect to semver).
# mostly this is just to enable devs to tell the build image
# to ignore package-lock.json for deps which pull from a
# github branch.
if [ ! -z "$UPDATE_PACKAGES" ]; then
  echo "[NPM BUILD IMAGE] Manually Updating Some Deps: $UPDATE_PACKAGES"
  npm install $UPDATE_PACKAGES
fi

echo "[NPM BUILD IMAGE] Building App - $NPM_SCRIPT"
npm run $NPM_SCRIPT

# put built app in dist dir!
echo "[NPM BUILD IMAGE] Copying App Bundle"
cp -r ./dist/* ../dist

# optionally own the final output as the requested user:group
if [ -n $USER_ID ] && [ -n $GROUP_ID ]; then
  echo "[NPM BUILD IMAGE] Changing App Bundle Owner"
  chown -R $USER_ID:$GROUP_ID ../dist
fi

echo "[NPM BUILD IMAGE] Done!"
