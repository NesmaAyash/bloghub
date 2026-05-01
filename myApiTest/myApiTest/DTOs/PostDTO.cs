namespace myApiTest.DTOs
{
    public class PostDTO
    {
        public string Id { get; set; } = string.Empty; // string عشان React يتوقع string
        public string Title { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CoverImage { get; set; } 
        public string AuthorId { get; set; } = string.Empty; // string عشان React يتوقع string
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