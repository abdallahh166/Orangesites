using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using OrangeSiteInspector.API.Controllers;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;
using OrangeSiteInspector.Domain.Enums;
using System.Security.Claims;

namespace OrangeSiteInspector.API.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthService> _mockAuthService;
        private readonly Mock<ILogger<AuthController>> _mockLogger;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _mockAuthService = new Mock<IAuthService>();
            _mockLogger = new Mock<ILogger<AuthController>>();
            _controller = new AuthController(_mockAuthService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Register_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var createUserDto = new CreateUserDto
            {
                UserName = "testuser",
                FullName = "Test User",
                Email = "test@example.com",
                Password = "TestPassword123!",
                Role = UserRole.Engineer
            };

            var expectedResponse = ApiResponseDto<LoginResponseDto>.SuccessResult(
                new LoginResponseDto
                {
                    Token = "test-token",
                    RefreshToken = "test-refresh-token",
                    User = new UserDto { Id = "1", UserName = "testuser", Email = "test@example.com" },
                    ExpiresAt = DateTime.UtcNow.AddHours(1),
                    RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
                },
                "User registered successfully"
            );

            _mockAuthService.Setup(x => x.RegisterAsync(It.IsAny<CreateUserDto>()))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.Register(createUserDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseDto<LoginResponseDto>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal("User registered successfully", response.Message);
        }

        [Fact]
        public async Task Register_WithInvalidData_ReturnsBadRequest()
        {
            // Arrange
            var createUserDto = new CreateUserDto
            {
                UserName = "",
                FullName = "",
                Email = "invalid-email",
                Password = "weak",
                Role = UserRole.Engineer
            };

            var expectedResponse = ApiResponseDto<LoginResponseDto>.ErrorResult(
                "Registration failed",
                new List<string> { "Email already exists" }
            );

            _mockAuthService.Setup(x => x.RegisterAsync(It.IsAny<CreateUserDto>()))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.Register(createUserDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseDto<LoginResponseDto>>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Registration failed", response.Message);
        }

        [Fact]
        public async Task Login_WithValidCredentials_ReturnsOkResult()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "TestPassword123!"
            };

            var expectedResponse = ApiResponseDto<LoginResponseDto>.SuccessResult(
                new LoginResponseDto
                {
                    Token = "test-token",
                    RefreshToken = "test-refresh-token",
                    User = new UserDto { Id = "1", UserName = "testuser", Email = "test@example.com" },
                    ExpiresAt = DateTime.UtcNow.AddHours(1),
                    RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
                },
                "Login successful"
            );

            _mockAuthService.Setup(x => x.LoginAsync(It.IsAny<LoginDto>()))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseDto<LoginResponseDto>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal("Login successful", response.Message);
        }

        [Fact]
        public async Task Login_WithInvalidCredentials_ReturnsBadRequest()
        {
            // Arrange
            var loginDto = new LoginDto
            {
                Email = "test@example.com",
                Password = "wrongpassword"
            };

            var expectedResponse = ApiResponseDto<LoginResponseDto>.ErrorResult("Invalid email or password");

            _mockAuthService.Setup(x => x.LoginAsync(It.IsAny<LoginDto>()))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.Login(loginDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseDto<LoginResponseDto>>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Invalid email or password", response.Message);
        }

        [Fact]
        public async Task RefreshToken_WithValidToken_ReturnsOkResult()
        {
            // Arrange
            var refreshTokenDto = new RefreshTokenDto
            {
                RefreshToken = "valid-refresh-token"
            };

            var expectedResponse = ApiResponseDto<RefreshTokenResponseDto>.SuccessResult(
                new RefreshTokenResponseDto
                {
                    Token = "new-access-token",
                    RefreshToken = "new-refresh-token",
                    ExpiresAt = DateTime.UtcNow.AddHours(1),
                    RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
                },
                "Token refreshed successfully"
            );

            _mockAuthService.Setup(x => x.RefreshTokenAsync(It.IsAny<RefreshTokenDto>()))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.RefreshToken(refreshTokenDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseDto<RefreshTokenResponseDto>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal("Token refreshed successfully", response.Message);
        }

        [Fact]
        public async Task RefreshToken_WithInvalidToken_ReturnsBadRequest()
        {
            // Arrange
            var refreshTokenDto = new RefreshTokenDto
            {
                RefreshToken = "invalid-refresh-token"
            };

            var expectedResponse = ApiResponseDto<RefreshTokenResponseDto>.ErrorResult("Invalid refresh token");

            _mockAuthService.Setup(x => x.RefreshTokenAsync(It.IsAny<RefreshTokenDto>()))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.RefreshToken(refreshTokenDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseDto<RefreshTokenResponseDto>>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Invalid refresh token", response.Message);
        }

        [Fact]
        public async Task ChangePassword_WithValidData_ReturnsOkResult()
        {
            // Arrange
            var changePasswordDto = new ChangePasswordDto
            {
                CurrentPassword = "OldPassword123!",
                NewPassword = "NewPassword123!",
                ConfirmPassword = "NewPassword123!"
            };

            var expectedResponse = ApiResponseDto.SuccessResult("Password changed successfully");

            _mockAuthService.Setup(x => x.ChangePasswordAsync(It.IsAny<string>(), It.IsAny<ChangePasswordDto>()))
                .ReturnsAsync(expectedResponse);

            // Mock the GetCurrentUserId method
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id")
            };
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(claims))
                }
            };

            // Act
            var result = await _controller.ChangePassword(changePasswordDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseDto>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal("Password changed successfully", response.Message);
        }

        [Fact]
        public async Task Logout_WithValidToken_ReturnsOkResult()
        {
            // Arrange
            var logoutRequest = new AuthController.LogoutRequest
            {
                RefreshToken = "valid-refresh-token"
            };

            var expectedResponse = ApiResponseDto.SuccessResult("Logged out successfully");

            _mockAuthService.Setup(x => x.LogoutAsync(It.IsAny<string>()))
                .ReturnsAsync(expectedResponse);

            // Mock the GetCurrentUserId method
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id")
            };
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(claims))
                }
            };

            // Act
            var result = await _controller.Logout(logoutRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseDto>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal("Logged out successfully", response.Message);
        }

        [Fact]
        public async Task ForgotPassword_WithValidEmail_ReturnsOkResult()
        {
            // Arrange
            var email = "test@example.com";
            var expectedResponse = ApiResponseDto.SuccessResult("If the email exists, password reset instructions have been sent");

            _mockAuthService.Setup(x => x.ForgotPasswordAsync(It.IsAny<string>()))
                .ReturnsAsync(expectedResponse);

            // Act
            var result = await _controller.ForgotPassword(email);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseDto>(okResult.Value);
            Assert.True(response.Success);
        }

        [Fact]
        public async Task ForgotPassword_WithEmptyEmail_ReturnsBadRequest()
        {
            // Arrange
            var email = "";

            // Act
            var result = await _controller.ForgotPassword(email);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var response = Assert.IsType<ApiResponseDto>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Equal("Email is required", response.Message);
        }
    }
} 