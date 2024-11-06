
FROM node

# 使用淘宝 NPM 镜像（国内机器构建推荐启用）
RUN npm config set registry https://registry.npm.taobao.org/

ARG NoNpmInstall
ENV NoNpmInstall=${NoNpmInstall}

# 安装网络测试工具
RUN sed -i 's/deb.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list
RUN sed -i 's/security.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list
RUN apt-get update && apt-get -y dist-upgrade
RUN apt-get -y install netcat-traditional

# 假设外部已经npm初始化过了
ADD . /src
WORKDIR /src
RUN if [ "$NoNpmInstall" != "1" ]; then npm install; fi
RUN npm run buildTS

# clean
RUN npm prune --production

# move
RUN rm -rf /app \
    && mkdir /app/ \
    && mv dist /app/dist \
    && mv node_modules /app/ \
    && mv tsgf.*.config.json /app/ \
    && rm -rf /src

# ENV
ENV NODE_ENV production

EXPOSE 7100/TCP 7101/TCP 7102/TCP 7801/TCP 7901/TCP


WORKDIR /app
CMD node dist/index.js