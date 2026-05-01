using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using myApiTest.Data;
using myApiTest.DTOs;
using myApiTest.Models;

namespace myApiTest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoryController : ControllerBase
    {
        private readonly BlogDbContext _blogDb;
        public CategoryController(BlogDbContext blogDb) { _blogDb = blogDb; }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var categories = await _blogDb.Categories.Select(
             x => new CategoryDto
             {
                 Id = x.Id,
                 Name = x.Name,
                 Description = x.Description,
                 ArticlesCount = x.Posts.Count
             }
               ).ToListAsync();
                return Ok(new { categories });
            }

            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }

        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CategoryDto data)
        {
            try
            {
                var category = new Category
                {
                    Name = data.Name,
                    Description = data.Description,
                };

                _blogDb.Categories.Add(category);
                await _blogDb.SaveChangesAsync();

                return Ok(new { message = "Category created", category });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var category = await _blogDb.Categories.FindAsync(id);
                if(category == null)
                {
                    return NotFound(new { message = "Category Not Found" });
                }

                _blogDb.Categories.Remove(category);
                await _blogDb.SaveChangesAsync();
                return Ok(new { message = "Category Deleted Successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

    }
}
