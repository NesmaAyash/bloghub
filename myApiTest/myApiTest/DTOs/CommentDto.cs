using System.ComponentModel.DataAnnotations;

namespace myApiTest.DTOs
{
    public class CommentDto
    {
        public int Id { get; set; }
        [Required]
        public string Content { get; set; } = string.Empty;
        [Required]
        public int PostId { get; set; }
        public int AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorAvatar { get; set; } = string.Empty;
       // public string CreatedAt { get; set; }
    }
}
