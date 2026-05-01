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
                var comments = await _blogDb.Comments.Include(x => x.Author).Where(x => x.Id == postId)
                    .OrderByDescending(x => x.CreatedAt).Select(x => new CommentDto
                    {
                        Id = x.Id,
                        Content = x.Content,
                        PostId = x.PostId,
                        AuthorId = x.AuthorId,
                        AuthorName = x.Author.Name,
                        AuthorAvatar = x.Author.Avatar ?? "",                        //CreatedAt = x.CreatedAt.ToString("o")
                    }).ToListAsync();
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateComment([FromBody]CommentDto comment) 
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);

                }
                var authorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                var postExists =await _blogDb.Posts.AnyAsync(x => x.Id == comment.PostId);
                var post = await _blogDb.Posts.FindAsync(comment.PostId);
                if(post != null && post.AuthorId != authorId)
                {
                    var commenter = await _blogDb.Authors.FindAsync(authorId);
                    var notification = new Notification 
                    {
                        Type = "comment",
                        Title = "New Comment",
                        Message = $"{commenter?.Name} commented on your article",
                        UserId = post.AuthorId,
                        PostId = post.Id,
                    };

                    _blogDb.Notifications.Add(notification);
                    await _blogDb.SaveChangesAsync();
                }
                
                if (postExists == null)
                    {
                        return NotFound(new { message = "Post not found" });
                    }

                    var newComment = new Comment
                    {
                        Content = comment.Content,
                        PostId = comment.PostId,
                        AuthorId = authorId,
                    };

                    _blogDb.Comments.Add(newComment);
                   await _blogDb.SaveChangesAsync();
                var articlepost = await _blogDb.Posts.FindAsync(comment.PostId);
                if (articlepost != null)
                {
                    articlepost.CommentsCount += 1;
                    await _blogDb.SaveChangesAsync();
                }

                var author = await _blogDb.Authors
                             .Where(a => a.Id == authorId)
                             .Select(a => new { a.Name, a.Avatar })
                             .FirstOrDefaultAsync();

                var authorName = author?.Name ?? "";
                var authorAvatar = author?.Avatar ?? "";

                //  var author = await _blogDb.Authors.FindAsync(authorId);
                return Ok(new
                    {
                        comment = new CommentDto
                        {
                            Id = comment.Id,
                            Content = comment.Content,
                            PostId = comment.PostId,
                            AuthorId = comment.AuthorId,
                            AuthorName = authorName,
                            AuthorAvatar = authorAvatar,
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
   
    }
}
