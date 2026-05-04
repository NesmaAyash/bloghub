using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using myApiTest.Data;
using myApiTest.DTOs;
using myApiTest.Interface;
using myApiTest.Models;
using System.Security.Claims;

namespace myApiTest.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PostController : ControllerBase
    {
        private readonly BlogDbContext _blogDb;
        private readonly IMapper _map;
        private readonly IImageInterface _image;
        public PostController(BlogDbContext blogDb , IMapper map , IImageInterface image)
        {
            _blogDb = blogDb;
            _map = map;
            _image = image;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllPosts()
        {
            try
            {
                var postsList = _map.Map<List<PostDTO>>(
                    _blogDb.Posts.Include(x => x.author).ToList());

                return Ok(new { message = "list of posts :", posts = postsList });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message }); // ← مؤقتاً عشان نشوف الخطأ
            }
        }

        [HttpPost]
       public async Task<IActionResult> CreatePost([FromForm]CreatePostDto post) 
        {
            if (ModelState.IsValid)
            {
                var authorId = int.Parse(post.AuthorId);
              //  var imageName =await _image.Upload(post.CoverImage);
                var authorExist = _blogDb.Authors.Where(x => x.Id == authorId).Any();
                string coverImage = "";
                if (post.CoverImage != null)
                {
                    var fileName = _image.Upload(post.CoverImage);
                    coverImage = $"{Request.Scheme}://{Request.Host}/Images/{fileName}";
                }
                if (authorExist) 
                    {
                        var newPost = new Post
                        {
                            Title = post.Title,
                            Content = post.Content,
                            AuthorId = authorId,
                            Excerpt = !string.IsNullOrWhiteSpace(post.Excerpt)
                            ? post.Excerpt
                           : GenerateExcerpt(post.Content ?? ""),
                            CoverImage = coverImage,
                            Category = post.Category,
                            Tags = System.Text.Json.JsonSerializer.Serialize(post.Tags),
                            Status = post.Status,
                            Featured = post.Featured,
                            PublishedAt = post.Status == "published" ? DateTime.UtcNow : null,

                        };

                        _blogDb.Posts.Add(newPost);
                        await _blogDb.SaveChangesAsync();
                        return Ok(new { message = "Poste Added Successfully" });
                    }

                else
                {
                    return BadRequest( new{ message = "Unvalid Author"});
                }
            }   

            else
            {
                return BadRequest(new
                {
                    message = "something went wrong"
                });
            }
        }

        // 🆕 Helper method (ضيفها في نفس الـ Controller)
        private string GenerateExcerpt(string content, int maxLength = 150)
        {
            if (string.IsNullOrWhiteSpace(content))
                return string.Empty;

            var plainText = System.Text.RegularExpressions.Regex.Replace(content, "<.*?>", string.Empty);

            if (plainText.Length <= maxLength)
                return plainText.Trim();

            var trimmed = plainText.Substring(0, maxLength);
            var lastSpace = trimmed.LastIndexOf(' ');

            if (lastSpace > 0)
                trimmed = trimmed.Substring(0, lastSpace);

            return trimmed.Trim() + "...";
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPostById(int id)
        {
            if (ModelState.IsValid)
            {
                var post = _blogDb.Posts.Include(p => p.author).FirstOrDefault(d => d.Id == id);

                if (post == null)
                {
                    return NotFound("Article Not Exist");

                }
                post.Views += 1;
                await _blogDb.SaveChangesAsync();

                var postDto = _map.Map<PostDTO>(post);
                return Ok(new { message = "Post Data", post = postDto });

            }

            else
            {
                return BadRequest(
                        new
                        {
                            message = "Unvalid Author"
                        }
                       );
            }
           
            
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePost(int id ,[FromForm] CreatePostDto post)
        {
            if (ModelState.IsValid)
            {

                var postExist = _blogDb.Posts.Where(x => x.Id == id).FirstOrDefault();
                //var imageName =  _image.Upload(post.CoverImage);

                if (postExist == null)
                {
                    return NotFound("Post not Exists");
                }
                var authorId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (postExist.AuthorId != authorId)
                {
                    return Forbid();
                }

                string coverImage = postExist.CoverImage; 
                if (post.CoverImage != null)
                {
                    var fileName = _image.Upload(post.CoverImage);
                    coverImage = $"{Request.Scheme}://{Request.Host}/Images/{fileName}";
                }

                postExist.Title = post.Title;
                postExist.Content = post.Content;
                postExist.Excerpt = post.Excerpt;
                postExist.CoverImage = coverImage;
                postExist.Category = post.Category;
                postExist.Tags = System.Text.Json.JsonSerializer.Serialize(post.Tags);
                postExist.Status = post.Status;
                postExist.Featured = post.Featured;
                if (post.Status == "published" && postExist.PublishedAt == null)
                    postExist.PublishedAt = DateTime.UtcNow;
                _blogDb.SaveChanges();
                return Ok(new { message = "Post Updated Successfully" });

            }

            else
            {
                return BadRequest(
                       new
                       {
                           message = "Unvalid Author"
                       }
                      );
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(int id) 
        {
            try
            {
                var post = await _blogDb.Posts.FindAsync(id);
                if (post == null)
                {
                    return NotFound();
                }
                _blogDb.Posts.Remove(post);
                await _blogDb.SaveChangesAsync();
                return Ok(new
                {
                    message = "Post Deleted Successfully"
                });
            }
            catch (Exception ex) 
            {
                return BadRequest(
                        new
                        {
                            message = "Unvalid Author"
                        }
                       );
            }
           
        }

        [HttpGet]
        [Route("Search/{searchTextArticle}")]
        [AllowAnonymous]
        public IActionResult SearchArticle(string searchTextArticle)
        {
            try
            {
                var article =_map.Map<List<PostDTO>>( _blogDb.Posts.Include(x => x.author).Where(y => y.Title.Contains(searchTextArticle)).ToList());
                if (article.Count == 0)
                {
                    return BadRequest(new
                    {
                        message = "No Articles Exist"
                    });
                }

                return Ok(new
                {
                    message = "Search Result :",
                    articles = article
                });
            }
            catch(Exception ex){
                return BadRequest(new
                {
                    message ="Something Went Wrong"
                });
            }
        }
        /*  [HttpGet]
          [Route("SearchAuthor/{searchTextAuthor}")]
          public IActionResult SearchAuthor(string searchTextAuthor)
          {
              try
              {
                  var authors = _blogDb.Authors.Include( x => x.posts)
                      .Where(y => y.FirstName.Contains(searchTextAuthor)).ToList();
                  var Result = authors.Select(a=> new
                  {
                      a.FirstName,
                       a.LastName,
                       Posts = a.posts.Select(x => new
                       {
                           x.Title,

                       })

                  }).ToList();
                  if (authors.Count == 0)
                  {
                      return BadRequest(new
                      {
                          message = "No Authors Exist"
                      });
                  }

                  return Ok(new
                  {
                      message = "Search Result :",
                      author = Result
                  });
              }
              catch (Exception ex)
              {
                  return BadRequest(new
                  {
                      message = "Something Went Wrong"
                  });
              }
          }*/

        [HttpGet]
        [Route("SearchAuthor/{searchTextAuthor}")]
        [AllowAnonymous]
        public IActionResult SearchAuthor(string searchTextAuthor)
        {
            try
            {
                // 1. جلب البيانات من قاعدة البيانات (تأكد من كتابة Posts بشكل صحيح كما في الـ Model)
                var authorsData = _blogDb.Authors
                    .Include(x => x.posts)
                    .Where(y => y.Name.Contains(searchTextAuthor))
                    .ToList();

                // 2. تحويل البيانات إلى DTO (الـ DTO هو من سيتحكم بإخفاء الـ Id)
                var authorsDto = _map.Map<List<AuthorDto>>(authorsData);

                if (authorsDto.Count == 0)
                {
                    return BadRequest(new { message = "No Authors Exist" });
                }

                return Ok(new { message = "Search Result :", author = authorsDto });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("{id}/like")]
        public async Task<IActionResult> LikePost(int id)
        {
            try
            {
                var likerId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

                var post = await _blogDb.Posts.FindAsync(id);
                if(post == null)
                {
                    return NotFound();
                }

                post.Likes += 1;
                await _blogDb.SaveChangesAsync();

                if (post.AuthorId != likerId)
                {
                    var liker = await _blogDb.Authors.Where(x => x.Id == likerId)
                        .Select(x => x.Name)
                        .FirstOrDefaultAsync() ?? "Someone";
                    var notification = new Notification
                    {
                        Type = "like",
                        Title = "New Like",
                        Message = $"{liker} Liked your article",
                        UserId = post.AuthorId,
                        PostId = post.Id,
                    };
                    _blogDb.Notifications.Add(notification);

                    await _blogDb.SaveChangesAsync();
                }
                
                return Ok(new { likes = post.Likes });
            }

            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/unlike")]
        public async Task<IActionResult> UnlikePost(int id) 
        {
            try
            {
                var post = await _blogDb.Posts.FindAsync(id);
                if (post == null)
                {
                    return NotFound();
                }

                post.Likes = Math.Max(0, post.Likes - 1);
                await _blogDb.SaveChangesAsync();
                return Ok(new { likes = post.Likes });

            }

            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
