FROM harbor.17usoft.com/bx/base/python:3.12-slim-bookworm

RUN sed -i 's|deb.debian.org|mirrors.tuna.tsinghua.edu.cn|g' /etc/apt/sources.list.d/debian.sources \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs npm jq git ripgrep curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --uid 1000 --create-home sandbox

USER 1000:1000
WORKDIR /workspace
CMD ["/bin/sh"]
