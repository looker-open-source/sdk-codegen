FROM base-sdk:latest
MAINTAINER Rodney Gomes <rodney.gomes@looker.com>

USER looker:looker

# install pyenv
RUN curl -L https://github.com/pyenv/pyenv-installer/raw/master/bin/pyenv-installer | bash
RUN echo 'export PATH="/home/looker/.pyenv/bin:$PATH"' >> ~/.bash_profile
RUN echo 'eval "$(pyenv init -)"' >> ~/.bash_profile
RUN echo 'eval "$(pyenv virtualenv-init -)"' >> ~/.bash_profile

RUN bash --login -c "pyenv install 3.7.4"
RUN echo 'pyenv global 3.7.4' >> /home/looker/.bash_profile
RUN bash --login -c "pip install --upgrade pip setuptools"
RUN bash --login -c "pip install -U pytest"
RUN bash --login -c "pip install pyyaml"
RUN bash --login -c "pip install pillow"
#Make sure everything is sourced in
RUN bash --login -c "source /home/looker/.bash_profile"

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["bash", "--login", "-c", "/entrypoint.sh"]
