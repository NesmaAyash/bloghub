using System.ComponentModel.DataAnnotations;

namespace myApiTest.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<Post> Posts { get; set; } = new();
    }
}
