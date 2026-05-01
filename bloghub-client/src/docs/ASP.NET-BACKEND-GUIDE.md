# ASP.NET Core Backend - Complete Integration Guide

This document provides comprehensive guidance for building the ASP.NET Core backend that integrates with your BlogHub React frontend.

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Database Schema](#database-schema)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Authentication & JWT](#authentication--jwt)
5. [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
6. [Entity Models](#entity-models)
7. [Controllers](#controllers)
8. [Services Layer](#services-layer)
9. [CORS Configuration](#cors-configuration)
10. [Error Handling](#error-handling)
11. [Deployment](#deployment)

---

## 🏗️ Project Structure

```
BlogHub.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── ArticlesController.cs
│   ├── UsersController.cs
│   ├── CategoriesController.cs
│   ├── CommentsController.cs
│   ├── NotificationsController.cs
│   ├── ReportsController.cs
│   └── AdminController.cs
├── Models/
│   ├── Entities/
│   │   ├── User.cs
│   │   ├── Article.cs
│   │   ├── Category.cs
│   │   ├── Comment.cs
│   │   ├── Notification.cs
│   │   └── Report.cs
│   └── DTOs/
│       ├── Auth/
│       ├── Articles/
│       ├── Users/
│       └── ...
├── Services/
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── IArticleService.cs
│   ├── ArticleService.cs
│   └── ...
├── Data/
│   ├── ApplicationDbContext.cs
│   └── Migrations/
├── Middleware/
│   └── ErrorHandlingMiddleware.cs
├── Helpers/
│   ├── JwtHelper.cs
│   └── PasswordHelper.cs
└── Program.cs
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Bio NVARCHAR(500) NULL,
    Avatar NVARCHAR(500) NULL,
    Role NVARCHAR(20) NOT NULL CHECK (Role IN ('Visitor', 'Author', 'Admin')),
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Active', 'Suspended', 'Banned')),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    INDEX IX_Users_Email (Email),
    INDEX IX_Users_Role (Role)
);
```

### Articles Table
```sql
CREATE TABLE Articles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Title NVARCHAR(200) NOT NULL,
    Excerpt NVARCHAR(500) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    CoverImage NVARCHAR(500) NULL,
    AuthorId UNIQUEIDENTIFIER NOT NULL,
    CategoryId UNIQUEIDENTIFIER NOT NULL,
    Tags NVARCHAR(MAX) NULL, -- JSON array
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Draft', 'Published')),
    Featured BIT NOT NULL DEFAULT 0,
    Views INT NOT NULL DEFAULT 0,
    Likes INT NOT NULL DEFAULT 0,
    CommentsCount INT NOT NULL DEFAULT 0,
    PublishedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    FOREIGN KEY (AuthorId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id),
    INDEX IX_Articles_AuthorId (AuthorId),
    INDEX IX_Articles_CategoryId (CategoryId),
    INDEX IX_Articles_Status (Status),
    INDEX IX_Articles_PublishedAt (PublishedAt)
);
```

### Categories Table
```sql
CREATE TABLE Categories (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Slug NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500) NULL,
    ArticlesCount INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    INDEX IX_Categories_Slug (Slug)
);
```

### Comments Table
```sql
CREATE TABLE Comments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ArticleId UNIQUEIDENTIFIER NOT NULL,
    AuthorId UNIQUEIDENTIFIER NOT NULL,
    Content NVARCHAR(1000) NOT NULL,
    ParentCommentId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    FOREIGN KEY (ArticleId) REFERENCES Articles(Id) ON DELETE CASCADE,
    FOREIGN KEY (AuthorId) REFERENCES Users(Id),
    FOREIGN KEY (ParentCommentId) REFERENCES Comments(Id),
    INDEX IX_Comments_ArticleId (ArticleId),
    INDEX IX_Comments_AuthorId (AuthorId),
    INDEX IX_Comments_ParentCommentId (ParentCommentId)
);
```

### Notifications Table
```sql
CREATE TABLE Notifications (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Type NVARCHAR(20) NOT NULL CHECK (Type IN ('Like', 'Comment', 'Report', 'System')),
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(500) NOT NULL,
    ArticleId UNIQUEIDENTIFIER NULL,
    Read BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX IX_Notifications_UserId (UserId),
    INDEX IX_Notifications_Read (Read)
);
```

### Reports Table
```sql
CREATE TABLE Reports (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContentType NVARCHAR(20) NOT NULL CHECK (ContentType IN ('Article', 'Comment')),
    ContentId UNIQUEIDENTIFIER NOT NULL,
    ReporterId UNIQUEIDENTIFIER NOT NULL,
    Reason NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NULL,
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Pending', 'Resolved', 'Rejected')),
    ModeratorId UNIQUEIDENTIFIER NULL,
    ModeratorNote NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    ResolvedAt DATETIME2 NULL,
    FOREIGN KEY (ReporterId) REFERENCES Users(Id),
    FOREIGN KEY (ModeratorId) REFERENCES Users(Id),
    INDEX IX_Reports_Status (Status),
    INDEX IX_Reports_ContentType_ContentId (ContentType, ContentId)
);
```

### RefreshTokens Table
```sql
CREATE TABLE RefreshTokens (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Token NVARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    RevokedAt DATETIME2 NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX IX_RefreshTokens_Token (Token),
    INDEX IX_RefreshTokens_UserId (UserId)
);
```

---

## 🔐 Authentication & JWT

### JWT Configuration (appsettings.json)
```json
{
  "JwtSettings": {
    "SecretKey": "YOUR_SUPER_SECRET_KEY_AT_LEAST_32_CHARACTERS_LONG",
    "Issuer": "BlogHubAPI",
    "Audience": "BlogHubClient",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  }
}
```

### JwtHelper.cs
```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public class JwtHelper
{
    private readonly IConfiguration _configuration;
    
    public JwtHelper(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    
    public string GenerateAccessToken(User user)
    {
        var secretKey = _configuration["JwtSettings:SecretKey"];
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role)
        };
        
        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                int.Parse(_configuration["JwtSettings:AccessTokenExpirationMinutes"])
            ),
            signingCredentials: credentials
        );
        
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    
    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    }
}
```

### Program.cs - JWT Authentication Setup
```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// JWT Authentication
var secretKey = builder.Configuration["JwtSettings:SecretKey"];
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey)
            ),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();
```

---

## 📡 API Endpoints Reference

### Authentication Endpoints

#### POST /api/auth/login
```csharp
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    // Validate credentials
    // Generate JWT tokens
    // Return AuthResponse
}
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "abc123...",
  "user": {
    "id": "guid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "Author",
    "avatar": "https://...",
    "bio": "..."
  },
  "expiresAt": "2024-01-15T12:00:00Z"
}
```

#### POST /api/auth/register
```csharp
[HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterRequest request)
{
    // Validate email doesn't exist
    // Hash password
    // Create user
    // Generate JWT tokens
    // Return AuthResponse
}
```

#### POST /api/auth/refresh-token
```csharp
[HttpPost("refresh-token")]
public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
{
    // Validate refresh token
    // Generate new access token
    // Return new tokens
}
```

#### GET /api/auth/me
```csharp
[HttpGet("me")]
[Authorize]
public async Task<IActionResult> GetCurrentUser()
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    // Return user data
}
```

### Articles Endpoints

#### GET /api/articles
```csharp
[HttpGet]
public async Task<IActionResult> GetArticles([FromQuery] ArticleListQuery query)
{
    // Return paginated articles
}
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `pageSize` (int): Items per page (default: 10)
- `categorySlug` (string): Filter by category
- `searchQuery` (string): Search in title/content
- `sortBy` (string): date | views | likes | comments
- `sortOrder` (string): asc | desc
- `status` (string): Draft | Published

**Response:**
```json
{
  "items": [/* array of articles */],
  "totalCount": 100,
  "page": 1,
  "pageSize": 10,
  "totalPages": 10
}
```

#### GET /api/articles/{id}
```csharp
[HttpGet("{id}")]
public async Task<IActionResult> GetArticleById(Guid id)
{
    // Increment view count
    // Return article
}
```

#### POST /api/articles
```csharp
[HttpPost]
[Authorize(Roles = "Author,Admin")]
public async Task<IActionResult> CreateArticle([FromBody] CreateArticleRequest request)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    // Create article
    // Return created article
}
```

#### PUT /api/articles/{id}
```csharp
[HttpPut("{id}")]
[Authorize(Roles = "Author,Admin")]
public async Task<IActionResult> UpdateArticle(Guid id, [FromBody] UpdateArticleRequest request)
{
    // Verify ownership
    // Update article
    // Return updated article
}
```

#### DELETE /api/articles/{id}
```csharp
[HttpDelete("{id}")]
[Authorize(Roles = "Author,Admin")]
public async Task<IActionResult> DeleteArticle(Guid id)
{
    // Verify ownership
    // Delete article
    // Return 204 No Content
}
```

---

## 🔧 Program.cs - Complete Configuration

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BlogHub.API.Data;
using BlogHub.API.Services;
using BlogHub.API.Helpers;
using BlogHub.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// JWT Authentication
var secretKey = builder.Configuration["JwtSettings:SecretKey"];
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(secretKey)
            ),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// CORS - Allow React app
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",  // Vite dev server
                "http://localhost:3000",  // Alternative port
                "https://yourdomain.com"  // Production
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IArticleService, ArticleService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<JwtHelper>();
builder.Services.AddScoped<PasswordHelper>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS must come before Authentication/Authorization
app.UseCors("AllowReactApp");

// Custom error handling middleware
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

---

## 🚨 Error Handling Middleware

```csharp
public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;
    
    public ErrorHandlingMiddleware(
        RequestDelegate next,
        ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }
    
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }
    
    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        
        var response = new
        {
            type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
            title = "An error occurred while processing your request",
            status = context.Response.StatusCode,
            detail = exception.Message,
            traceId = context.TraceIdentifier
        };
        
        return context.Response.WriteAsJsonAsync(response);
    }
}
```

---

## 📦 NuGet Packages Required

```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.0.0" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
```

---

## 🚀 Next Steps

1. **Create the ASP.NET Core Web API project**
2. **Install required NuGet packages**
3. **Set up database connection string in appsettings.json**
4. **Create Entity Models based on the schema above**
5. **Create DTOs matching the TypeScript interfaces in /types/api.types.ts**
6. **Implement Controllers with all endpoints**
7. **Configure JWT authentication**
8. **Set up CORS to allow your React app**
9. **Run migrations to create database**
10. **Test endpoints with Postman/Swagger**
11. **Update frontend .env file with your API URL**

---

## 📝 Connection String Example

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=BlogHubDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

For Azure SQL:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:yourserver.database.windows.net,1433;Initial Catalog=BlogHubDB;Persist Security Info=False;User ID=yourusername;Password=yourpassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

---

## ✅ Testing Checklist

- [ ] User can register with email/password
- [ ] User can login and receive JWT token
- [ ] Protected endpoints reject requests without valid token
- [ ] Token refresh works correctly
- [ ] Articles CRUD operations work
- [ ] Comments can be created and retrieved
- [ ] Categories can be managed (admin only)
- [ ] Notifications are created properly
- [ ] Reports system functions correctly
- [ ] CORS allows requests from React app
- [ ] Error responses match expected format

---

For complete C# code examples of Controllers and Services, refer to the inline code comments in this documentation.
