FROM node:latest

WORKDIR /root
RUN apt-get update && apt-get install -y libcap-dev
RUN git clone https://github.com/ioi/isolate
RUN cd isolate/ && make isolate && make install

CMD ["bash"]
