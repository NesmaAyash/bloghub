using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using myApiTest.Data;
using myApiTest.DTOs;
using myApiTest.Models;
using System.Security.Claims;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace myApiTest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CommentController : ControllerBase
    {
        private readonly BlogDbContext _blogDb;
        public CommentController(BlogDbContext blogDb)
        {
            _blogDb = blogDb;
        }

        [HttpGet("Post/{postId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCommentsByPost(int postId)
        {
            try
            {
                var comments = await _blogDb.Comments.Include(x => x.Author).Where(x => x.PostId == postId)
                    .OrderByDescending(x => x.CreatedAt).Select(x => new CommentDto
                    {
                        Id = x.Id,
                        Content = x.Content,
                        PostId = x.PostId,
                        AuthorId = x.AuthorId,
                        AuthorName = x.Author.Name,
                        AuthorAvatar = x.Author.Avatar ?? "",  
                    }).ToListAsync();
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateComment([FromBody]CreateCommentDto comment) 
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);

                }

                var authorIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(authorIdClaim) || !int.TryParse(authorIdClaim, out int authorId))
                    return Unauthorized(new { message = "Invalid token" });

                var post = await _blogDb.Posts.FindAsync(comment.PostId);
                if (post == null)
                    return NotFound(new { message = "Post not found" });

                var author = await _blogDb.Authors.FindAsync(authorId);
                if (author == null)
                    return Unauthorized(new { message = "Author not found" });

                var newComment = new Comment
                {
                    Content = comment.Content,
                    PostId = comment.PostId,
                    AuthorId = authorId,
                    CreatedAt = DateTime.UtcNow
                };

                _blogDb.Comments.Add(newComment);
                await _blogDb.SaveChangesAsync();

                post.CommentsCount += 1;



                if (post.AuthorId != authorId)
                {
                    var notification = new Notification
                    {
                        Type = "comment",
                        Title = "New Comment",
                        Message = $"{author.Name} commented on your article",
                        UserId = post.AuthorId,
                        PostId = post.Id,
                    };
                    _blogDb.Notifications.Add(notification);
                }
                await _blogDb.SaveChangesAsync();


                return Ok(new
                    {
                        comment = new CommentDto
                        {
                            Id = newComment.Id,
                            Content = comment.Content,
                            PostId = comment.PostId,
                            AuthorId = newComment.AuthorId,
                            AuthorName = author.Name,
                            AuthorAvatar = author.Avatar,
                        }
                    });
                
            }
            catch (Exception ex)
            {
                                return BadRequest(new { message = ex.Message });

            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComment (int id)
        {
            try
            {
                var authorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var comment = await _blogDb.Comments.FindAsync(id);
                if(comment == null)
                {
                    return NotFound(new { message = "Comment not found" });
                }
                if(comment.AuthorId != authorId)
                {
                    return Forbid();
                }

                _blogDb.Comments.Remove(comment);
                var post = await _blogDb.Posts.FindAsync(comment.PostId);
                if (post != null)
                {
                    post.CommentsCount = Math.Max(0, post.CommentsCount - 1);
                }
                await _blogDb.SaveChangesAsync();
               
                return Ok(new { message = "Comment deleted" });

            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("all")]
        [Authorize]
        public async Task<IActionResult> GetAllComments()
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if(userRole != "admin")
                {
                    return Forbid();
                }

                var comments = await _blogDb.Comments
          .Include(c => c.Author)
          .Include(c => c.Post)
          .OrderByDescending(c => c.CreatedAt)
          .Select(c => new
          {
              id = c.Id,
              content = c.Content,
              createdAt = c.CreatedAt,
              authorId = c.AuthorId,
              authorName = c.Author.Name,
              authorAvatar = c.Author.Avatar ?? "",
              postId = c.PostId,
              postTitle = c.Post.Title
          })
          .ToListAsync();

                return Ok(new { comments });

            }

            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("admin/{id}")]
        [Authorize]
        public async Task<IActionResult> AdminDeleteComment(int id)
        {
            try
            {
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                if (userRole != "admin")
                {
                    return Forbid();
                }

                var comment = await _blogDb.Comments.FindAsync(id);
                if (comment == null)
                    return NotFound(new { message = "Comment not found" });

                _blogDb.Comments.Remove(comment);

                var post = await _blogDb.Posts.FindAsync(comment.PostId);
                if (post != null)
                    post.CommentsCount = Math.Max(0, post.CommentsCount - 1);

                await _blogDb.SaveChangesAsync();
                return Ok(new { message = "Comment deleted by admin" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
   
    }
}
