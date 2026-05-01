using myApiTest.Models;

namespace myApiTest.DTOs
{
    public class AuthorDto
    {
        public string FullName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public int age { get; set; }
        public List<Post> posts { get; set; }
    }
}
