# HELP: to use a custom config.json simply run the
#  container with a mapped file:
#  docker build -t local:postar .
#  docker run -v /my/config.json:/opt/postar/config.json -p 1234:1234 local:postar

FROM debian:jessie

RUN apt-get update && apt-get install -y \
    node \
    npm

ENV appBaseDir /opt/postar

# set up base environment
RUN mkdir -p ${appBaseDir}
COPY ./package.json ${appBaseDir}/

RUN cd ${appBaseDir} && \
    npm install

# copy app itself
RUN mkdir -p ${appBaseDir}/static \
  ${appBaseDir}/views
COPY ./static ${appBaseDir}/static
COPY ./views ${appBaseDir}/views
COPY postar.js ${appBaseDir}/
COPY README.md ${appBaseDir}/
COPY stats.js ${appBaseDir}/

# create run-script
RUN printf "#!/bin/sh\ncd ${appBaseDir}\nnpm start" > /opt/postar.sh && \
	chmod ugo+x /opt/postar.sh

# cleanup
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENTRYPOINT /opt/postar.sh

EXPOSE 8888
