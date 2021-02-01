FROM debian:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
  python3 \
  python3-pip

COPY ./caproto-backend/requirements.txt /tmp/requirements.txt
RUN pip3 install -r /tmp/requirements.txt

COPY ./caproto-backend /tmp/caproto-backend
WORKDIR /tmp/caproto-backend

CMD export PYTHONPATH=. && python3 caprotobackend/server.py
