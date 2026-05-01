namespace myApiTest.DTOs
{
    public class ChangePasswordDto
    {
        public string currentPassword {  get; set; }
        public string newPassword { get; set; } 
        public string confirmPassword { get; set; }
    }
}
