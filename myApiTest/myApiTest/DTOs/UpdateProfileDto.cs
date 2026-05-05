namespace myApiTest.DTOs
{
    public class UpdateProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Email { get; set; }   

        public string? Bio { get; set; }
    }
}
