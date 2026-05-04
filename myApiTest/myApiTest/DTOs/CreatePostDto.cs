using System.ComponentModel.DataAnnotations;

namespace myApiTest.DTOs
{
    public class CreatePostDto
    {
        public int Id { get; set; }
        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Excerpt { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public IFormFile? CoverImage { get; set; }
        public string AuthorId { get; set; } = string.Empty; 
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorAvatar { get; set; } = string.Empty;
        public string PublishedAt { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public int Views { get; set; }
        public int Likes { get; set; }
        public int CommentsCount { get; set; }
        public string Status { get; set; } = "published";
        public bool Featured { get; set; }
    }
}
