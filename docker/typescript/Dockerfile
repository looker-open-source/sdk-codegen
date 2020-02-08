FROM base-sdk:latest
MAINTAINER Rodney Gomes <rodney.gomes@looker.com>

USER looker:looker

#Make sure everything is sourced in
RUN bash --login -c "source /home/looker/.bash_profile"

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["bash", "--login", "-c", "/entrypoint.sh"]
