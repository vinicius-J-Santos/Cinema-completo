
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

COPY --from=build /app/publish .
COPY certs/isrgrootx1.pem /app/certs/isrgrootx1.pem

EXPOSE 10000

ENTRYPOINT ["sh", "-c", "dotnet cinemAPI.dll --urls http://0.0.0.0:${PORT:-10000}"]
