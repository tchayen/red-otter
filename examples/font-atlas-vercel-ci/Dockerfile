FROM ubuntu

# Install Node 18, npm and yarn
RUN apt-get update && \
  # libnss3 is required for puppeteer.
  apt-get install -y curl gnupg2 libnss3 && \
  curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
  apt-get install -y nodejs && \
  npm install -g yarn

COPY . /

# Install dependencies
RUN yarn install

# # Execute the script
# RUN yarn ts-node ci-script.ts
