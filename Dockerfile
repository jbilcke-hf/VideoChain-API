FROM node:18
# try this maybe

ARG DEBIAN_FRONTEND=noninteractive

RUN apt update

# For FFMPEG and gl concat
RUN apt --yes install ffmpeg curl build-essential python3 python3-dev libx11-dev libxext-dev libxext6 libglu1-mesa-dev xvfb libxi-dev libglew-dev pkg-config

# For Puppeteer
RUN apt --yes install libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 libasound2 libpangocairo-1.0-0 libxss1 libgtk-3-0

# Set up a new user named "user" with user ID 1000
RUN useradd -o -u 1000 user

# Switch to the "user" user
USER user

# Set home to the user's home directory
ENV HOME=/home/user \
	PATH=/home/user/.local/bin:$PATH

# Set the working directory to the user's home directory
WORKDIR $HOME/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=user package*.json $HOME/app

RUN npm install


# Copy the current directory contents into the container at $HOME/app setting the owner to the user
COPY --chown=user . $HOME/app

EXPOSE 7860

# we can't use this (it time out)
# CMD [ "xvfb-run", "-s", "-ac -screen 0 1920x1080x24", "npm", "run", "start" ]
CMD [ "npm", "run", "start" ]