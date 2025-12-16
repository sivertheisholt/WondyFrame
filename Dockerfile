# ---------- Build stage ----------
FROM rust:1.92.0-slim-trixie AS builder

RUN apt update
RUN apt install -y musl-tools pkg-config libssl-dev openssl

WORKDIR /app
COPY ./wondyframe/ .

RUN cargo install --path .

# Prod stage
FROM gcr.io/distroless/cc
COPY --from=builder /app/target/release/wondyframe /
CMD ["./wondyframe"]