FROM node:22

WORKDIR /app


RUN apt-get update -y && apt-get upgrade -y
RUN apt-get install -y zsh python3  \
    && sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"


RUN corepack enable && pnpm config --global set store-dir ~/.pnpm-store && corepack prepare pnpm@latest --activate



EXPOSE 5000


ENTRYPOINT ["startup.sh" ]
