# Multi-stage Dockerfile for FieldConnect API
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

# Copy csproj and restore
COPY ["api/FieldConnect.Api.csproj", "api/"]
RUN dotnet restore "api/FieldConnect.Api.csproj"

# Copy everything else and build
COPY api/ api/
WORKDIR "/src/api"
RUN dotnet build "FieldConnect.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FieldConnect.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final image
FROM mcr.microsoft.com/dotnet/nightly/aspnet:9.0-alpine AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV DATABASE_PATH=/app/data/fieldconnect.db
RUN mkdir -p /app/data
ENTRYPOINT ["dotnet", "FieldConnect.Api.dll"]
