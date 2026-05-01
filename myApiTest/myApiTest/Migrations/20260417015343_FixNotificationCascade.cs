using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace myApiTest.Migrations
{
    /// <inheritdoc />
    public partial class FixNotificationCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Authors_authorId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_authorId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "authorId",
                table: "Notifications");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Authors_UserId",
                table: "Notifications",
                column: "UserId",
                principalTable: "Authors",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Authors_UserId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications");

            migrationBuilder.AddColumn<int>(
                name: "authorId",
                table: "Notifications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_authorId",
                table: "Notifications",
                column: "authorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Authors_authorId",
                table: "Notifications",
                column: "authorId",
                principalTable: "Authors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
