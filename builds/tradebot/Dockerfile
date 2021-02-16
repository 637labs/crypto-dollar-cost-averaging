FROM python:3.7.4-slim

ARG USERNAME=tradebot
ARG USER_UID=1000
ARG USER_GID=$USER_UID

# Create a non-root user
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd -s /bin/bash --uid $USER_UID --gid $USER_GID -m $USERNAME

# Install application dependencies
COPY requirements.txt /tmp/pip-tmp/
RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && pip3 --disable-pip-version-check --no-cache-dir install -r /tmp/pip-tmp/requirements.txt \
    && rm -rf /tmp/pip-tmp \
    && apt-get remove -y git \
    #
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Application source
COPY backend /backend

# Allow statements and log messages to immediately appear in the logs
ENV PYTHONUNBUFFERED True

# Set user
USER $USERNAME

ENTRYPOINT gunicorn --bind :$PORT --workers 1 --threads 8 backend.services.tradebot:app
