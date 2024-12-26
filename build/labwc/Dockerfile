FROM debian:trixie-slim

LABEL maintainer="Karsten Hassel"

ENV APP_USER="pi"

RUN <<EOF
set -e
apt-get update
apt-get install -y labwc sudo wlr-randr
apt-get clean
rm -rf /var/lib/apt/lists/*
EOF

RUN <<EOF
groupadd -g 1000 $APP_USER
groupadd -g 44 video
groupadd -g 102 input
useradd -u 1000 -g $APP_USER -d /home/$APP_USER $APP_USER
usermod -a -G video,input,sudo $APP_USER
cat /etc/sudoers
echo "$APP_USER ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers
EOF

COPY --chmod=755 entrypoint.sh /entrypoint.sh

USER $APP_USER

ENV WLR_LIBINPUT_NO_DEVICES=1

ENTRYPOINT ["/entrypoint.sh"]
