namespace OrangeSiteInspector.Domain.Enums
{
    public enum VisitStatus
    {
        Pending = 1,
        InProgress = 2,
        Completed = 3,
        Accepted = 4,
        Rejected = 5,
        Cancelled = 6
    }

    public enum VisitPriority
    {
        Low = 1,
        Normal = 2,
        High = 3,
        Critical = 4
    }

    public enum VisitType
    {
        Routine = 1,
        Maintenance = 2,
        Emergency = 3,
        Compliance = 4,
        Quality = 5
    }
} 