namespace OrangeSiteInspector.Application.DTOs
{
    public class PagedResultDto<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }

    public class ApiResponseDto<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new List<string>();

        public static ApiResponseDto<T> SuccessResult(T data, string message = "Operation completed successfully")
        {
            return new ApiResponseDto<T>
            {
                Success = true,
                Message = message,
                Data = data
            };
        }

        public static ApiResponseDto<T> ErrorResult(string message, List<string>? errors = null)
        {
            return new ApiResponseDto<T>
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }
    }

    public class ApiResponseDto : ApiResponseDto<object>
    {
        public static ApiResponseDto SuccessResult(string message = "Operation completed successfully")
        {
            return new ApiResponseDto
            {
                Success = true,
                Message = message
            };
        }

        public static new ApiResponseDto ErrorResult(string message, List<string>? errors = null)
        {
            return new ApiResponseDto
            {
                Success = false,
                Message = message,
                Errors = errors ?? new List<string>()
            };
        }
    }
} 