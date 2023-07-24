FROM node:18


ARG DEBIAN_FRONTEND=noninteractive

RUN apt update

RUN apt --yes install ffmpeg libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 libasound2 libpangocairo-1.0-0 libxss1 libgtk-3-0

RUN apt --yes install build-essential libxi-dev libglu1-mesa-dev libglew-dev pkg-config

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

CMD [ "npm", "run", "start" ]