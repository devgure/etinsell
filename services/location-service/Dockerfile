FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go mod init etincel/location || true
RUN go build -o /location-service
EXPOSE 3070
CMD ["/location-service"]
