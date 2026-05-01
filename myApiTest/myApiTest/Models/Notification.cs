using System.ComponentModel.DataAnnotations;

namespace myApiTest.Models
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public int UserId { get; set; }
        public Author author { get; set; }
        public int? PostId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
