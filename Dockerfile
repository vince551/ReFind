# ReFind backend
FROM alpine:3.22
ARG PB_VERSION=0.39.10
RUN apk add --no-cache ca-certificates unzip wget && \
    wget -q https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip -O /tmp/pb.zip && \
    unzip /tmp/pb.zip -d /usr/local/bin && chmod +x /usr/local/bin/pocketbase && rm /tmp/pb.zip
WORKDIR /refind
COPY pb_migrations ./pb_migrations
COPY pb_hooks ./pb_hooks
EXPOSE 8090
VOLUME ["/refind/pb_data"]
CMD ["pocketbase", "serve", "--http=0.0.0.0:8090"]
