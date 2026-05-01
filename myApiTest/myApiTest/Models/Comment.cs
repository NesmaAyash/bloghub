using System.ComponentModel.DataAnnotations;

namespace myApiTest.Models
{
    public class Comment
    {
        [Key]
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int PostId { get; set; }
        public Post Post { get; set; }
        public int AuthorId { get; set; }
        public Author Author { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
