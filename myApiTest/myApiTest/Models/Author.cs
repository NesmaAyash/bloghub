using Microsoft.AspNetCore.Identity;


namespace myApiTest.Models
{
    public class Author 
    {
       public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }   
        public string Password { get; set; }
        public string? Bio { get; set; } 
        public string Role { get; set; } = "author";
        public string Status { get; set; } = "active";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? Avatar { get; set; }
        public List<Post>? posts { get; set; }
        public List<Comment> Comments { get; set; } = new();
        public List<Notification> Notifications { get; set; }= new();


    }
}
