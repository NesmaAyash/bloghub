using System.ComponentModel.DataAnnotations;

namespace myApiTest.Models
{
    public class Post
    {
        [Key]
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CoverImage { get; set; }
        public string Category { get; set; } = "General";
        public string Tags { get; set; } = "[]"; // هنخزنها كـ JSON string
        public int Views { get; set; } = 0;
        public int Likes { get; set; } = 0;
        public int CommentsCount { get; set; } = 0;
        public string Status { get; set; } = "published";
        public bool Featured { get; set; } = false;
        public int AuthorId { get; set; }
        public Author author { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PublishedAt { get; set; } 

        public List<Comment> Comments { get; set; } = new();

        public int? CategoryId { get; set; }     
        public Category? category { get; set; }

    }
}
