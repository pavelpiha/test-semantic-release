FROM node:14.17-alpine

RUN apk add --no-cache git openssh

# mount your app source dir here
RUN mkdir /app
# mount your built app output dir here
RUN mkdir /dist
# optional mount id_rsa here to authenticate
# with github for private repos
RUN mkdir /ssh

RUN mkdir /root/.ssh
RUN mkdir /app-copy

#copy is commented on windows
COPY ./npm-build.sh .
RUN chmod +x npm-build.sh

ENTRYPOINT ["/npm-build.sh"]
