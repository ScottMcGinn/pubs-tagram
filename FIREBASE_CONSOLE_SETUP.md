# Firebase Console Security Setup Guide

This guide walks you through enabling logging, monitoring, and DDoS protection in Firebase Console for the Pubs-tagram project.

## Prerequisites

- Access to Firebase Console (https://console.firebase.google.com/)
- Owner or Editor role in the Firebase project
- Your Firebase project ID (visible in project settings)

---

## 1. Enable Firebase Authentication Logging

### Step 1: Access Cloud Logging

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **Pubs-tagram** project
3. In the left sidebar, expand **Additional resources** (or go directly to Cloud Console)
4. Click **Cloud Logging** (or navigate to: Cloud Console → Logging)

### Step 2: Create Log Sink for Authentication

1. In Cloud Logging, click **Logs Router** (left sidebar)
2. Click **+ Create Sink**
3. **Sink name:** `auth-logs-sink`
4. **Sink service:** Cloud Logging (keep default)
5. **Sink destination:** 
   - Choose **Cloud Storage** (for archival) or **Pub/Sub** (for real-time processing)
   - Or **BigQuery** (for analysis)
6. **Include children:** Toggle ON
7. **Filter logs:** Copy and paste:
   ```
   resource.type="service_account"
   protoPayload.serviceName="identitytoolkit.googleapis.com"
   OR
   resource.type="firebase.googleapis.com"
   AND severity="ERROR"
   ```
8. Click **Create Sink**

### Step 3: Monitor Authentication Events

1. Back in Cloud Logging, click **Logs Explorer**
2. In the query box, paste:
   ```
   resource.type="service_account"
   protoPayload.serviceName="identitytoolkit.googleapis.com"
   ```
3. Click **Run Query**
4. You'll see authentication events (signups, logins, failed attempts)

**What to monitor:**
- Multiple failed login attempts from same IP
- Suspicious signup patterns
- Unusual locations or devices

---

## 2. Set Up Cloud Logging for Firestore Access

### Step 1: Enable Firestore Audit Logs

1. Go to **Firebase Console** → **Firestore Database**
2. Click the **Settings** tab
3. Scroll to **Audit logs** section
4. Firestore audit logs are **automatically enabled** for:
   - Admin SDK operations
   - Data access requests
   - Rule evaluations (errors)

### Step 2: View Firestore Logs

1. Go to **Cloud Logging** → **Logs Explorer**
2. Paste this query to see Firestore access:
   ```
   resource.type="cloud_firestore"
   severity="ERROR"
   ```
3. Or for all operations:
   ```
   resource.type="cloud_firestore"
   ```

### Step 3: Create Alert for Denied Requests

1. In Cloud Logging, click **Logs-based Metrics** (left sidebar)
2. Click **+ Create Metric**
3. **Name:** `firestore-denied-requests`
4. **Filter:**
   ```
   resource.type="cloud_firestore"
   protoPayload.status.code=7
   ```
5. Click **Create Metric**
6. Go to **Cloud Monitoring** (or **Monitoring** in Firebase)
7. Click **+ Notification Channels**
8. Add your email/Slack channel
9. Click **+ Create Policy**
10. Select metric: `firestore-denied-requests`
11. Set threshold: > 0 requests in 5 minutes
12. Add notification channel
13. Click **Create Policy**

**What this monitors:**
- Permission denied errors (potential attacks or rule issues)
- Failed Firestore operations

---

## 3. Configure DDoS Protection

### Option A: Cloud Armor (Recommended for API endpoints)

1. Go to **Cloud Console** → **VPC Network** → **Cloud Armor**
2. Click **+ Create Policy**
3. **Policy name:** `pubs-tagram-ddos-protection`
4. **Default rule action:** Allow
5. Add rules:
   - **Rule 1:** Block requests from IPs with > 100 requests/minute
   - **Rule 2:** Block requests with invalid/malicious payloads
6. Click **Create**

**Note:** Cloud Armor is for Compute Engine/Load Balancer. Firebase provides automatic DDoS protection.

### Option B: Firebase Automatic DDoS Protection (Always On)

Firebase automatically mitigates DDoS attacks:
- Rate limiting on authentication endpoints
- Query complexity limits on Firestore
- Automatic traffic filtering

**Monitor DDoS attempts:**
1. **Cloud Console** → **Cloud Monitoring**
2. Look for metrics:
   - `firebase.googleapis.com/network/drop_rate`
   - `firebase.googleapis.com/auth/requests_by_status`

---

## 4. Enable Real-Time Alerting

### Create Alerting Policy

1. Go to **Cloud Monitoring** (or Firebase → Monitor)
2. Click **Alerting Policies** (left sidebar)
3. Click **+ Create Policy**

**Policy 1: High Auth Failure Rate**
- Metric: `firebase.googleapis.com/auth/requests_by_status`
- Condition: Error rate > 10% for 5 minutes
- Notification: Your email/Slack

**Policy 2: Firestore Quota Exceeded**
- Metric: `firestore.googleapis.com/request_count`
- Condition: Breaches quota for 2 minutes
- Notification: Your email/Slack

**Policy 3: Suspicious Activity (Manual Check)**
- Metric: `logging.googleapis.com/user_log_entries`
- Filter: Denied access attempts
- Notification: Daily digest

---

## 5. Set Up Cloud Audit Logs

### Enable Data Access Logs

1. Go to **Cloud Console** → **IAM & Admin** → **Audit Logs**
2. For service **Cloud Firestore API:**
   - Check: **Admin Read**
   - Check: **Data Read**
   - Check: **Data Write**
3. For service **Identity and Access Management API:**
   - Check all boxes
4. Click **Save**

This logs:
- Who accessed what data and when
- Changes to permissions/roles
- Admin operations on Firestore

---

## 6. View Logs in Cloud Logging

### Pre-built Queries

**All errors in past 24 hours:**
```
severity="ERROR"
timestamp>="2024-01-01T00:00:00Z"
```

**Firestore permission denials:**
```
resource.type="cloud_firestore"
protoPayload.status.code=7
```

**Auth failures:**
```
protoPayload.serviceName="identitytoolkit.googleapis.com"
protoPayload.status.code!=0
```

**All operations by user:**
```
protoPayload.authenticationInfo.principalEmail="user@example.com"
```

---

## 7. Security Checklist

After setup, verify:

- [x] Cloud Logging enabled
- [ ] Audit logs enabled for Firestore
- [ ] Authentication logs sink created
- [ ] Alert policies created (3+ policies)
- [ ] Notification channels configured (email/Slack)
- [ ] Cloud Audit Logs enabled for data access
- [ ] DDoS monitoring configured
- [ ] Team notified of alert channels

---

## 8. Monthly Security Review

Schedule a monthly review:

1. **Check logs** for suspicious patterns
2. **Review denied requests** - are your rules correct?
3. **Monitor quotas** - are you approaching limits?
4. **Verify alerts** - are they firing appropriately?
5. **Update rules** if new patterns emerge

---

## 9. Emergency Response

If you notice suspicious activity:

1. **Immediate:** Check Cloud Logging for details
2. **Within 1 hour:** Review affected data/users
3. **Within 4 hours:** 
   - Disable affected user accounts (if necessary)
   - Tighten Firestore rules temporarily
   - Review recent rule changes
4. **Within 24 hours:** 
   - Notify affected users
   - File incident report
   - Update security rules

---

## References

- [Cloud Logging Documentation](https://cloud.google.com/logging/docs)
- [Firestore Audit Logs](https://cloud.google.com/firestore/docs/audit-logs)
- [Cloud Monitoring Alerting](https://cloud.google.com/monitoring/alerts)
- [Cloud Armor Documentation](https://cloud.google.com/armor/docs)

