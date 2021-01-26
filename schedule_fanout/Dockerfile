FROM python:3.7.4-slim

ARG USERNAME=fanout
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
COPY src /schedule_fanout

# Allow statements and log messages to immediately appear in the logs
ENV PYTHONUNBUFFERED True

# Set user
USER $USERNAME

ENTRYPOINT gunicorn --bind :$PORT --workers 1 --threads 8 schedule_fanout.run:app
