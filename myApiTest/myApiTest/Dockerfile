FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["myApiTest.csproj", "./"]
RUN dotnet restore "myApiTest.csproj"

COPY . .
RUN dotnet publish "myApiTest.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# ✅ Create wwwroot directories (needed for image uploads)
RUN mkdir -p /app/wwwroot/Images/Avatars
RUN mkdir -p /app/wwwroot/Images/Posts

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "myApiTest.dll"]