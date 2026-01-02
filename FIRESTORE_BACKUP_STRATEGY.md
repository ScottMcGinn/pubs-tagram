# Firestore Backup Strategy

## Overview

This document outlines the backup and disaster recovery strategy for Pubs-tagram's Firestore database.

**Backup Objectives:**
- **RPO (Recovery Point Objective):** 24 hours (daily backups)
- **RTO (Recovery Time Objective):** 4 hours (max time to restore)
- **Retention:** 30 days of backups
- **Cost:** ~$0.15/GB backed up (minimal for app size)

---

## Backup Methods

### Method 1: Google Cloud Firestore Automated Backups (RECOMMENDED)

**Status:** Available in Firebase Console (requires Blaze plan)

**Steps:**

1. Go to **Firebase Console** → **Firestore Database** → **Backups**

2. Click **+ Create Schedule**

3. Configure:
   - **Schedule name:** `daily-backup`
   - **Recurrence:** Daily (UTC 02:00 recommended)
   - **Retention:** 30 days
   - **Target location:** Multi-region (default)

4. Click **Create**

**Frequency:** Runs automatically every day at 02:00 UTC

**Restore Process:**
- Firebase Console → Firestore → Backups → Select backup → Restore
- ~15-30 minutes for complete database
- Creates new collection (can delete old data after verification)

**Cost:** ~$0.15/GB backed up (one-time per backup)

---

### Method 2: Manual Export to Cloud Storage

**For complete control and archival:**

1. **Enable Firestore Admin API:**
   - Cloud Console → APIs & Services → Enable Firestore Admin API

2. **Export to Cloud Storage:**
   ```bash
   gcloud firestore export gs://your-bucket/firestore-export-$(date +%Y%m%d) \
     --collection-ids='users','pubs','follows','likes','dislikes'
   ```

3. **Schedule with Cloud Scheduler:**
   - Cloud Console → Cloud Scheduler → Create Job
   - Frequency: `0 2 * * *` (daily 2 AM UTC)
   - Execution: HTTP POST to Cloud Function
   - Cloud Function runs the export command

**Restore Process:**
```bash
gcloud firestore import gs://your-bucket/firestore-export-20260102/
```

**Cost:** Storage only (~$0.02/GB/month)

---

## Backup Schedule

| Time | Backup Type | Retention | Cost |
|------|-------------|-----------|------|
| Daily 02:00 UTC | Automated snapshot | 30 days | ~$0.15/GB |
| Weekly (Mon 03:00 UTC) | Manual export | 90 days | ~$0.02/GB/month |
| Monthly (1st at 04:00 UTC) | Archive export | Indefinite | ~$0.02/GB/month |

---

## Disaster Recovery Procedures

### Scenario 1: Accidental Data Deletion

**Time to restore:** < 30 minutes

1. Identify when data was deleted (check Cloud Logging)
2. Select appropriate backup from Firebase Console
3. Click "Restore"
4. Verify data is restored in new collection
5. Delete old corrupted collection if needed

**Prevention:** Enable soft delete protection (if implementing)

---

### Scenario 2: Ransomware/Malicious Data Modification

**Time to restore:** 30 minutes - 2 hours

1. **Immediate:** Cut off app access (disable Firebase API key)
2. **Identify:** Check logs for attack timeframe
3. **Restore:** Use backup from before attack
4. **Verify:** Check data integrity before switching traffic
5. **Secure:** Rotate credentials, enable audit logging

**Prevention:** 
- Firestore security rules (✅ done)
- Cloud Audit Logs enabled
- Monitoring alerts for unusual activity

---

### Scenario 3: Database Corruption

**Time to restore:** 1-4 hours

1. Check backups for point where corruption started
2. Restore from clean backup
3. Identify root cause (check logs)
4. Test thoroughly before returning to production
5. Document incident

---

## Monitoring & Alerting

### Create Alert: Backup Failed

1. Cloud Console → Cloud Monitoring → Alerting Policies → + Create Policy
2. **Metric:** `firestore.googleapis.com/backup/count`
3. **Condition:** Failed backup detected
4. **Notification:** Email/Slack to team

### Create Alert: Database Size Growing Unexpectedly

1. Metric: `firestore.googleapis.com/document_count`
2. Condition: Increases by > 50% in 24 hours
3. Action: Investigate for data loops or bugs

---

## Backup Testing

**Monthly Restore Test (Important!):**

1. Select oldest backup
2. Restore to test database
3. Verify data integrity:
   ```bash
   # Check document counts
   firebase firestore:delete --all-collections
   # After restore, verify counts match
   ```
4. Test critical queries work
5. Document any issues
6. Delete test database

**Never assume backups work until tested.**

---

## Access & Permissions

**Who can manage backups:**
- Project Owner (unrestricted)
- Firebase Admins (with `firestore.admin` IAM role)

**Who can restore:**
- Same as above (sensitive operation)

**Backup location:** Project's default Cloud Storage location

---

## Compliance & Privacy

**Data in backups:**
- All user data is encrypted at rest (Google-managed keys)
- Backups inherit Firestore encryption settings
- No separate encryption key needed

**GDPR Considerations:**
- User deletion requests: Delete from production database
- Backups may retain deleted user data for 30 days
- Document user data deletion in incident logs

---

## Cost Estimation

For 1GB of data:

| Method | Cost/Month |
|--------|-----------|
| Automated backups (30-day retention) | ~$4.50 |
| Cloud Storage exports | ~$0.02 |
| **Total** | **~$4.52** |

*Changes with app size growth proportionally*

---

## Backup Checklist

- [ ] Enable Firestore automated backups (daily, 30-day retention)
- [ ] Set up daily Cloud Scheduler export job
- [ ] Configure monitoring alerts for failed backups
- [ ] Document restore procedures in team wiki
- [ ] Schedule monthly restore testing (add to calendar)
- [ ] Test restore process before going live
- [ ] Verify backups are encrypted at rest
- [ ] Document data privacy/GDPR procedures
- [ ] Train team on restore procedures
- [ ] Create runbook for disaster scenarios

---

## Quick Reference

**To restore from backup:**
1. Firebase Console → Firestore → Backups
2. Select backup → Restore
3. Wait 15-30 minutes
4. Verify data integrity
5. Switch traffic (if new collection)

**To export manually:**
```bash
gcloud firestore export gs://bucket-name/export-$(date +%Y%m%d)/
```

**To import from export:**
```bash
gcloud firestore import gs://bucket-name/export-20260102/
```

---

## Escalation Contact

**If backup fails or restore needed:**

1. **On-call:** [Your on-call email]
2. **Backup owner:** [Team lead]
3. **Firebase support:** [Support ticket]

---

## Related Documents

- PRODUCTION_READINESS.md - Overall launch checklist
- FIRESTORE_RULES_DEPLOYMENT.md - Security rules deployment
- FIREBASE_CONSOLE_SETUP.md - Monitoring setup

