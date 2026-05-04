using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using myApiTest.Data;
using myApiTest.DTOs;
using myApiTest.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static System.Net.Mime.MediaTypeNames;
using static System.Net.WebRequestMethods;

namespace myApiTest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthorController : ControllerBase
    {
        private readonly BlogDbContext _blogDbContext;
        private readonly IConfiguration _configuration;
        public AuthorController (BlogDbContext blogDbContext , IConfiguration configuration)
        {
            _blogDbContext = blogDbContext;
            _configuration = configuration;
        }
   
        [HttpPost("register")]
        public async Task<ActionResult> Register([FromBody] RegisterDto register)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Something went wrong" });

            var emailExists = await _blogDbContext.Authors
                .AnyAsync(x => x.Email == register.Email);

            if (emailExists)
                return BadRequest(new { message = "هذا البريد الإلكتروني مستخدم بالفعل." });

            if (register.Password != register.ConfirmPassword)
                return BadRequest(new { message = "كلمة مرور غير متطابقة!" });

            var author = new Author
            {
                Name = register.Name,
                Email = register.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(register.Password)
            };

            _blogDbContext.Authors.Add(author);
            await _blogDbContext.SaveChangesAsync();

            // ✅ نرجع token بعد التسجيل مباشرة
            var token = GenerateJwtToken(author);

            return Ok(new
            {
                id = author.Id,
                name = author.Name,
                email = author.Email,
                role = "author",
                avatar = author.Avatar,  
                token = token,
                refreshToken = "" // تقدر تضيفه لاحقاً
            });
        }


    

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginDto loginData)
        {
            var author = await _blogDbContext.Authors
                .FirstOrDefaultAsync(e => e.Email == loginData.Email);

            if (author == null || !BCrypt.Net.BCrypt.Verify(loginData.Password, author.Password))
                return Unauthorized(new { message = "بيانات خاطئة!" });

            var token = GenerateJwtToken(author);

            return Ok(new
            {
                id = author.Id,
                name = author.Name,
                email = author.Email,
                avatar = author.Avatar,  
                role = author.Role,
                token = token,
                refreshToken = ""
            });
        }


        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("token");
            return Ok(new { message = "Logged out successfully" });
        }


        [HttpGet("/api/auth/me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }
                var author = await _blogDbContext.Authors
                .Where(a => a.Id == userId)
                .Select(a => new
                {
                    id = a.Id,
                    name = a.Name,
                    email = a.Email,
                    bio = a.Bio,
                    avatar = a.Avatar,
                    role = a.Role,
                    status = a.Status,
                    joinedAt = a.CreatedAt,
                    articlesCount = _blogDbContext.Posts.Count(p => p.AuthorId == a.Id)
                }).FirstOrDefaultAsync();

                if (author == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(author);

            }

            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });

            }
        }
            [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileDto updateData)
        {
            // تحقق إن المستخدم يعدّل حسابه فقط
            var authorId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            if (authorId != id)
                return Forbid();

            var author = await _blogDbContext.Authors.FindAsync(id);
            if (author == null)
                return NotFound();

            author.Name = updateData.Name;
            author.Bio = updateData.Bio ?? author.Bio;

            await _blogDbContext.SaveChangesAsync();

            return Ok(new
            {
                id = author.Id,
                name = author.Name,
                email = author.Email,
                bio = author.Bio,
                avatar = author.Avatar,  
                role = "author"
            });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePassword)
        {
            try
            {
                var authorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var author =await _blogDbContext.Authors.FindAsync(authorId);

                if(author == null)
                {
                    return NotFound(new { message = "User Not Found" });
                }

                if(!BCrypt.Net.BCrypt.Verify(changePassword.currentPassword , author.Password))
                {
                    return BadRequest(new { message = "Current password is incorrect" });
                }

                if(changePassword.newPassword != changePassword.confirmPassword)
                {
                    return BadRequest(new { message = "Passwords Do Not Match" });
                }

                author.Password = BCrypt.Net.BCrypt.HashPassword(changePassword.newPassword);
                await _blogDbContext.SaveChangesAsync();
                return Ok(new { message = "Password Changed Successfully" });
            }

            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount(int id) 
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var currentUserRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

                if (currentUserId != id && currentUserRole != "admin")
                {
                    return Forbid();
                }

                var author = await _blogDbContext.Authors.FindAsync(id);
                if (author == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var posts = _blogDbContext.Posts.Where(x => x.AuthorId == id);
                var comments = _blogDbContext.Comments.Where(x => x.AuthorId == id);

                _blogDbContext.Posts.RemoveRange(posts);
                _blogDbContext.Comments.RemoveRange(comments);
                _blogDbContext.Authors.Remove(author);
                await _blogDbContext.SaveChangesAsync();

                return Ok(new { message = "Account deleted successfully" });
            }

            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }


        }

        [HttpGet("all")]
        [Authorize]
        public async Task<IActionResult> GetAllAuthors()
        {
            try
            {
                var allAuthors = await _blogDbContext.Authors.Select(x => new
                {
                    id = x.Id,
                    name = x.Name,
                    email = x.Email,
                    bio = x.Bio,
                    role = x.Role,
                    status = x.Status,
                    joinedAt = x.CreatedAt,
                    avatar = x.Avatar,
                    articlesCount = _blogDbContext.Posts.Count(p => p.AuthorId == x.Id)
                }).ToListAsync();
                return Ok(new {authors = allAuthors });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAuthorById(int id)
        {
            try
            {
                var author = await _blogDbContext.Authors
                    .Where(a => a.Id == id)
                    .Select(a => new
                    {
                        id = a.Id,
                        name = a.Name,
                        email = a.Email,
                        bio = a.Bio,
                        role = a.Role,
                        joinedAt = a.CreatedAt,
                        avatar = a.Avatar,
                        articlesCount = _blogDbContext.Posts.Count(p => p.AuthorId == a.Id)
                    })
                    .FirstOrDefaultAsync();

                if (author == null)
                    return NotFound(new { message = "User not found" });

                return Ok(author);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

     

        [HttpGet("stats")]
        [Authorize]
        public async Task<IActionResult> GetStatus()
        {
            try
            {
                var totalUsers = await _blogDbContext.Authors.CountAsync();
                var totalArticles = await _blogDbContext.Posts.CountAsync();
                var totalComments = await _blogDbContext.Comments.CountAsync();

                return Ok(new
                {
                    totalUsers ,  
                    totalArticles,
                    totalComments,
                    pendingReports = 0
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}/suspend")]
        public async Task<IActionResult> SuspenedUser(int id)
        {
            try
            {
                var author = await _blogDbContext.Authors.FindAsync(id);
                if (author == null) return NotFound();

                author.Status = author.Status == "active" ? "suspended" : "active";
                await _blogDbContext.SaveChangesAsync();
                return Ok(new { message = "Status updated", status = author.Status });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id:int}/avatar")]
        [Authorize]
        public async Task<IActionResult> UploadAvatar(int id , IFormFile file)
        {
            try
            {
                var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (currentUserId == 0 || file.Length == 0)
                {
                    return BadRequest(new { message = "No file uploaded" });

                }
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var extension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { message = "Only image files are allowed" });
                }
                if (file.Length > 2* 1024 * 1024)
                {
                    return BadRequest(new { message = "File size must be less than 2MB" });
                }
                var author = await _blogDbContext.Authors.FindAsync(id);
                if(author == null)
                {
                    return NotFound();
                }

                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images", "Avatars");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                author.Avatar = $"/Images/Avatars/{fileName}";
                await _blogDbContext.SaveChangesAsync();
                return Ok(new { avatar = author.Avatar, message = "Avatar uploaded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // ==================== JWT GENERATOR ====================
        private string GenerateJwtToken(Author author)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, author.Id.ToString()),
                new Claim(ClaimTypes.Name, author.Name),
                new Claim(ClaimTypes.Email, author.Email),
                new Claim(ClaimTypes.Role, author.Role ?? "author")
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(
                    int.Parse(_configuration["Jwt:ExpiryInDays"]!)),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
