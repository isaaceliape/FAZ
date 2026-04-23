# <i class="fa fa-chart-bar"></i> FASE Adoption Monitoring Guide

This guide shows you how to track FASE's adoption metrics across npm, GitHub, analytics, and community channels.

---

## 1. <i class="fa fa-box"></i> npm Downloads & Package Metrics

### Real-time Dashboard

**Official npm Stats Page:**
```
https://www.npmjs.com/package/fase-ai
```

Look at:
- **Weekly Downloads** (graph shows trend)
- **Dependents** (how many packages depend on fase-ai)
- **Last Publish** (when you publish updates)

### Programmatic Access

**Use npm API to get download stats:**

```bash
# Weekly downloads (last 52 weeks)
curl https://api.npmjs.org/downloads/range/last-year/fase-ai

# Daily downloads (last 30 days)
curl https://api.npmjs.org/downloads/range/last-month/fase-ai

# Specific date range
curl https://api.npmjs.org/downloads/range/2026-04-01:2026-04-30/fase-ai
```

**Parse the JSON:**
```json
{
  "downloads": [
    { "day": "2026-04-01", "downloads": 42 },
    { "day": "2026-04-02", "downloads": 38 }
  ],
  "start": "2026-04-01",
  "end": "2026-04-30",
  "package": "fase-ai"
}
```

### Create a Simple Tracking Script

```bash
#!/bin/bash
# track-npm-downloads.sh

PACKAGE="fase-ai"
DATE=$(date +%Y-%m-%d)

# Get weekly downloads
RESPONSE=$(curl -s https://api.npmjs.org/downloads/range/last-week/${PACKAGE})
WEEKLY=$(echo $RESPONSE | jq '.downloads | map(.downloads) | add')

# Get monthly downloads  
RESPONSE=$(curl -s https://api.npmjs.org/downloads/range/last-month/${PACKAGE})
MONTHLY=$(echo $RESPONSE | jq '.downloads | map(.downloads) | add')

# Log to file
echo "$DATE,weekly=$WEEKLY,monthly=$MONTHLY" >> npm-downloads.csv

# Print
echo "<i class="fa fa-box"></i> npm Downloads ($DATE)"
echo "  Weekly: $WEEKLY"
echo "  Monthly: $MONTHLY"
```

**Run weekly:**
```bash
# Add to crontab
0 9 * * MON /path/to/track-npm-downloads.sh
```

---

## 2. <i class="fa fa-star"></i> GitHub Metrics

### Key Metrics to Track

| Metric | Where to Find | What It Means |
|--------|---------------|---------------|
| **Stars** | GitHub repo header | Overall interest/popularity |
| **Forks** | GitHub repo header | How many are building on FASE |
| **Watchers** | GitHub repo insights | Active followers |
| **Issues** | Issues tab | User feedback + bug reports |
| **Pull Requests** | Pull requests tab | Community contributions |
| **Discussions** | Discussions tab | Community questions + ideas |
| **Releases** | Releases page | Version adoption |

### GitHub API Scripts

**Get repo stats:**

```bash
#!/bin/bash
# track-github-stats.sh

REPO="isaaceliape/FASE"
DATE=$(date +%Y-%m-%d)

# Get repo data
RESPONSE=$(curl -s https://api.github.com/repos/$REPO)

STARS=$(echo $RESPONSE | jq '.stargazers_count')
FORKS=$(echo $RESPONSE | jq '.forks_count')
WATCHERS=$(echo $RESPONSE | jq '.watchers_count')
OPEN_ISSUES=$(echo $RESPONSE | jq '.open_issues_count')

# Log
echo "$DATE,stars=$STARS,forks=$FORKS,watchers=$WATCHERS,issues=$OPEN_ISSUES" >> github-stats.csv

echo "<i class="fa fa-star"></i> GitHub Stats ($DATE)"
echo "  Stars: $STARS"
echo "  Forks: $FORKS"
echo "  Watchers: $WATCHERS"
echo "  Open Issues: $OPEN_ISSUES"
```

**Get contributor activity:**

```bash
# Last 30 days of commits
curl -s https://api.github.com/repos/isaaceliape/FASE/commits?since=2026-03-11T00:00:00Z | \
  jq '.[] | {author: .commit.author.name, date: .commit.author.date}' | \
  wc -l
```

### GitHub Insights Dashboard (Built-in)

1. Go to https://github.com/isaaceliape/FASE
2. Click **Insights** (top menu)
3. Explore:
   - **Traffic** — visitors + clones
   - **Commits** — activity over time
   - **Code frequency** — additions vs deletions
   - **Network** — forks and branches
   - **Members** — contributors

### Track Stars Over Time

```bash
#!/bin/bash
# Create a chart of stars

curl -s https://api.github.com/repos/isaaceliape/FASE | \
  jq '{date: .updated_at, stars: .stargazers_count}' | \
  tee -a github-stars.jsonl

# View trend
tail -10 github-stars.jsonl | jq '.stars'
```

---

## 3. <i class="fa fa-chart-bar"></i> Analytics — Command Usage & Install Base

### Active Installs

**Count unique installIds in analytics log:**

```bash
# Assuming you've setup the backend
# Count unique install IDs that tracked at least one event

SELECT COUNT(DISTINCT installId) as active_installs
FROM analytics_events
WHERE optedIn = true
```

### Top Commands

```sql
SELECT cmd, COUNT(*) as usage_count
FROM analytics_events
WHERE DATE(ts) >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY cmd
ORDER BY usage_count DESC
LIMIT 10;
```

**Expected results:**
- `phase-plan-index` (most used)
- `roadmap-analyze`
- `state-snapshot`
- `verify`
- etc.

### Runtime Popularity

```sql
SELECT runtime, COUNT(*) as usage_count
FROM analytics_events
WHERE DATE(ts) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY runtime
ORDER BY usage_count DESC;
```

**Expected breakdown:**
- Claude Code: ~60%
- OpenCode: ~20%
- Gemini: ~15%
- Codex: ~5%

### Usage Patterns

**Commands per user per week:**

```sql
SELECT 
  installId,
  COUNT(*) as commands_used,
  COUNT(DISTINCT cmd) as unique_commands,
  MIN(ts) as first_use,
  MAX(ts) as last_use
FROM analytics_events
GROUP BY installId
HAVING COUNT(*) > 5;  -- Active users (5+ commands)
```

### Time-of-Day Analysis

```sql
SELECT 
  HOUR(FROM_UNIXTIME(ts)) as hour_of_day,
  COUNT(*) as usage_count
FROM analytics_events
GROUP BY hour_of_day
ORDER BY hour_of_day;
```

Shows when users are most active with FASE.

---

## 4. 🔗 Community & Engagement Metrics

### Social Media Mentions

**Google Alerts:**
1. Go to https://alerts.google.com
2. Create alert for "FASE framework"
3. Get daily email with mentions

**Twitter/X Search:**
```
https://twitter.com/search?q=FASE+framework+lang:pt
https://twitter.com/search?q=fase-ai+código
```

**Reddit:**
```
https://www.reddit.com/r/brasilprogramming/?f=search&q=FASE
https://www.reddit.com/r/brasil_dev/?f=search&q=FASE
```

### Blog Traffic

If you write Dev.to articles:
1. Go to https://dev.to/dashboard
2. Check **Stories** section
3. Track:
   - Views
   - Comments
   - Reactions
   - Read time

### GitHub Discussions

**Count by category:**

```bash
curl -s https://api.github.com/repos/isaaceliape/FASE/discussions | \
  jq 'group_by(.category.name) | map({category: .[0].category.name, count: length})'
```

---

## 5. <i class="fa fa-chart-line"></i> Create a Monitoring Dashboard

### Option A: Simple Google Sheet

Create a shared sheet tracking weekly metrics:

| Date | npm Weekly | npm Monthly | Stars | Forks | Active Installs | Top Command |
|------|-----------|------------|-------|-------|-----------------|-------------|
| 2026-04-10 | 150 | 600 | 45 | 8 | 120 | roadmap-analyze |
| 2026-04-17 | 180 | 750 | 52 | 10 | 145 | state-snapshot |

**Formula to auto-fetch npm data:**
```
=IMPORTDATA("https://api.npmjs.org/downloads/range/last-week/fase-ai")
```

### Option B: Grafana Dashboard

If using Cloudflare Analytics Engine or PostHog:

1. Connect data source
2. Create panels:
   - Timeline of downloads
   - Top commands chart
   - Active installs gauge
   - Runtime popularity pie chart

### Option C: GitHub Actions Automation

Create a workflow that tracks metrics weekly:

```yaml
# .github/workflows/track-metrics.yml
name: Track Adoption Metrics

on:
  schedule:
    - cron: '0 9 * * MON'  # Weekly Monday 9am
  workflow_dispatch:

jobs:
  track:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Get npm stats
        run: |
          STATS=$(curl -s https://api.npmjs.org/downloads/range/last-week/fase-ai)
          echo "NPM_STATS=$STATS" >> $GITHUB_ENV
      
      - name: Get GitHub stats
        run: |
          STATS=$(curl -s https://api.github.com/repos/isaaceliape/FASE)
          STARS=$(echo $STATS | jq '.stargazers_count')
          FORKS=$(echo $STATS | jq '.forks_count')
          echo "STARS=$STARS" >> $GITHUB_ENV
          echo "FORKS=$FORKS" >> $GITHUB_ENV
      
      - name: Update metrics file
        run: |
          echo "$(date): Stars=$STARS, Forks=$FORKS" >> metrics.log
      
      - name: Commit and push
        run: |
          git config user.name "Metrics Bot"
          git config user.email "bot@github.com"
          git add metrics.log
          git commit -m "chore: update adoption metrics"
          git push
```

---

## 6. <i class="fa fa-bullseye"></i> Key Metrics to Watch

### North Star Metric
**Active Installs (unique install IDs with 5+ commands/week)**
- Target: 500 by end of Q2 2026
- Target: 2000 by end of Q3 2026

### Engagement Metrics
| Metric | Baseline | Target (30 days) |
|--------|----------|-----------------|
| npm weekly downloads | 0 | 200+ |
| GitHub stars | 45 | 100+ |
| Active installs | 0 | 300+ |
| Avg commands/user | — | 8+ |
| Community discussions | 0 | 20+ |

### Churn Metrics
- **Users running 0 commands after install** — Target: <30%
- **Weekly active installs** — Track retention

---

## 7. <i class="fa fa-calendar"></i> Monitoring Schedule

### Daily
- Check npm downloads (quick glance)
- Monitor GitHub issues (new feedback)

### Weekly
- Run metrics tracking scripts
- Update dashboard
- Review top commands
- Read community feedback

### Monthly
- Analyze trends
- Write adoption report
- Plan improvements based on metrics
- Share progress with community

---

## 8. <i class="fa fa-wrench"></i> Example Monitoring Setup

### 1. Create metrics directory

```bash
mkdir -p .metrics
cd .metrics
```

### 2. Create tracking scripts

**npm-stats.sh:**
```bash
#!/bin/bash
curl -s "https://api.npmjs.org/downloads/range/last-week/fase-ai" | \
  jq -r '.downloads | map(.downloads) | add' > npm-weekly.txt
```

**github-stats.sh:**
```bash
#!/bin/bash
curl -s "https://api.github.com/repos/isaaceliape/FASE" | \
  jq '{date: now | todateiso8601, stars: .stargazers_count, forks: .forks_count}' | \
  tee -a github-stats.jsonl
```

### 3. Run weekly via cron

```bash
0 9 * * MON /path/to/.metrics/npm-stats.sh
0 9 * * MON /path/to/.metrics/github-stats.sh
```

### 4. Visualize with simple script

```bash
#!/bin/bash
echo "=== FASE Adoption Metrics ==="
echo "npm weekly downloads: $(cat npm-weekly.txt)"
echo "GitHub stats:"
tail -1 github-stats.jsonl | jq '.'
```

---

## 9. 💡 What Metrics Mean

| High Downloads | High Stars | High Installs |
|---|---|---|
| People are discovering FASE | Project is popular/trusted | People are actively using it |
| **Action:** Market more | **Action:** Highlight in README | **Action:** Support users well |

| Declining Commands | Many Issues | Low Engagement |
|---|---|---|
| Users losing interest | Product problems | Need better docs/examples |
| **Action:** Add features | **Action:** Fix bugs quickly | **Action:** Improve onboarding |

---

## 10. 📞 Report Template

**Weekly Adoption Report:**

```markdown
# FASE Adoption Report — Week of Apr 10, 2026

## <i class="fa fa-box"></i> Package Metrics
- npm weekly downloads: **180** (↑ 20% from last week)
- npm monthly total: **750**
- Total downloads all-time: **5,200**

## <i class="fa fa-star"></i> GitHub Metrics
- Stars: **52** (↑ 7 new)
- Forks: **10** (↑ 2 new)
- Open issues: **3**
- Discussions: **5**

## <i class="fa fa-chart-bar"></i> Analytics
- Active installs (opt-in): **145**
- Avg commands/user: **8.2**
- Top command: `roadmap-analyze`
- Most popular runtime: Claude Code (62%)

## <i class="fa fa-comments"></i> Community
- Dev.to article views: **245** (↑ 50)
- Reddit mentions: **3**
- Twitter mentions: **8**

## <i class="fa fa-bullseye"></i> Goals Status
- 🟢 npm downloads on track
- 🟢 GitHub stars growing
- 🟡 Analytics opt-in rate: 35% (target: 40%)
- 🟡 Community engagement: ramping up

## <i class="fa fa-list-check"></i> Actions This Week
- [ ] Post on r/brasilprogramming
- [ ] Respond to GitHub issues
- [ ] Update example projects
```

---

## Resources

- **npm Stats:** https://npm-stat.com/charts.html?package=fase-ai
- **GitHub Insights:** https://github.com/isaaceliape/FASE/pulse
- **npm Package Page:** https://www.npmjs.com/package/fase-ai
- **Google Alerts:** https://alerts.google.com
- **Grafana Cloud (Free):** https://grafana.com/cloud/

---

*Last updated: April 10, 2026*
