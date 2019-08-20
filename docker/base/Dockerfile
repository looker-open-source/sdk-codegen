FROM ubuntu:16.04
MAINTAINER Rodney Gomes <rodney.gomes@looker.com>

ARG UID=1000

RUN apt-get -y update && apt-get -y upgrade
RUN apt-get -y install sudo git-core curl make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev libffi-dev
# OpenJDK8 for the swagger tools
RUN apt-get -y install openjdk-8-jdk

# create looker user and make it possible to sudo without any password
RUN useradd -m looker -u $UID && passwd -d looker && adduser looker sudo
RUN echo "looker ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/looker && \
    chmod 0440 /etc/sudoers.d/looker

RUN mkdir -p /looker_sdk
RUN chown looker /looker_sdk

# install nodejs from official nodesource repo
RUN curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
RUN apt-get update -y && \
    apt-get install -y nodejs

# from this point onward we're doing all things as the `looker` user
USER looker:looker

# install yarn
RUN curl -o- -L https://yarnpkg.com/install.sh | bash
RUN echo 'export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"' >> /home/looker/.bash_profile
