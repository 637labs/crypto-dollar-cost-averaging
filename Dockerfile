FROM python:3.7.4

ARG USERNAME=tradebot
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Create a non-root user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd -s /bin/bash --uid $USER_UID --gid $USER_GID -m $USERNAME

# Install application dependencies
COPY requirements.txt /tmp/pip-tmp/
RUN pip3 --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
    && rm -rf /tmp/pip-tmp

# Application source
COPY ./tradebot /tradebot

# Set user
USER $USERNAME

ENTRYPOINT [ "python3", "-u", "-m", "tradebot.run" ]
