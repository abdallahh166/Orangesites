using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrangeSiteInspector.Application.DTOs;
using OrangeSiteInspector.Application.Interfaces;

namespace OrangeSiteInspector.API.Controllers
{
    /// <summary>
    /// Controller for managing Orama groups and items (equipment/inventory).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class OramaController : BaseApiController
    {
        private readonly IOramaService _oramaService;

        /// <summary>
        /// Constructor for OramaController.
        /// </summary>
        public OramaController(IOramaService oramaService)
        {
            _oramaService = oramaService;
        }

        /// <summary>
        /// Gets all Orama groups.
        /// </summary>
        /// <returns>List of Orama groups.</returns>
        [HttpGet("groups")]
        [ProducesResponseType(typeof(ApiResponseDto<List<OramaGroupDto>>), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<ApiResponseDto<List<OramaGroupDto>>>> GetAllGroups()
        {
            var result = await _oramaService.GetAllGroupsAsync();
            return Ok(result);
        }

        /// <summary>
        /// Gets a specific Orama group by ID.
        /// </summary>
        /// <param name="id">Group ID</param>
        /// <returns>Orama group details.</returns>
        [HttpGet("groups/{id}")]
        [ProducesResponseType(typeof(ApiResponseDto<OramaGroupDetailDto>), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<ApiResponseDto<OramaGroupDetailDto>>> GetGroupById(int id)
        {
            var result = await _oramaService.GetGroupByIdAsync(id);
            return Ok(result);
        }

        /// <summary>
        /// Creates a new Orama group.
        /// </summary>
        /// <param name="request">Group creation data</param>
        /// <returns>The created Orama group.</returns>
        [HttpPost("groups")]
        [Authorize(Roles = "Admin,Manager")]
        [ProducesResponseType(typeof(ApiResponseDto<OramaGroupDto>), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<ApiResponseDto<OramaGroupDto>>> CreateGroup([FromBody] CreateOramaGroupDto request)
        {
            var result = await _oramaService.CreateGroupAsync(request.Name);
            return CreatedAtAction(nameof(GetGroupById), new { id = result.Data?.Id }, result);
        }

        /// <summary>
        /// Updates an existing Orama group.
        /// </summary>
        /// <param name="id">Group ID</param>
        /// <param name="request">Group update data</param>
        /// <returns>The updated Orama group.</returns>
        [HttpPut("groups/{id}")]
        [Authorize(Roles = "Admin,Manager")]
        [ProducesResponseType(typeof(ApiResponseDto<OramaGroupDto>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<ApiResponseDto<OramaGroupDto>>> UpdateGroup(int id, [FromBody] UpdateOramaGroupDto request)
        {
            var result = await _oramaService.UpdateGroupAsync(id, request.Name ?? "");
            return Ok(result);
        }

        /// <summary>
        /// Deletes an Orama group by ID.
        /// </summary>
        /// <param name="id">Group ID</param>
        /// <returns>Success or error response.</returns>
        [HttpDelete("groups/{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<ApiResponseDto>> DeleteGroup(int id)
        {
            var result = await _oramaService.DeleteGroupAsync(id);
            return Ok(result);
        }

        /// <summary>
        /// Gets all Orama items.
        /// </summary>
        /// <returns>List of Orama items.</returns>
        [HttpGet("items")]
        [ProducesResponseType(typeof(ApiResponseDto<List<OramaItemDto>>), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<ApiResponseDto<List<OramaItemDto>>>> GetAllItems()
        {
            var result = await _oramaService.GetAllItemsAsync();
            return Ok(result);
        }

        /// <summary>
        /// Gets all Orama items for a specific group.
        /// </summary>
        /// <param name="groupId">Group ID</param>
        /// <returns>List of Orama items in the group.</returns>
        [HttpGet("groups/{groupId}/items")]
        [ProducesResponseType(typeof(ApiResponseDto<List<OramaItemDto>>), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<ApiResponseDto<List<OramaItemDto>>>> GetItemsByGroupId(int groupId)
        {
            var result = await _oramaService.GetItemsByGroupIdAsync(groupId);
            return Ok(result);
        }

        /// <summary>
        /// Gets a specific Orama item by ID.
        /// </summary>
        /// <param name="id">Item ID</param>
        /// <returns>Orama item details.</returns>
        [HttpGet("items/{id}")]
        [ProducesResponseType(typeof(ApiResponseDto<OramaItemDto>), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<ApiResponseDto<OramaItemDto>>> GetItemById(int id)
        {
            var result = await _oramaService.GetItemByIdAsync(id);
            return Ok(result);
        }

        /// <summary>
        /// Creates a new Orama item.
        /// </summary>
        /// <param name="request">Item creation data</param>
        /// <returns>The created Orama item.</returns>
        [HttpPost("items")]
        [Authorize(Roles = "Admin,Manager")]
        [ProducesResponseType(typeof(ApiResponseDto<OramaItemDto>), 201)]
        [ProducesResponseType(400)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<ApiResponseDto<OramaItemDto>>> CreateItem([FromBody] CreateOramaItemRequest request)
        {
            var result = await _oramaService.CreateItemAsync(request.Name, request.GroupId);
            return CreatedAtAction(nameof(GetItemById), new { id = result.Data?.Id }, result);
        }

        /// <summary>
        /// Updates an existing Orama item.
        /// </summary>
        /// <param name="id">Item ID</param>
        /// <param name="request">Item update data</param>
        /// <returns>The updated Orama item.</returns>
        [HttpPut("items/{id}")]
        [Authorize(Roles = "Admin,Manager")]
        [ProducesResponseType(typeof(ApiResponseDto<OramaItemDto>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<ApiResponseDto<OramaItemDto>>> UpdateItem(int id, [FromBody] UpdateOramaItemRequest request)
        {
            var result = await _oramaService.UpdateItemAsync(id, request.Name, request.GroupId);
            return Ok(result);
        }

        /// <summary>
        /// Deletes an Orama item by ID.
        /// </summary>
        /// <param name="id">Item ID</param>
        /// <returns>Success or error response.</returns>
        [HttpDelete("items/{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ApiResponseDto), 200)]
        [ProducesResponseType(404)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<ApiResponseDto>> DeleteItem(int id)
        {
            var result = await _oramaService.DeleteItemAsync(id);
            return Ok(result);
        }
    }
} 