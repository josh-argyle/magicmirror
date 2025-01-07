FROM debian:trixie-slim

LABEL maintainer="Karsten Hassel"

ENV APP_USER="pi"

RUN <<EOF
set -e
apt-get update
apt-get install -y labwc sudo wlr-randr
apt-get clean
rm -rf /var/lib/apt/lists/*
groupadd -g 1000 $APP_USER
useradd -u 1000 -g $APP_USER --shell /bin/bash --create-home $APP_USER
usermod -a -G sudo $APP_USER
echo "$APP_USER ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
EOF

COPY --chmod=755 entrypoint.sh /entrypoint.sh
COPY transparent /usr/share/icons/Adwaita/cursors/transparent

USER $APP_USER

ENV WLR_LIBINPUT_NO_DEVICES=1

ENTRYPOINT ["/entrypoint.sh"]
