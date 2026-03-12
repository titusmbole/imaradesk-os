# System Requirements

This page outlines the hardware, software, and network requirements for running ImaraDesk.

## Cloud Deployment

For cloud-hosted customers, ImaraDesk handles all infrastructure requirements. You only need:

- **Web Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Internet Connection**: Stable broadband (1 Mbps minimum)
- **Display**: 1280x720 minimum resolution

---

## Self-Hosted Requirements

### Hardware Requirements

#### Minimum (Up to 50 agents, 10,000 tickets/month)

| Component | Specification |
|-----------|--------------|
| CPU | 2 cores @ 2.0 GHz |
| RAM | 4 GB |
| Storage | 20 GB SSD |
| Network | 100 Mbps |

#### Recommended (Up to 200 agents, 50,000 tickets/month)

| Component | Specification |
|-----------|--------------|
| CPU | 4 cores @ 2.5 GHz |
| RAM | 8 GB |
| Storage | 50 GB SSD |
| Network | 1 Gbps |

#### Enterprise (200+ agents, 100,000+ tickets/month)

| Component | Specification |
|-----------|--------------|
| CPU | 8+ cores @ 3.0 GHz |
| RAM | 16+ GB |
| Storage | 100+ GB NVMe SSD |
| Network | 1+ Gbps |
| Database | Dedicated PostgreSQL server |
| Cache | Redis cluster |

### Software Requirements

#### Operating System

- **Ubuntu** 20.04 LTS or later (Recommended)
- **Debian** 11 or later
- **CentOS/RHEL** 8 or later
- **macOS** 12+ (Development only)
- **Windows Server** 2019+ (With WSL2)

#### Runtime Environment

| Software | Version | Notes |
|----------|---------|-------|
| Python | 3.10+ | 3.12 recommended |
| Node.js | 18+ | For frontend builds |
| PostgreSQL | 13+ | 15+ recommended |
| Redis | 6+ | Optional, for caching |
| Nginx | 1.18+ | Reverse proxy |

#### Python Dependencies

ImaraDesk requires the following Python packages:
- Django 4.2+
- Gunicorn
- Psycopg2 (PostgreSQL adapter)
- Celery (Background tasks)
- Redis (Task queue backend)

---

## Network Requirements

### Ports

| Port | Service | Required |
|------|---------|----------|
| 80 | HTTP | Yes |
| 443 | HTTPS | Yes |
| 5432 | PostgreSQL | Yes |
| 6379 | Redis | Optional |
| 25/587 | SMTP | For email |
| 993 | IMAP | For email ingestion |

### Firewall Rules

```bash
# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow PostgreSQL (internal only)
ufw allow from 10.0.0.0/8 to any port 5432

# Allow Redis (internal only)
ufw allow from 10.0.0.0/8 to any port 6379
```

### DNS Requirements

- Valid domain name pointing to your server
- SSL certificate (Let's Encrypt supported)
- SPF/DKIM/DMARC records for email

---

## Browser Support

| Browser | Minimum Version | Recommended |
|---------|-----------------|-------------|
| Chrome | 90 | Latest |
| Firefox | 88 | Latest |
| Safari | 14 | Latest |
| Edge | 90 | Latest |

> ⚠️ **Note**: Internet Explorer is not supported.

---

## Storage Considerations

### Database Size Estimates

| Tickets/Month | 1 Year Storage | 3 Year Storage |
|---------------|----------------|----------------|
| 1,000 | ~500 MB | ~1.5 GB |
| 10,000 | ~5 GB | ~15 GB |
| 50,000 | ~25 GB | ~75 GB |
| 100,000 | ~50 GB | ~150 GB |

### Attachment Storage

Plan for additional storage if you allow file attachments:
- Average attachment: 2-5 MB
- Recommended: 3x database storage for attachments

---

## Performance Optimization

### Recommended Stack for High Performance

```
┌─────────────────────────────────────────┐
│           Load Balancer (Nginx)          │
├─────────────────────────────────────────┤
│     App Server 1    │    App Server 2    │
│    (Gunicorn x4)    │   (Gunicorn x4)    │
├─────────────────────────────────────────┤
│            PostgreSQL Primary            │
│              (with Replica)              │
├─────────────────────────────────────────┤
│            Redis Cluster                 │
│      (Sessions + Task Queue)             │
└─────────────────────────────────────────┘
```

### Database Tuning

Recommended PostgreSQL settings for production:

```conf
# postgresql.conf
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 64MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 16MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
```

---

**Next:** [Installation Guide](/docs/getting-started/installation) | [Quick Start](/docs/getting-started/quick-start)
