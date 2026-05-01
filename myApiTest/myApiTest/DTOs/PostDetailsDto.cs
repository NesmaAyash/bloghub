using myApiTest.Models;

namespace myApiTest.DTOs
{
    public class PostDetailsDto : PostDTO
    {
        public Author author { get; set; }
    }
}
