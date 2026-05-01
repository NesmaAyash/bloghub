using AutoMapper;
using myApiTest.DTOs;
using myApiTest.Models;
using System.Text.Json;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Post, PostDTO>()
       .ForMember(dest => dest.Id,
           opt => opt.MapFrom(src => src.Id.ToString()))
       .ForMember(dest => dest.AuthorId,
           opt => opt.MapFrom(src => src.AuthorId.ToString()))
       .ForMember(dest => dest.AuthorName,
           opt => opt.MapFrom(src => src.author != null ? src.author.Name : ""))
       .ForMember(dest => dest.AuthorAvatar,
           opt => opt.MapFrom(src => src.author != null
               ? (src.author.Avatar ?? "")
               : ""))
       .ForMember(dest => dest.Tags,
           opt => opt.MapFrom(src =>
               !string.IsNullOrEmpty(src.Tags)
                   ? JsonSerializer.Deserialize<List<string>>(src.Tags, (JsonSerializerOptions?)null) ?? new List<string>()
                   : new List<string>()))
       .ForMember(dest => dest.Excerpt,
           opt => opt.MapFrom(src => src.Excerpt ?? ""))
       .ForMember(dest => dest.CoverImage,
           opt => opt.MapFrom(src => src.CoverImage ?? ""))
       .ForMember(dest => dest.Category,
           opt => opt.MapFrom(src => src.Category ?? ""))
       .ForMember(dest => dest.Status,
           opt => opt.MapFrom(src => src.Status ?? "published"))
       .ForMember(dest => dest.Featured,
           opt => opt.MapFrom(src => src.Featured))
       .ForMember(dest => dest.Views,
           opt => opt.MapFrom(src => src.Views))
       .ForMember(dest => dest.Likes,
           opt => opt.MapFrom(src => src.Likes))
       .ForMember(dest => dest.CommentsCount,
           opt => opt.MapFrom(src => src.CommentsCount))
       .ForMember(dest => dest.PublishedAt,  
           opt => opt.MapFrom(src =>
               src.PublishedAt.HasValue
                   ? src.PublishedAt.Value.ToString("yyyy-MM-ddTHH:mm:ssZ")
                   : src.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")));

    }
}