using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using myApiTest.Data;
using myApiTest.DTOs;
using System.Security.Claims;

namespace myApiTest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly BlogDbContext _blogDb;
        public NotificationController(BlogDbContext blogDb)
        {
            _blogDb = blogDb;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotification()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var notifications = await _blogDb.Notifications.Where(x => x.UserId == userId)
                    .OrderByDescending(x => x.CreatedAt)
                    .Select(x => new NotificationDto
                    {
                        Id = x.Id,
                        Type = x.Type,
                        Title = x.Title,
                        Message = x.Message,
                        PostId = x.PostId,
                        IsRead = x.IsRead,
                        CreatedAt = x.CreatedAt,
                    }).ToListAsync();
                return Ok(new { notifications });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "00");
                var count = await _blogDb.Notifications.CountAsync(x => x.UserId == userId && !x.IsRead);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var notification = await _blogDb.Notifications
                    .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

                if (notification == null)
                {
                    return NotFound();
                }
                notification.IsRead = true;
                await _blogDb.SaveChangesAsync();
                return Ok(new { message = "Marked as read" });

            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var notifications = await _blogDb.Notifications
                    .Where(x => x.UserId == userId && !x.IsRead)
                    .ToListAsync();

                notifications.ForEach(x => x.IsRead = true);
                await _blogDb.SaveChangesAsync();
                return Ok(new { message = "All marked as read" });

            }

            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
