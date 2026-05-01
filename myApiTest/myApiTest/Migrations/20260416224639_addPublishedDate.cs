using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace myApiTest.Migrations
{
    /// <inheritdoc />
    public partial class addPublishedDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PublishedAt",
                table: "Posts",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublishedAt",
                table: "Posts");
        }
    }
}
