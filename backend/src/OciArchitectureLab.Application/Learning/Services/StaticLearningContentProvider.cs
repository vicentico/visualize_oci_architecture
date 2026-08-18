using OciArchitectureLab.Domain.Learning;

namespace OciArchitectureLab.Application.Learning.Services;

public class StaticLearningContentProvider : ILearningContentProvider
{
    private readonly Dictionary<string, LearningContent> _contentDb;

    public StaticLearningContentProvider()
    {
        _contentDb = new Dictionary<string, LearningContent>(StringComparer.OrdinalIgnoreCase)
        {
            {
                "Virtual Cloud Network",
                new LearningContent
                {
                    ResourceType = "Virtual Cloud Network",
                    Title = "Virtual Cloud Network (VCN)",
                    Description = "A VCN is a customizable, private cloud network in OCI. Just like a traditional data center network, a VCN provides you with complete control over your network environment. This includes assigning your own private IP address space, creating subnets, route tables, and configuring stateful firewalls (Security Lists).",
                    UseCases = new List<string>
                    {
                        "Isolating cloud resources from the public internet.",
                        "Connecting on-premises infrastructure securely to OCI.",
                        "Segmenting application tiers (web, app, db) into subnets."
                    },
                    Quiz = new QuizQuestion
                    {
                        QuestionText = "What is the primary purpose of a VCN in Oracle Cloud Infrastructure?",
                        Options = new List<string>
                        {
                            "To store large amounts of unstructured data.",
                            "To provide an isolated and customizable virtual network.",
                            "To balance traffic across multiple compute instances.",
                            "To run serverless functions."
                        },
                        CorrectOptionIndex = 1,
                        Explanation = "A VCN is a software-defined network that provides isolation and control over your cloud environment's network topology."
                    }
                }
            },
            {
                "Internet Gateway",
                new LearningContent
                {
                    ResourceType = "Internet Gateway",
                    Title = "Internet Gateway (IGW)",
                    Description = "An Internet Gateway is an optional virtual router you can add to your VCN to enable direct connectivity to the internet. Resources that need to be accessed from the internet or need to initiate connections to the internet must be in a public subnet and use the Internet Gateway.",
                    UseCases = new List<string>
                    {
                        "Allowing public access to a web server.",
                        "Enabling instances to download updates from the internet.",
                        "Routing outbound traffic for public-facing Load Balancers."
                    },
                    Quiz = new QuizQuestion
                    {
                        QuestionText = "Which type of subnet is required for a resource to use an Internet Gateway?",
                        Options = new List<string>
                        {
                            "Private Subnet",
                            "Public Subnet",
                            "Local Peering Subnet",
                            "Dynamic Routing Subnet"
                        },
                        CorrectOptionIndex = 1,
                        Explanation = "Only resources in a Public Subnet with a public IP address can utilize an Internet Gateway to communicate with the internet."
                    }
                }
            },
            {
                "Load Balancer",
                new LearningContent
                {
                    ResourceType = "Load Balancer",
                    Title = "OCI Load Balancer",
                    Description = "The OCI Load Balancing service provides automated traffic distribution from one entry point to multiple servers reachable from your VCN. It improves resource utilization, facilitates scaling, and helps ensure high availability.",
                    UseCases = new List<string>
                    {
                        "Distributing HTTP/HTTPS traffic across multiple web servers.",
                        "Providing SSL/TLS termination at the edge.",
                        "Ensuring high availability by routing traffic away from unhealthy backend servers."
                    },
                    Quiz = new QuizQuestion
                    {
                        QuestionText = "What happens if a backend server fails a health check configured on the Load Balancer?",
                        Options = new List<string>
                        {
                            "The Load Balancer terminates all connections.",
                            "The Load Balancer stops sending new traffic to the unhealthy server.",
                            "The Load Balancer automatically reboots the failed server.",
                            "The Load Balancer caches the traffic until the server recovers."
                        },
                        CorrectOptionIndex = 1,
                        Explanation = "A Load Balancer dynamically removes unhealthy servers from its rotation and only sends new traffic to healthy backend servers."
                    }
                }
            },
            {
                "Compute",
                new LearningContent
                {
                    ResourceType = "Compute",
                    Title = "Compute Instance",
                    Description = "OCI Compute provides bare metal and virtual machine (VM) instances, delivering performance, flexibility, and control. Compute instances are the workhorses of the cloud, allowing you to run applications and process data.",
                    UseCases = new List<string>
                    {
                        "Hosting web and application servers.",
                        "Running batch processing or high-performance computing (HPC) workloads.",
                        "Deploying containerized applications (using Docker/Kubernetes)."
                    },
                    Quiz = new QuizQuestion
                    {
                        QuestionText = "Which shapes are typically available for OCI Compute instances?",
                        Options = new List<string>
                        {
                            "Only Virtual Machines",
                            "Only Bare Metal servers",
                            "Virtual Machines and Bare Metal servers",
                            "Only Serverless functions"
                        },
                        CorrectOptionIndex = 2,
                        Explanation = "OCI offers both Virtual Machine (VM) shapes for flexibility and Bare Metal shapes for maximum performance and isolation."
                    }
                }
            },
            {
                "Database",
                new LearningContent
                {
                    ResourceType = "Database",
                    Title = "OCI Database Services",
                    Description = "OCI offers a variety of fully managed database services, including Autonomous Database, Exadata Cloud Service, and Base Database Service (VM/BM). These services provide secure, highly available, and scalable data storage and processing.",
                    UseCases = new List<string>
                    {
                        "Storing relational data for enterprise applications (OLTP).",
                        "Data warehousing and analytics (OLAP).",
                        "Running highly available databases with Oracle Real Application Clusters (RAC)."
                    },
                    Quiz = new QuizQuestion
                    {
                        QuestionText = "For maximum security, in which type of subnet should a Database typically be deployed?",
                        Options = new List<string>
                        {
                            "Public Subnet",
                            "Private Subnet",
                            "Management Subnet",
                            "Gateway Subnet"
                        },
                        CorrectOptionIndex = 1,
                        Explanation = "Databases should almost always be placed in Private Subnets so they are not directly exposed to the public internet, reducing the attack surface."
                    }
                }
            }
        };
    }

    public LearningContent? GetContentForResource(string resourceType)
    {
        if (_contentDb.TryGetValue(resourceType, out var content))
        {
            return content;
        }
        
        return null; // Return null if we don't have learning content for that type yet
    }
}
