# 📋 Service Level Agreement (SLA) Policy

**Effective Date:** 2026-04-20  
**Last Updated:** 2026-04-17  
**Owner:** @pm (Morgan)

---

## 🎯 Objective

This SLA defines the support commitment Synkra makes to customers, including response times, availability targets, and service credits for breaches.

---

## 📊 Service Availability Target

| Commitment | Target | Details |
|------------|--------|---------|
| **Monthly Uptime** | 99.9% | ≤ 43 minutes downtime/month |
| **Availability SLA** | 99.95% | ≤ 21 minutes downtime/month (premium) |
| **Response Time (P1)** | 1 hour | Critical issues |
| **Response Time (P2)** | 4 hours | High-priority issues |
| **Response Time (P3)** | 8 hours | Medium-priority issues |
| **Response Time (P4)** | 24 hours | Low-priority issues |

---

## 📞 Support Channels

### Email Support
- **Address:** support@synkra.com
- **Hours:** 24/7 (critical issues), Business hours (others)
- **Expected Response:** See response times above

### Chat/Slack
- **Channel:** For enterprise customers
- **Hours:** 24/7 critical, Business hours others
- **Expected Response:** < 15 min (critical)

### Status Page
- **URL:** status.synkra.com
- **Updates:** Every 30 min during incidents

---

## 🔢 Issue Priority Definitions

### P1 — Critical
- **Downtime:** Service completely unavailable
- **User Impact:** > 100 users or core feature broken
- **Revenue Impact:** Yes
- **Response Time:** 1 hour
- **Example:** API returns 500 errors for all requests

### P2 — High
- **Downtime:** Service degraded, partial functionality lost
- **User Impact:** 10-100 users
- **Revenue Impact:** Possible
- **Response Time:** 4 hours
- **Example:** Search feature broken, specific user type can't login

### P3 — Medium
- **Downtime:** Non-critical feature broken
- **User Impact:** < 10 users
- **Revenue Impact:** No
- **Response Time:** 8 hours
- **Example:** Dashboard slow, one page has UI issues

### P4 — Low
- **Downtime:** Cosmetic issues, no functional impact
- **User Impact:** < 5 users
- **Revenue Impact:** No
- **Response Time:** 24 hours
- **Example:** Typo, minor UI misalignment

---

## 💰 Service Credits

If Synkra fails to meet uptime or response time commitments, customers are eligible for service credits:

### Uptime Credits

| Availability | Monthly Credit |
|--------------|-----------------|
| < 99.9% (standard) | 5% of monthly fee |
| < 99.5% | 10% of monthly fee |
| < 99.0% | 25% of monthly fee |
| < 95.0% | 100% of monthly fee (free month) |

### Response Time Credits (if SLA missed)

| P-Level | Missed Response Time | Credit |
|---------|---------------------|--------|
| P1 | > 2 hours | 10% monthly fee |
| P2 | > 8 hours | 5% monthly fee |
| P3 | > 16 hours | 2% monthly fee |

**Note:** Maximum monthly credits capped at 100% of monthly subscription fee.

---

## 📋 How to Request Service Credits

1. **Document the incident**
   - Date/time of issue
   - Impact description
   - Screenshots if applicable
   - Sentry links or error details

2. **Submit request to support@synkra.com**
   ```
   Subject: SLA Credit Request — [Date]
   
   Service Level: P1 | P2 | P3
   Issue: [description]
   Response Time: [actual vs SLA target]
   Attached: [evidence]
   ```

3. **Synkra will review** within 2 business days
   - Verify the incident in our logs
   - Calculate credit amount
   - Apply credit to next invoice or account

---

## 🔄 Support Scope

### Included in SLA

- Application availability and performance
- Database connectivity and performance
- API response times
- Data backup and recovery
- Account management (password resets, permissions)
- General usage questions

### NOT Included in SLA

- Third-party service issues (Stripe, Auth0, AWS, etc.)
- Issues caused by customer misconfiguration
- Issues caused by customer's network
- Feature requests or enhancement work
- Training or consulting services
- Issues during maintenance windows

---

## 🛠️ Scheduled Maintenance

Synkra may perform scheduled maintenance to ensure service quality:

| Frequency | Window | Duration | Notice |
|-----------|--------|----------|--------|
| Monthly | Sunday 2-4am UTC | ≤ 2 hours | 7 days advance |
| Emergency | As needed | Variable | ASAP |

**Note:** Scheduled maintenance does NOT count toward uptime SLA.

---

## 📞 Escalation Process

If your issue is not resolved:

1. **Reply to support ticket** with escalation request
2. **Engineering escalation** (within 4 hours for P1)
3. **Manager review** (within 24 hours for P2)
4. **Director decision** (within 48 hours for P3+)

---

## 📋 Support Documentation

Customers have access to:
- FAQ: help.synkra.com/faq
- Documentation: docs.synkra.com
- Status: status.synkra.com
- Contact: support@synkra.com

---

## 🔐 Confidentiality

All support communications are confidential. Synkra staff will:
- Never share customer data publicly
- Use encrypted channels for sensitive information
- Comply with applicable data protection laws (GDPR, etc.)

---

## ✅ Compliance & Audits

This SLA is audited:
- **Quarterly** by @pm (Morgan)
- **Annually** for compliance
- Results published to stakeholders

---

## 📝 SLA Review & Updates

This SLA is reviewed:
- **Quarterly** for relevance
- **After major incidents** to strengthen commitments
- **Changes effective after 30 days notice** to customers

---

## 📚 Related Documents

- **INCIDENT-RESPONSE.md** — How we respond to incidents
- **MONITORING-SETUP.md** — How we monitor to detect issues early
- **DEPLOYMENT-GUIDE.md** — How updates are deployed

---

**Effective Date:** 2026-04-20  
**Last Updated:** 2026-04-17 by @dev  
**Next Review:** 2026-07-17 (quarterly)
