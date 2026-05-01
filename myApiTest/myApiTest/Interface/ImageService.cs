using Microsoft.AspNetCore;
using myApiTest.DTOs;
using myApiTest.Models;

namespace myApiTest.Interface
{
    public class ImageService : IImageInterface
    {
        private readonly IWebHostEnvironment _webHost;
        public ImageService(IWebHostEnvironment webHost)
        {
            _webHost = webHost;
        }
        public string Upload(IFormFile Image)
        {
            var uploadFile = Path.Combine(_webHost.WebRootPath, "Images");
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(Image.FileName);
            var filePath = Path.Combine(uploadFile, fileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
               Image.CopyTo(fileStream);
            }
            return fileName;
        }
    }
}
